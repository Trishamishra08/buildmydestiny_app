import mongoose from 'mongoose';

/**
 * Bring every registered model's indexes in line with its schema. This creates each
 * collection on first run (so it appears in MongoDB tools immediately) and drops stale
 * indexes left behind by earlier schema versions, such as a unique `slug` index that
 * would reject records without a slug.
 */
const syncModelIndexes = async () => {
  for (const model of Object.values(mongoose.models)) {
    try {
      await model.syncIndexes();
    } catch (error) {
      console.warn(`⚠️ Could not sync indexes for ${model.modelName}: ${error.message}`);
    }
  }
  console.log(`🗂️  Synced indexes for ${Object.keys(mongoose.models).length} collections`);
};

/**
 * Connect to MongoDB Database
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/buildmydestiny');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await syncModelIndexes();
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Failed: ${error.message}`);
    console.warn('ℹ️ Data endpoints will return errors until the database is reachable.');
    return false;
  }
};

export default connectDB;
