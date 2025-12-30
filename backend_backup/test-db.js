// test-db.js - ES Module version
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('🧪 Testing MongoDB connection...');
console.log('📡 Connection URL:', process.env.MONGODB_URI ? 
  process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:****@') : 
  'MONGODB_URI not found'
);

if (!process.env.MONGODB_URI) {
  console.log('❌ ERROR: MONGODB_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ SUCCESS: Connected to MongoDB!');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🏠 Host:', mongoose.connection.host);
  process.exit(0);
})
.catch(error => {
  console.log('❌ CONNECTION FAILED:');
  console.log('   Error name:', error.name);
  console.log('   Error message:', error.message);
  console.log('   Error code:', error.code);
  process.exit(1);
});