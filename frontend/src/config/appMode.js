/**
 * Which surfaces this build serves, chosen at build time with VITE_APP_MODE:
 *   user  - the customer storefront only; /admin and /vendor are not served
 *   panel - the admin and vendor panels only; the storefront is not served
 *   all   - everything (local development)
 * Production builds default to "user", so a deployment never exposes the panels unless it
 * is explicitly built as a panel site.
 *
 * VITE_PANEL_URL (optional) is the address of the panel site; the storefront uses it for its
 * "Sell on BuildMyDestiny" link.
 */
const mode = String(import.meta.env.VITE_APP_MODE || '').toLowerCase();

export const APP_MODE = ['user', 'panel', 'all'].includes(mode) ? mode : import.meta.env.DEV ? 'all' : 'user';
export const PANELS_ENABLED = APP_MODE !== 'user';
export const USER_APP_ENABLED = APP_MODE !== 'panel';
export const PANEL_URL = String(import.meta.env.VITE_PANEL_URL || '').replace(/\/+$/, '');
