import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const purgeDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/buildmydestiny';
  console.log(`📡 Connecting to MongoDB: ${mongoUri.split('@').pop() || mongoUri}...`);

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections in database.`);

    for (const collection of collections) {
      const collName = collection.name;
      // Skip system collections if any
      if (collName.startsWith('system.')) continue;
      
      const countBefore = await mongoose.connection.db.collection(collName).countDocuments();
      await mongoose.connection.db.collection(collName).deleteMany({});
      console.log(`🗑️ Cleared collection "${collName}": deleted ${countBefore} documents.`);
    }

    console.log('✨ All MongoDB database collections have been purged clean!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error purging database: ${error.message}`);
    process.exit(1);
  }
};

purgeDatabase();
