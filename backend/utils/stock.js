import Product from '../models/Product.js';

const totals = (items = []) => {
  const byProduct = new Map();
  for (const line of items) {
    const id = line?.product?.id;
    if (id) byProduct.set(id, (byProduct.get(id) || 0) + (Number(line.quantity) || 0));
  }
  return byProduct;
};

/** Take ordered quantities out of stock (only products that track a numeric stock count). */
export const reserveStock = async (items) => {
  const byProduct = totals(items);
  await Promise.all(
    [...byProduct].map(([id, qty]) =>
      Product.updateOne({ id, stockCount: { $type: 'number' } }, { $inc: { stockCount: -qty } })
    )
  );
  // Anything that ran out can no longer be bought.
  await Product.updateMany({ id: { $in: [...byProduct.keys()] }, stockCount: { $lte: 0 } }, { $set: { stockCount: 0, inStock: false } });
};

/** Put the quantities of a cancelled order back on the shelf. */
export const releaseStock = async (items) => {
  const byProduct = totals(items);
  await Promise.all(
    [...byProduct].map(([id, qty]) =>
      Product.updateOne({ id, stockCount: { $type: 'number' } }, { $inc: { stockCount: qty } })
    )
  );
  await Product.updateMany({ id: { $in: [...byProduct.keys()] }, stockCount: { $gt: 0 } }, { $set: { inStock: true } });
};
