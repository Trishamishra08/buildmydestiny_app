import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initialServices, initialMistris, initialProducts, initialCategories, initialCategorySections } from '../utils/mockData.js';
import Service from '../models/Service.js';
import Mistri from '../models/Mistri.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import CategorySection from '../models/CategorySection.js';
import User from '../models/User.js';

dotenv.config();

// Seed records keep their original key as the app-level `id`.
const toAppRecord = ({ _id, id, ...rest }) => ({ id: String(id || _id), ...rest });

/**
 * Insert seed services, mistris, products, categories, and category sections that are not already present.
 */
const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/buildmydestiny');

    for (const [Model, records] of [
      [CategorySection, initialCategorySections],
      [Category, initialCategories],
      [Product, initialProducts],
      [Service, initialServices],
      [Mistri, initialMistris],
    ]) {
      let inserted = 0;
      for (const record of records.map(toAppRecord)) {
        const result = await Model.updateOne({ id: record.id }, { $setOnInsert: record }, { upsert: true });
        inserted += result.upsertedCount;
      }
      console.log(`🌱 ${Model.modelName}: ${inserted} new of ${records.length} seed records`);
    }

    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Delete all services, mistris and users. Requires --force because it is irreversible.
 */
const destroyData = async () => {
  if (!process.argv.includes('--force')) {
    console.error('Refusing to delete data. Re-run with "-d --force" if you really mean it.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/buildmydestiny');

    await Service.deleteMany();
    await Mistri.deleteMany();
    await User.deleteMany();

    console.log('🗑️ Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data destroy: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
