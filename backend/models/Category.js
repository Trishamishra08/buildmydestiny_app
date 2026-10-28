import { createAppModel, Mixed } from './appModel.js';

// Parent categories. Sub categories are stored inline in `subcategories`.
const Category = createAppModel('Category', {
  collection: 'categories',
  fields: {
    name: { type: String, trim: true },
    slug: { type: String, trim: true, index: true },
    section: Mixed,
    description: Mixed,
    image: Mixed,
    subcategories: [Mixed],
    subcategoryImages: Mixed,
    isActive: Mixed,
    // Defaults every product in this category inherits (a vendor may override GST / HSN per product).
    gstRatePercent: Mixed,
    hsnCode: Mixed,
    // Platform commission (% of taxable value) charged to the vendor on sales in this category.
    commissionPercent: Mixed,
    createdOn: Mixed,
    lastUpdated: Mixed,
  },
});

export default Category;
