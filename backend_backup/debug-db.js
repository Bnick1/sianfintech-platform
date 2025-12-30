// debug-db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Debugging MongoDB connection...');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('Connection string preview:', process.env.MONGODB_URI?.substring(0, 50) + '...');

// Test with very simple options
const options = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
};

console.log('⏳ Attempting connection (15 second timeout)...');

mongoose.connect(process.env.MONGODB_URI, options)
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ Detailed error analysis:');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    
    if (error.message.includes('bad auth') || error.message.includes('authentication')) {
      console.log('🔐 AUTHENTICATION ISSUE: Wrong username or password');
      console.log('💡 Solution: Check credentials in MongoDB Atlas → Database Access');
    }
    
    process.exit(1);
  });