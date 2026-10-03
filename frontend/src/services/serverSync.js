import { useCallback, useEffect, useRef } from 'react';
import api from './api';

/**
 * Keeps the store's collections in step with the MongoDB-backed API.
 *
 * The store's CRUD functions only change React state. This hook loads each collection
 * from the server, then watches it: whenever a collection changes it compares it with
 * the last known server copy and sends just the records that were added, changed or
 * removed. localStorage remains an offline cache for the first paint.
 *
 * Access modes
 *   read:  'public' - anyone          'owner' - a signed-in shopper (their own records) or an admin
 *          'admin'  - admins only
 *   write: 'admin'  - admins only     'owner' - shoppers create their own, admins manage all
 *          'public' - anyone creates, admins manage all      'none' - never written from the app
 */
export const SYNC_COLLECTIONS = [
  { name: 'products', path: '/products', key: 'id', read: 'public', write: 'admin' },
  { name: 'categories', path: '/categories', key: 'id', read: 'public', write: 'admin' },
  { name: 'categorySections', path: '/category-sections', key: 'id', read: 'public', write: 'admin' },
  { name: 'services', path: '/services', key: 'id', read: 'public', write: 'admin' },
  { name: 'mistris', path: '/mistris', key: 'id', read: 'public', write: 'admin' },
  { name: 'banners', path: '/banners', key: 'id', read: 'public', write: 'admin' },
  { name: 'faqs', path: '/faqs', key: 'category', read: 'public', write: 'admin' },
  { name: 'coupons', path: '/coupons', key: 'code', read: 'public', write: 'admin' },
  {
    name: 'cities',
    path: '/cities',
    key: 'name',
    read: 'public',
    write: 'admin',
    // The store keeps cities as plain strings.
    toServer: (city) => ({ name: city }),
    fromServer: (doc) => doc.name,
    keyOf: (city) => city,
  },
  { name: 'orders', path: '/orders', key: 'id', read: 'owner', write: 'owner', poll: true },
  { name: 'bookings', path: '/bookings', key: 'id', read: 'owner', write: 'owner', poll: true },
  // Guests may submit a quotation without signing in, so writes must be 'public' (not
  // 'owner') or an anonymous submission is silently dropped. Only admins ever list them.
  { name: 'quotations', path: '/quotations', key: 'id', read: 'admin', write: 'public', poll: true },
  { name: 'supportMessages', path: '/support-messages', key: 'id', read: 'admin', write: 'public', poll: true },
  { name: 'adminNotifications', path: '/admin/notifications', key: 'id', read: 'admin', write: 'admin', poll: true },
  { name: 'usersList', path: '/admin/users', key: 'id', read: 'admin', write: 'admin', poll: true },
];

const PUSH_DELAY_MS = 400;
const POLL_INTERVAL_MS = 30000;
// How often every visitor re-reads the public catalogue (products, categories, ...), so
// what an admin adds or deletes reaches open storefronts without a reload.
const CATALOG_REFRESH_MS = 60000;
const FOCUS_REFRESH_MIN_GAP_MS = 15000;

// Key-order independent serialisation, so the same record always compares equal.
const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .filter((k) => value[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const keyFn = (cfg) => cfg.keyOf || ((item) => item?.[cfg.key]);

const toSnapshot = (cfg, items) => {
  const getKey = keyFn(cfg);
  const map = new Map();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const k = getKey(item);
    if (k !== undefined && k !== null && k !== '') map.set(String(k), stableStringify(item));
  });
  return map;
};

const canRead = (cfg, session) =>
  cfg.read === 'public' ||
  (cfg.read === 'owner' && (session.isAdmin || session.isUser)) ||
  (cfg.read === 'admin' && session.isAdmin);

/**
 * @param {object}   params.collections  { [name]: [state, setState] } for every SYNC_COLLECTIONS entry
 * @param {Array}    params.settings     [siteSettings, setSiteSettings]
 * @param {Array}    params.account      [{ addresses, wishlist }, { setAddresses, setWishlist }]
 * @param {object}   params.session      { isAdmin, isUser, userKey }
 * @param {Function} params.onError      (message) => void, shown to the person using the app
 * @param {Function} params.onNewItems   (name, items) => void, for records that appeared on the server
 * @param {Function} params.onLoaded     (name, items) => void, after a collection was loaded from the server
 * @param {Function} params.onAuthError  (err, session: 'admin' | 'user') => void, when the server rejects a sign-in
 * @returns {{ reloadFromServer: () => Promise<void>, markSynced: (name: string, item: object) => void }}
 */
