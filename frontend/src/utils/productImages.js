/**
 * Utility to reliably resolve high-definition product images across all views
 */
export const resolveProductImage = (product) => {
  if (!product) return '/images/products/prod_ultratech.png';
  const id = (product.id || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const cat = (product.categorySlug || product.category || '').toLowerCase();

  // Fevicol Adhesive
  if (id.includes('fevicol') || name.includes('fevicol') || name.includes('adhesive')) {
    return '/images/products/prod_fevicol.png';
  }
  // Asian Paints
  if (id.includes('asian') || name.includes('asian paints') || name.includes('tractor') || cat.includes('paint')) {
    return '/images/products/prod_asian_paints.png';
  }
  // UltraTech Cement
  if (id.includes('ultratech') || name.includes('ultratech')) {
    return '/images/products/prod_ultratech.png';
  }
  // Electrical / Polycab Wire / Havells
  if (id.includes('polycab') || name.includes('polycab') || id.includes('wire') || name.includes('wire') || cat.includes('electr')) {
    return '/images/products/prod_polycab.png';
  }
  // Cement
  if (id.includes('cement') || name.includes('cement') || cat.includes('cement')) {
    return '/images/categories/cat_cement.png';
  }
  // Bricks
  if (id.includes('brick') || name.includes('brick') || cat.includes('brick')) {
    return '/images/categories/cat_bricks.png';
  }
  // Steel / TMT
  if (id.includes('steel') || name.includes('steel') || cat.includes('steel')) {
    return '/images/categories/cat_steel.png';
  }
  // Sand
  if (id.includes('sand') || name.includes('sand') || cat.includes('sand')) {
    return '/images/categories/cat_sand.png';
  }
  // Blocks / AAC
  if (id.includes('block') || name.includes('block') || cat.includes('block')) {
    return '/images/categories/cat_blocks.png';
  }
  // Tiles / Flooring
  if (id.includes('tile') || name.includes('tile') || cat.includes('tile')) {
    return '/images/categories/cat_tiles.png';
  }
  // Plumbing / CPVC Pipes
  if (id.includes('pipe') || name.includes('pipe') || cat.includes('plumb')) {
    return '/images/categories/cat_plumbing.png';
  }

  if (product.image && typeof product.image === 'string' && !product.image.includes('unsplash.com')) {
    return product.image;
  }
  return '/images/products/prod_ultratech.png';
};
