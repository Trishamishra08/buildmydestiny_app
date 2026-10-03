import React, { useState, useMemo, useEffect } from 'react';
import { Filter, ArrowUpDown, Layers, SlidersHorizontal, ChevronRight, RotateCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES as INITIAL_CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import MobileFilterDrawer from '../components/MobileFilterDrawer';

export const ProductListingView = () => {
  const { viewParams, navigateTo, products, categories } = useStore();
  const initialSlug = viewParams?.slug || 'all';

  const productList = products && products.length > 0 ? products : INITIAL_PRODUCTS;
  const categoryList = categories && categories.length > 0 ? categories : INITIAL_CATEGORIES;

  // Calculate max price limit across products
  const maxPriceLimit = useMemo(() => {
    const prices = productList.map((p) => Number(p.price) || 0);
    return Math.max(70000, ...prices);
  }, [productList]);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialSlug);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState(maxPriceLimit);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (viewParams?.slug) {
      setSelectedCategory(viewParams.slug);
    }
  }, [viewParams?.slug]);

  useEffect(() => {
    setPriceRange((prev) => (prev < maxPriceLimit ? maxPriceLimit : prev));
  }, [maxPriceLimit]);

  // Active Category Details
  const activeCategory = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return null;
    const norm = selectedCategory.toLowerCase().trim();
    return categoryList.find(
      (c) =>
        c.slug?.toLowerCase().trim() === norm ||
        c.name?.toLowerCase().trim() === norm ||
        c.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === norm
    );
  }, [selectedCategory, categoryList]);

  // Available brands in the dataset
  const availableBrands = useMemo(() => {
    const brands = new Set();
    productList.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        if (selectedCategory === 'all') {
          brands.add(p.brand.trim());
        } else {
          const normSelected = selectedCategory.toLowerCase().trim();
          const pCatSlug = (p.categorySlug || '').toLowerCase().trim();
          const pCatName = (p.category || '').toLowerCase().trim();
          const pCatNameSlug = pCatName.replace(/[^a-z0-9]+/g, '-');
          if (pCatSlug === normSelected || pCatName === normSelected || pCatNameSlug === normSelected) {
            brands.add(p.brand.trim());
          }
        }
      }
    });
    return Array.from(brands);
  }, [selectedCategory, productList]);

  const handleToggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setPriceRange(maxPriceLimit);
    setInStockOnly(false);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      // Category Filter
      if (selectedCategory && selectedCategory !== 'all') {
        const normSelected = selectedCategory.toLowerCase().trim();
        const pCatSlug = (product.categorySlug || '').toLowerCase().trim();
        const pCatName = (product.category || '').toLowerCase().trim();
        const pCatNameSlug = pCatName.replace(/[^a-z0-9]+/g, '-');
        const isMatch =
          pCatSlug === normSelected ||
          pCatName === normSelected ||
          pCatNameSlug === normSelected;
        if (!isMatch) return false;
      }
      // Brand Filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }
      // Price Filter
      if (Number(product.price) > priceRange) {
        return false;
      }
      // In Stock Filter
      if (inStockOnly && !product.inStock) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      return 0; // Default popular
    });
  }, [selectedCategory, selectedBrands, priceRange, inStockOnly, sortBy, productList]);

  return (
    <div className="container page-container">
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
        <button onClick={() => navigateTo('home')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Home</button>
        <span>/</span>
        <button onClick={() => navigateTo('categories')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Categories</button>
        <span>/</span>
        <span style={{ color: 'var(--primary-navy)', fontWeight: '700' }}>
          {activeCategory ? activeCategory.name : 'All Construction Materials'}
        </span>
      </div>

      {/* Category Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: 'clamp(1.15rem, 3.5vw, 1.75rem) clamp(1.15rem, 3.5vw, 2rem)',
          marginBottom: '1.5rem',
          borderLeft: '5px solid var(--primary-orange)',
        }}
      >
        <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.85rem)', color: '#FFFFFF', marginBottom: '0.4rem', lineHeight: 1.3 }}>
          {activeCategory ? activeCategory.name : 'All Construction Materials'}
        </h1>
        <p style={{ color: '#CBD5E1', fontSize: '0.875rem', maxWidth: '720px', lineHeight: 1.5 }}>
          {activeCategory
            ? activeCategory.description
            : 'Explore certified construction materials with wholesale contractor pricing and crane/dumper site delivery.'}
        </p>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Desktop Filter Sidebar */}
        <FilterSidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedBrands={selectedBrands}
          onToggleBrand={handleToggleBrand}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          inStockOnly={inStockOnly}
          onToggleInStock={() => setInStockOnly(!inStockOnly)}
          onResetFilters={handleResetFilters}
          availableBrands={availableBrands}
          categories={categoryList}
          maxPriceLimit={maxPriceLimit}
        />

        {/* Products Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top Control Bar: Count + Mobile Filter Trigger + Sort Dropdown */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--primary-navy)' }}>{filteredProducts.length}</strong> construction materials
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="btn btn-secondary btn-sm hide-on-desktop"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <SlidersHorizontal size={14} color="var(--primary-orange)" />
                <span>Filters</span>
              </button>

              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.825rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
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
                <Filter size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                {productList.length === 0 ? 'No products available in the store yet' : 'No materials matched your filter criteria'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                {productList.length === 0
                  ? 'Products added from the Admin Panel will be listed here instantly.'
                  : 'Try adjusting your price filter range or uncheck specific brand filters to view all available stock.'}
              </p>
              {productList.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', gap: '6px' }}
                >
                  <RotateCcw size={16} />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedBrands={selectedBrands}
        onToggleBrand={handleToggleBrand}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        inStockOnly={inStockOnly}
        onToggleInStock={() => setInStockOnly(!inStockOnly)}
        onResetFilters={handleResetFilters}
        availableBrands={availableBrands}
        categories={categoryList}
        maxPriceLimit={maxPriceLimit}
      />
    </div>
  );
};

export default ProductListingView;