export const useServerSync = ({ collections, settings, account, session, onError, onNewItems, onLoaded, onAuthError }) => {
  const snapshots = useRef({}); // name -> Map(key -> serialised record) of the server copy
  const hydrated = useRef({}); // name -> true once loaded, pushes wait for this
  const timers = useRef({});
  const busy = useRef({}); // name -> push in flight
  const pending = useRef({}); // name -> a push is scheduled but not finished
  const previousValues = useRef({});
  const generation = useRef(0); // bumps on sign-in/out so late responses from the old session are ignored
  const latest = useRef({}); // name -> latest state, read by async code
  const settingsSnapshot = useRef(null);
  const accountSnapshot = useRef(null);
  const sessionRef = useRef(session);
  const callbacks = useRef({ onError, onNewItems, onLoaded, onAuthError });

  sessionRef.current = session;
  callbacks.current = { onError, onNewItems, onLoaded, onAuthError };
  SYNC_COLLECTIONS.forEach((cfg) => {
    latest.current[cfg.name] = collections[cfg.name]?.[0];
  });
  latest.current.__settings = settings[0];
  latest.current.__account = account[0];

  const reportError = useCallback((what, err, sessionKind = 'admin') => {
    // Unreachable server: stay quiet, the cached data is still usable.
    if (err?.status === 0) return;
    // A rejected or expired sign-in is a session problem, not a data problem.
    if ((err?.status === 401 || err?.status === 403) && callbacks.current.onAuthError) {
      callbacks.current.onAuthError(err, sessionKind);
      return;
    }
    callbacks.current.onError?.(`Could not save ${what} to the server: ${err?.message || 'unknown error'}`);
  }, []);

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  const loadCollection = useCallback(async (cfg, { initial = false } = {}) => {
    const sess = sessionRef.current;
    const gen = generation.current;
    const setState = collections[cfg.name]?.[1];
    if (!setState) return;

    if (!canRead(cfg, sess)) {
      // Nothing this session may see: drop any cached copy (e.g. a previous shopper's
      // orders) and start from an empty baseline so new records are still sent.
      snapshots.current[cfg.name] = new Map();
      hydrated.current[cfg.name] = true;
      setState([]);
      return;
    }

    let res;
    try {
      res = await api.collection.list(cfg.path, { quiet: true, auth: cfg.read === 'admin' ? 'admin' : undefined });
    } catch (err) {
      // Keep the cached copy but do not push it: it may be stale.
      if (initial && gen === generation.current) hydrated.current[cfg.name] = false;
      return;
    }
    if (gen !== generation.current) return;

    const serverItems = (res?.data || []).map(cfg.fromServer || ((x) => x));
    const local = latest.current[cfg.name] || [];

    // Admin safety net: if the local cache has records that are missing on the server,
    // merge them and schedule a push to MongoDB rather than discarding the administrator's additions.
    if (initial && cfg.write === 'admin' && sess.isAdmin && Array.isArray(local) && local.length > 0) {
      const getKey = keyFn(cfg);
      const serverKeySet = new Set(serverItems.map((item) => String(getKey(item))));
      const missingOnServer = local.filter((item) => {
        const k = getKey(item);
        return k !== undefined && k !== null && k !== '' && !serverKeySet.has(String(k));
      });

      if (missingOnServer.length > 0) {
        const merged = [...serverItems, ...missingOnServer];
        snapshots.current[cfg.name] = toSnapshot(cfg, serverItems);
        hydrated.current[cfg.name] = true;
        setState(merged);
        callbacks.current.onLoaded?.(cfg.name, merged);
        schedulePush(cfg);
        return;
      }
    }

    const nextSnapshot = toSnapshot(cfg, serverItems);
    const previous = snapshots.current[cfg.name];

    // Determine if data has actually changed compared to our previous server snapshot
    let hasChanged = !previous || previous.size !== nextSnapshot.size;
    if (!hasChanged && previous) {
      for (const [k, v] of nextSnapshot.entries()) {
        if (previous.get(k) !== v) {
          hasChanged = true;
          break;
        }
      }
    }

    snapshots.current[cfg.name] = nextSnapshot;
    hydrated.current[cfg.name] = true;

    // Only update React state if the data is genuinely new or on initial load
    if (initial || hasChanged) {
      setState(serverItems);
      callbacks.current.onLoaded?.(cfg.name, serverItems);
    }

    if (!initial && previous && callbacks.current.onNewItems) {
      const getKey = keyFn(cfg);
      const fresh = serverItems.filter((item) => !previous.has(String(getKey(item))));
      if (fresh.length) callbacks.current.onNewItems(cfg.name, fresh);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pushSettings = async () => {
    try {
      await api.updateSettings(latest.current.__settings);
      settingsSnapshot.current = stableStringify(latest.current.__settings);
    } catch (err) {
      reportError('settings', err);
    }
  };

  const loadSettings = useCallback(async () => {
    const gen = generation.current;
    try {
      const res = await api.getSettings();
      if (gen !== generation.current) return;
      if (res?.data) {
        const merged = { ...latest.current.__settings, ...res.data };
        const serialized = stableStringify(merged);
        if (settingsSnapshot.current !== serialized) {
          settingsSnapshot.current = serialized;
          settings[1](merged);
        }
      } else if (sessionRef.current.isAdmin) {
        // Nothing saved on the server yet: store this administrator's settings.
        settingsSnapshot.current = '';
        pushSettings();
      } else {
        settingsSnapshot.current = stableStringify(latest.current.__settings);
      }
    } catch (err) {
      settingsSnapshot.current = null;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAccount = useCallback(async () => {
    const gen = generation.current;
    accountSnapshot.current = null;
    if (!sessionRef.current.isUser) return;
    try {
      const res = await api.getAccountData();
      if (gen !== generation.current) return;
      const server = res?.data || {};
      const local = latest.current.__account || {};
      const next = {
        // Keep this browser's list when the account has nothing stored yet.
        addresses: server.addresses?.length ? server.addresses : local.addresses || [],
        wishlist: server.wishlist?.length ? server.wishlist : local.wishlist || [],
      };
      const serialized = stableStringify({ addresses: server.addresses || [], wishlist: server.wishlist || [] });
      if (accountSnapshot.current !== serialized) {
        accountSnapshot.current = serialized;
        account[1].setAddresses(next.addresses);
        account[1].setWishlist(next.wishlist);
      }
    } catch (err) {
      accountSnapshot.current = null;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reloadFromServer = useCallback(async () => {
    await Promise.all([
      ...SYNC_COLLECTIONS.map((cfg) => loadCollection(cfg)),
      loadSettings(),
      loadAccount(),
    ]);
  }, [loadCollection, loadSettings, loadAccount]);

  // ---------------------------------------------------------------------------
  // Pushing
  // ---------------------------------------------------------------------------

  const pushCollection = async (cfg) => {
    if (busy.current[cfg.name]) {
      schedulePush(cfg); // try again once the current push finishes
      return;
    }
    const sess = sessionRef.current;
    if (!hydrated.current[cfg.name] || cfg.write === 'none') return;

    const items = latest.current[cfg.name] || [];
    const snapshot = snapshots.current[cfg.name] || new Map();
    const getKey = keyFn(cfg);
    const toServer = cfg.toServer || ((x) => x);

    const current = new Map();
    items.forEach((item) => {
      const k = getKey(item);
      if (k !== undefined && k !== null && k !== '') current.set(String(k), item);
    });

    const ops = [];
    current.forEach((item, k) => {
      const serialised = stableStringify(item);
      if (snapshot.get(k) === serialised) return;
      const isNew = !snapshot.has(k);

      if (isNew && cfg.write === 'owner' && sess.isUser) {
        // Created by the shopper, so send it as them: the server links it to their account.
        ops.push({ k, serialised, run: () => api.collection.create(cfg.path, toServer(item), { auth: 'user', quiet: true }) });
      } else if (sess.isAdmin) {
        ops.push({ k, serialised, run: () => api.collection.save(cfg.path, k, toServer(item), { auth: 'admin', quiet: true }) });
      } else if (isNew && cfg.write === 'public') {
        ops.push({ k, serialised, run: () => api.collection.create(cfg.path, toServer(item), { auth: 'user', quiet: true }) });
      }
    });

    if (sess.isAdmin && cfg.write !== 'none') {
      snapshot.forEach((_v, k) => {
        if (!current.has(k)) {
          ops.push({ k, serialised: null, run: () => api.collection.remove(cfg.path, k, { auth: 'admin', quiet: true }) });
        }
      });
    }

    if (!ops.length) {
      pending.current[cfg.name] = false;
      return;
    }

    busy.current[cfg.name] = true;
    let failure = null;
    for (const op of ops) {
      try {
        await op.run();
        if (op.serialised === null) snapshot.delete(op.k);
        else snapshot.set(op.k, op.serialised);
      } catch (err) {
        if (err?.status === 409) {
          snapshot.set(op.k, op.serialised); // already on the server
        } else {
          failure = failure || err;
        }
      }
    }
    snapshots.current[cfg.name] = snapshot;
    busy.current[cfg.name] = false;
    pending.current[cfg.name] = false;
    if (failure) reportError(cfg.name, failure, sess.isAdmin ? 'admin' : 'user');
  };

  const schedulePush = (cfg) => {
    pending.current[cfg.name] = true;
    clearTimeout(timers.current[cfg.name]);
    timers.current[cfg.name] = setTimeout(() => pushCollection(cfg), PUSH_DELAY_MS);
  };

  // Push whichever collections changed since the last render.
  const collectionValues = SYNC_COLLECTIONS.map((cfg) => collections[cfg.name]?.[0]);
  useEffect(() => {
    SYNC_COLLECTIONS.forEach((cfg, i) => {
      const value = collectionValues[i];
      if (previousValues.current[cfg.name] === value) return;
      previousValues.current[cfg.name] = value;
      if (hydrated.current[cfg.name]) schedulePush(cfg);
    });
  }, collectionValues); // eslint-disable-line react-hooks/exhaustive-deps

  // Settings (single document, admin only)
  useEffect(() => {
    if (!sessionRef.current.isAdmin || settingsSnapshot.current === null) return;
    const serialised = stableStringify(settings[0]);
    if (serialised === settingsSnapshot.current) return;
    clearTimeout(timers.current.__settings);
    timers.current.__settings = setTimeout(pushSettings, PUSH_DELAY_MS);
  }, [settings[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  // Saved addresses & wishlist (per signed-in shopper)
  const accountValue = account[0];
  useEffect(() => {
    if (!sessionRef.current.isUser || accountSnapshot.current === null) return;
    const serialised = stableStringify(accountValue);
    if (serialised === accountSnapshot.current) return;
    clearTimeout(timers.current.__account);
    timers.current.__account = setTimeout(async () => {
      try {
        await api.saveAccountData(latest.current.__account);
        accountSnapshot.current = stableStringify(latest.current.__account);
      } catch (err) {
        reportError('your saved addresses', err, 'user');
      }
    }, PUSH_DELAY_MS);
  }, [accountValue.addresses, accountValue.wishlist]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  // Load everything on start and whenever someone signs in or out.
  useEffect(() => {
    Object.values(timers.current).forEach(clearTimeout);
    generation.current += 1;
    hydrated.current = {};
    pending.current = {};
    SYNC_COLLECTIONS.forEach((cfg) => loadCollection(cfg, { initial: true }));
    loadSettings();
    loadAccount();
  }, [session.userKey, session.isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Administrators see new orders, messages and notifications without reloading.
  useEffect(() => {
    if (!session.isAdmin) return undefined;
    const timer = setInterval(() => {
      SYNC_COLLECTIONS.filter((cfg) => cfg.poll && !busy.current[cfg.name] && !pending.current[cfg.name]).forEach((cfg) => loadCollection(cfg));
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [session.isAdmin, loadCollection]);

  // Everyone: re-read the public catalogue periodically and when the tab regains focus,
  // so products an admin adds or deletes show up (or disappear) without a reload.
  useEffect(() => {
    let lastRefresh = Date.now();
    const refresh = () => {
      lastRefresh = Date.now();
      SYNC_COLLECTIONS.filter((cfg) => cfg.read === 'public' && !busy.current[cfg.name] && !pending.current[cfg.name]).forEach((cfg) => loadCollection(cfg));
      // Admins edit settings themselves; everyone else picks up changed fees and GST.
      if (!sessionRef.current.isAdmin) loadSettings();
    };
    const onFocus = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefresh > FOCUS_REFRESH_MIN_GAP_MS) refresh();
    };
    const timer = setInterval(refresh, CATALOG_REFRESH_MS);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [loadCollection, loadSettings]);

  // Record that an item was already saved by a direct API call, so it is not sent again.
  const markSynced = useCallback((name, item) => {
    const cfg = SYNC_COLLECTIONS.find((c) => c.name === name);
    if (!cfg) return;
    const k = keyFn(cfg)(item);
    if (k === undefined || k === null || k === '') return;
    if (!snapshots.current[name]) snapshots.current[name] = new Map();
    snapshots.current[name].set(String(k), stableStringify(item));
  }, []);

  return { reloadFromServer, markSynced };
};

export default useServerSync;
