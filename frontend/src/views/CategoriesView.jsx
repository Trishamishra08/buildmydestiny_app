import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight, Layers } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, CATEGORY_SECTIONS } from '../data/mockData';
import CategoryCard from '../components/CategoryCard';

export const CategoriesView = () => {
  const { navigateTo, categorySections, categories } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const searchKeywords = [
    'Fevicol',
    'Cement',
    'Havells Wires',
    'CenturyPly',
    'Asian Paints',
    'Action Tesa HDHMR',
    'Kajaria Tiles',
    'Godrej Locks',
  ];

  // Rotate placeholder keyword every 2.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchKeywords.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      navigateTo('search', { query: searchTerm });
    } else {
      navigateTo('search', { query: searchKeywords[placeholderIndex] });
    }
  };

  // Build every section from the live category list or seeded fallback
  const sectionRecords = (categorySections && categorySections.length > 0) ? categorySections : CATEGORY_SECTIONS;
  const liveCategories = (categories && categories.length > 0)
    ? categories.filter((cat) => cat && cat.isActive !== false)
    : CATEGORIES;

  const sectionKey = (value) => String(value || '').trim().toLowerCase();
  const sectionsToUse = [];
  const byKey = new Map();

  sectionRecords.forEach((section) => {
    if (section.isActive === false) return;
    const entry = { ...section, categories: [] };
    sectionsToUse.push(entry);
    byKey.set(sectionKey(section.title || section.name), entry);
    if (section.id) byKey.set(`id:${section.id}`, entry);
    if (section.slug) byKey.set(`slug:${section.slug}`, entry);
  });

  liveCategories.forEach((cat) => {
    const secName = cat.section || cat.sectionName || '';
    let entry = (cat.sectionId && byKey.get(`id:${cat.sectionId}`)) ||
                (secName && byKey.get(sectionKey(secName))) ||
                sectionsToUse.find((s) => Array.isArray(s.categories) && (s.categories.includes(cat.id) || s.categories.includes(cat.slug)));

    if (!entry) {
      const fallbackTitle = secName || 'Other Materials';
      entry = byKey.get(sectionKey(fallbackTitle));
      if (!entry) {
        entry = { id: `sec_auto_${sectionKey(fallbackTitle)}`, title: fallbackTitle, slug: sectionKey(fallbackTitle).replace(/[^a-z0-9]+/g, '-'), categories: [] };
        sectionsToUse.push(entry);
        byKey.set(sectionKey(fallbackTitle), entry);
      }
    }
    if (!entry.categories.some((c) => (c.id && c.id === cat.id) || (c.slug && c.slug === cat.slug))) {
      entry.categories.push(cat);
    }
  });

  // Filter sections and categories based on search input
  const filteredSections = sectionsToUse.map((section) => {
    const matchingCats = (section.categories || []).filter(
      (cat) =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        section.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return {
      ...section,
      categories: matchingCats,
    };
  }).filter((section) => section.categories && section.categories.length > 0);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        paddingBottom: '85px',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '12px 14px 28px 14px',
        }}
      >
        {/* 1. Top Search Bar */}
        <div style={{ marginBottom: '20px', position: 'sticky', top: '8px', zIndex: 100 }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              padding: '2px 8px 2px 14px',
              height: '48px',
            }}
          >
            <Search size={20} color="var(--primary-navy)" strokeWidth={2.3} style={{ flexShrink: 0, marginRight: '10px' }} />

            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder=""
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.94rem',
                  fontWeight: '600',
                  color: 'var(--primary-navy)',
                  zIndex: 2,
                }}
              />

              {/* Dynamic Rich Placeholder with Green Keyword */}
              {!searchTerm && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    fontSize: '0.94rem',
                    fontWeight: '600',
                    color: '#64748B',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>Search for</span>
                  <span
                    style={{
                      color: '#0A0A0A',
                      fontWeight: '700',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {searchKeywords[placeholderIndex]}
                  </span>
                </div>
              )}
            </div>

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            )}
          </form>
        </div>

        {/* 2. Category Sections */}
        {filteredSections.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            {filteredSections.map((section) => (
              <div key={section.id}>
                {/* Section Title */}
                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: '800',
                    color: 'var(--primary-navy)',
                    letterSpacing: '-0.02em',
                    marginBottom: '14px',
                    paddingLeft: '2px',
                  }}
                >
                  {section.title}
                </h2>

                {/* 4-Column Responsive Grid with CategoryCard */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '14px 10px',
                  }}
                >
                  {section.categories.map((cat) => (
                    <CategoryCard key={cat.id || cat.slug} category={cat} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
            }}
          >
            <Layers size={36} color="var(--primary-orange)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-navy)', marginBottom: '6px' }}>
              {searchTerm ? `No categories match "${searchTerm}"` : 'No categories available yet'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: searchTerm ? '16px' : '0' }}>
              {searchTerm ? 'Try searching for another keyword.' : 'Categories created by the admin will appear here.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  backgroundColor: 'var(--primary-navy)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '8px 20px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '12px',
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesView;
