// db.js
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Bnick:Bwanga%40%401986@cluster0.4uzxsaq.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('SianFinTech'); // You can choose your database name
    console.log('✅ MongoDB connected successfully.');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectDB first.');
  }
  return db;
}

module.exports = { connectDB, getDB };
