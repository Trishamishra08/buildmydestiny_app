import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, RotateCcw, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export const SearchResultsView = () => {
  const { viewParams, navigateTo, products } = useStore();
  const initialQuery = viewParams?.query || viewParams?.q || '';
  const [query, setQuery] = useState(initialQuery);

  const productList = products && products.length > 0 ? products : PRODUCTS;

  useEffect(() => {
    if (viewParams?.query !== undefined || viewParams?.q !== undefined) {
      setQuery(viewParams?.query || viewParams?.q || '');
    }
  }, [viewParams?.query, viewParams?.q]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return productList;
    const lower = query.toLowerCase();
    return productList.filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.category?.toLowerCase().includes(lower) ||
        p.brand?.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower)
    );
  }, [query, productList]);

  return (
    <div className="container page-container">
      {/* Search Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">
          Search Results for "{query}"
        </h1>
        <p className="page-subtitle">
          Found <strong style={{ color: 'var(--primary-orange)' }}>{searchResults.length}</strong> matching materials in BuildMyDestiny catalog
        </p>

        {/* Quick Suggestion Pills */}
        <div className="tab-scroll-container" style={{ marginTop: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', flexShrink: 0 }}>Popular:</span>
          {['UltraTech OPC 53', 'Tata Tiscon 550D', 'AAC Blocks', 'Kajaria Vitrified', 'Asian Paints Apex', 'Havells FR Wire', 'Supreme SWR Pipe'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                navigateTo('search', { query: term });
              }}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: query.toLowerCase() === term.toLowerCase() ? 'var(--primary-navy)' : 'var(--bg-surface)',
                color: query.toLowerCase() === term.toLowerCase() ? '#FFFFFF' : 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: '600',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {searchResults.length > 0 ? (
        <div className="product-grid">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--light-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--primary-orange)' }}>
            <Search size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
            No construction materials found for "{query}"
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
            Check for spelling errors or try searching for generic trade terms like "Cement", "TMT Steel", "Tiles", "Pipes", or "Paint".
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              navigateTo('categories');
            }}
            className="btn btn-primary"
          >
            Browse All 12 Categories
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsView;
