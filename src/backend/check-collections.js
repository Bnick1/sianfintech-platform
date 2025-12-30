import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const checkCollections = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📁 EXISTING COLLECTIONS:');
    collections.forEach(col => console.log(' -', col.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkCollections();