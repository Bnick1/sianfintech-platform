import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables first
dotenv.config();

console.log('📁 CSV Import Utility for GLDMF Client Migration');
console.log('=================================================\n');

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        console.log('📝 Processing:', data.client_name || data.name);
        results.push(transformClientData(data));
      })
      .on('end', () => {
        console.log(`✅ Processed ${results.length} client records`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('❌ CSV processing error:', error);
        reject(error);
      });
  });
};

// Transform GLDMF data to Economic Identity format
const transformClientData = (csvData) => {
  return {
    tenantId: 'gldmf',
    clientId: csvData.client_id || csvData.id,
    economicIdentity: {
      personalInfo: {
        name: csvData.client_name || csvData.name,
        nationalId: csvData.national_id || csvData.nin,
        phone: csvData.phone_number || csvData.phone,
        email: csvData.email || '',
        address: csvData.address || csvData.location,
        occupation: csvData.occupation || csvData.business_type
      },
      financials: {
        currentLoans: parseFloat(csvData.loan_balance) || 0,
        totalBorrowed: parseFloat(csvData.total_borrowed) || 0,
        repaymentRate: calculateRepaymentRate(csvData),
        creditScore: calculateInitialCreditScore(csvData)
      },
      verification: {
        status: 'verified',
        source: 'gldmf_legacy',
        migratedAt: new Date()
      }
    },
    createdAt: new Date(),
    migratedAt: new Date()
  };
};

// Helper functions
const calculateRepaymentRate = (data) => {
  // Simple repayment rate calculation
  const paid = parseFloat(data.total_repaid) || 0;
  const borrowed = parseFloat(data.total_borrowed) || 1;
  return Math.min(100, (paid / borrowed) * 100);
};

const calculateInitialCreditScore = (data) => {
  // Basic credit scoring based on available data
  let score = 500; // Base score
  
  if (data.loan_balance && parseFloat(data.loan_balance) > 0) {
    score += 100; // Has active loan history
  }
  
  const repaymentRate = calculateRepaymentRate(data);
  score += (repaymentRate * 2); // Reward good repayment
  
  return Math.min(850, Math.max(300, score));
};

// Main import function
const importClients = async (csvFilePath) => {
  try {
    console.log('🔗 Connecting to database...');
    await connectDB();
    
    console.log(`📂 Processing CSV file: ${csvFilePath}`);
    const clients = await processCSV(csvFilePath);
    
    console.log('💾 Saving clients to database...');
    const result = await mongoose.connection.db.collection('clients').insertMany(clients);
    
    console.log(`🎉 SUCCESS: Imported ${result.insertedCount} clients into GLDMF tenant!`);
    console.log('📍 Tenant: gldmf');
    console.log('👥 Clients ready for:', clients.length);
    
    return result;
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
};

// Run the import if file is provided as argument
if (process.argv[2]) {
  console.log(`🚀 Starting import from: ${process.argv[2]}`);
  importClients(process.argv[2]).then(() => {
    console.log('\n✨ Import completed successfully!');
    process.exit(0);
  }).catch(error => {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  });
} else {
  console.log(`
Usage:
  node csv-import-utility.js path/to/your/file.csv

Example:
  node csv-import-utility.js sample-clients.csv

Required CSV columns:
  - client_id or id
  - client_name or name  
  - national_id or nin
  - phone_number or phone
  - loan_balance (optional)
  - total_borrowed (optional)
  - total_repaid (optional)

The utility will automatically transform data to Economic Identity format.
  `);
}