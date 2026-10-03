import { createAppModel, Mixed } from './appModel.js';

// price, mrp, stockCount and inStock are normalised by the admin panel before saving,
// so they are strictly typed. Free-form form fields stay Mixed so a save is never rejected.
const Product = createAppModel('Product', {
  collection: 'products',
  fields: {
    name: { type: String, trim: true },
    slug: { type: String, trim: true, index: true },
    category: Mixed,
    categorySlug: { type: String, index: true },
    subcategory: Mixed,
    section: Mixed,
    brand: Mixed,
    unit: Mixed,
    description: Mixed,
    price: Number,
    mrp: Number,
    stockCount: Number,
    inStock: Boolean,
    image: Mixed,
    gallery: [Mixed],
    isFeatured: Mixed,
    isPopular: Mixed,
    // Multivendor marketplace: set when a vendor (not the platform admin) lists this product.
    vendorId: { type: String, index: true },
    vendorName: Mixed,
  },
});

export default Product;
