// migrations/migrate-gldmf.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';

dotenv.config();

class GLDMFMigration {
  constructor() {
    this.tenantCode = 'gldmf';
  }

  async connect() {
    // Use the same MongoDB Atlas connection as your main app
    const mongoUri = 'mongodb+srv://Bnick:Bwanga1986@cluster0.4uzxsaq.mongodb.net/sianfintech?retryWrites=true&w=majority';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB Atlas database');
      return mongoose.connection.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      console.log('💡 Your main app uses MongoDB Atlas (cloud)');
      throw error;
    }
  }

  parseLoanData() {
    console.log('📖 Parsing Loan Tracking.csv...');
    const csvData = fs.readFileSync('./Loan Tracking.csv', 'utf8');
    const lines = csvData.split('\n');
    const records = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip headers and summary lines
      if (i < 3 || !line || line.includes('---') || line.includes('Product Totals') || line.includes('Branch Totals')) {
        continue;
      }

      // Simple comma splitting - your CSV doesn't have quoted fields with commas
      const fields = line.split(',').map(field => field.trim().replace(/"/g, ''));

      // Show raw fields for first few records to debug
      if (i < 5) {
        console.log(`Line ${i} fields:`, fields.slice(0, 8)); // Show first 8 fields
      }

      // Create record if we have enough fields
      if (fields.length >= 17 && fields[0] && fields[1]) {
        const parseAmount = (str) => {
          if (!str || str === '0') return 0;
          // Handle numbers like "100,000" - remove commas and parse
          const cleanStr = str.toString().replace(/,/g, '');
          return parseInt(cleanStr) || 0;
        };

        const location = fields[17] || 'GLD mukatale';
        let productType = 'mukatale';
        if (location.includes('TAXI')) productType = 'taxi';
        else if (location.includes('BODA')) productType = 'boda';
        else if (location.includes('BUSINESS')) productType = 'business';
        else if (location.includes('SCHOOL')) productType = 'school_fees';
        else if (location.includes('Staff')) productType = 'staff';

        const record = {
          name: fields[0],
          memNo: fields[1],
          phone: fields[3] || '',
          principal: parseAmount(fields[5]),
          interest: parseAmount(fields[6]),
          date: fields[7] || '',
          expiryDate: fields[8] || '',
          principalPaid: parseAmount(fields[9]),
          interestPaid: parseAmount(fields[10]),
          penaltyPaid: parseAmount(fields[11]),
          totalPaid: parseAmount(fields[12]),
          principalOutstanding: parseAmount(fields[13]),
          interestOutstanding: parseAmount(fields[14]),
          penaltyOutstanding: parseAmount(fields[15]),
          totalOutstanding: parseAmount(fields[16]),
          location: location,
          productType: productType
        };

        // Only add if principal is a valid number
        if (record.principal > 0) {
          records.push(record);
        }
      }
    }

    console.log(`✅ Parsed ${records.length} loan records`);
    
    // Show detailed sample of first record
    if (records.length > 0) {
      console.log('\n📋 First record details:');
      console.log('Name:', records[0].name);
      console.log('Member No:', records[0].memNo);
      console.log('Phone:', records[0].phone);
      console.log('Principal:', records[0].principal);
      console.log('Interest:', records[0].interest);
      console.log('Location:', records[0].location);
      console.log('Product Type:', records[0].productType);
    } else {
      console.log('\n❌ No records parsed. Checking field structure...');
      // Show what the first data line looks like
      for (let i = 3; i < Math.min(8, lines.length); i++) {
        const testFields = lines[i].split(',').map(f => f.trim());
        console.log(`Line ${i} field count: ${testFields.length}`);
        console.log('Fields:', testFields.slice(0, 6)); // First 6 fields
      }
    }
    
    return records;
  }

  async migrate() {
    try {
      const db = await this.connect();
      
      console.log('🚀 Starting GLDMF Data Migration...');
      
      // Parse loan data directly from CSV
      const loanData = this.parseLoanData();
      
      if (loanData.length === 0) {
        console.log('❌ No loan data found to migrate');
        return;
      }

      // Step 1: Create users
      const userMap = await this.createUsers(db, loanData);
      
      // Step 2: Create loans
      await this.createLoans(db, loanData, userMap);
      
      // Step 3: Generate report
      await this.generateReport(loanData);
      
      console.log('🎉 GLDMF Migration Completed!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
      }
    }
  }

  async createUsers(db, loanData) {
    console.log('👥 Creating users...');
    const usersCollection = db.collection('users');
    const userMap = new Map();

    const uniqueUsers = this.getUniqueUsers(loanData);
    console.log(`📝 Processing ${uniqueUsers.length} unique users...`);

    let createdCount = 0;
    for (const userData of uniqueUsers) {
      try {
        const user = {
          name: userData.name,
          phone: this.cleanPhone(userData.phone),
          email: `${userData.memNo}@gldmf.com`,
          digitalId: `GLDMF_${userData.memNo}`,
          walletId: `W${userData.memNo}`,
          password: this.generatePassword(),
          tenantCode: this.tenantCode,
          isVerified: false,
          idVerified: false,
          customerType: this.determineCustomerType(userData),
          occupation: this.determineOccupation(userData),
          location: {
            district: userData.location || 'Kampala',
            village: userData.location || 'Central'
          },
          creditScore: this.calculateInitialScore(userData),
          riskCategory: this.determineRiskCategory(userData),
          metadata: {
            migratedFrom: 'GLDMF',
            gldmfMemNo: userData.memNo,
            originalPhone: userData.phone,
            migrationDate: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await usersCollection.insertOne(user);
        userMap.set(userData.memNo, result.insertedId);
        createdCount++;
        
        if (createdCount % 25 === 0) {
          console.log(`✓ Created ${createdCount} users...`);
        }
        
      } catch (error) {
        console.log(`✗ Failed to create user ${userData.name}:`, error.message);
      }
    }
    
    console.log(`✅ Created ${createdCount} users`);
    return userMap;
  }

  async createLoans(db, loanData, userMap) {
    console.log('🏦 Creating loans...');
    const loansCollection = db.collection('loans');
    let loansCreated = 0;

    for (const loanRecord of loanData) {
      try {
        const userId = userMap.get(loanRecord.memNo);
        if (!userId) continue;

        const loan = {
          loanId: `LN${loanRecord.memNo}_${Date.now()}_${loansCreated}`,
          userId: userId,
          tenantCode: this.tenantCode,
          principalAmount: loanRecord.principal,
          interestRate: this.calculateInterestRate(loanRecord),
          interestAmount: loanRecord.interest,
          totalAmount: loanRecord.principal + loanRecord.interest,
          termMonths: this.calculateTermMonths(loanRecord.date, loanRecord.expiryDate),
          disbursementDate: this.parseDate(loanRecord.date),
          dueDate: this.parseDate(loanRecord.expiryDate),
          applicationDate: this.parseDate(loanRecord.date),
          principalPaid: loanRecord.principalPaid,
          interestPaid: loanRecord.interestPaid,
          penaltyPaid: loanRecord.penaltyPaid,
          totalPaid: loanRecord.totalPaid,
          principalOutstanding: loanRecord.principalOutstanding,
          interestOutstanding: loanRecord.interestOutstanding,
          penaltyOutstanding: loanRecord.penaltyOutstanding,
          totalOutstanding: loanRecord.totalOutstanding,
          status: this.determineLoanStatus(loanRecord),
          loanType: loanRecord.productType,
          purpose: this.determineLoanPurpose(loanRecord),
          repaymentSchedule: this.generateRepaymentSchedule(loanRecord),
          metadata: {
            migratedFrom: 'GLDMF',
            gldmfMemNo: loanRecord.memNo,
            originalLocation: loanRecord.location,
            migrationDate: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await loansCollection.insertOne(loan);
        loansCreated++;
        
        if (loansCreated % 50 === 0) {
          console.log(`✓ Created ${loansCreated} loans...`);
        }
        
      } catch (error) {
        console.log(`✗ Failed to create loan for ${loanRecord.name}:`, error.message);
      }
    }
    
    console.log(`✅ Created ${loansCreated} loans`);
  }

  // Helper methods
  getUniqueUsers(data) {
    const uniqueMap = new Map();
    data.forEach(item => {
      if (!uniqueMap.has(item.memNo)) {
        uniqueMap.set(item.memNo, item);
      }
    });
    return Array.from(uniqueMap.values());
  }

  cleanPhone(phone) {
    if (!phone) return '000000000';
    let cleaned = phone.toString().replace(/\D/g, '');
    if (cleaned.startsWith('256')) cleaned = '0' + cleaned.substring(3);
    return cleaned.substring(0, 9) || '000000000';
  }

  generatePassword() {
    return 'Temp' + Math.random().toString(36).slice(-8) + '123!';
  }

  determineCustomerType(userData) {
    if (userData.productType === 'staff') return 'staff';
    return 'individual';
  }

  determineOccupation(userData) {
    if (userData.productType === 'boda') return 'boda_rider';
    if (userData.productType === 'taxi') return 'taxi_driver';
    if (userData.productType === 'business') return 'trader';
    if (userData.productType === 'staff') return 'employee';
    return 'trader';
  }

  calculateInitialScore(userData) {
    let score = 500;
    if (userData.principalOutstanding > 0) {
      const repaymentRatio = userData.principalPaid / userData.principal;
      score += Math.floor(repaymentRatio * 200);
    }
    return Math.min(Math.max(score, 300), 850);
  }

  determineRiskCategory(userData) {
    const score = this.calculateInitialScore(userData);
    if (score >= 700) return 'low';
    if (score >= 500) return 'medium';
    return 'high';
  }

  calculateInterestRate(loanData) {
    if (!loanData.principal || loanData.principal === 0) return 0;
    return (loanData.interest / loanData.principal) * 100;
  }

  calculateTermMonths(startDate, endDate) {
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    if (!start || !end) return 6;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)) || 6;
  }

  parseDate(dateString) {
    if (!dateString) return new Date();
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]) + (parts[2].length === 2 ? 2000 : 0);
      return new Date(year, month, day);
    }
    return new Date();
  }

  determineLoanStatus(loanData) {
    if (loanData.totalOutstanding === 0) return 'closed';
    if (loanData.principalPaid > 0) return 'active';
    return 'disbursed';
  }

  determineLoanPurpose(loanData) {
    const purposes = {
      'mukatale': 'working_capital',
      'taxi': 'vehicle_finance',
      'boda': 'motorcycle_purchase',
      'business': 'business_expansion',
      'school_fees': 'education',
      'staff': 'personal'
    };
    return purposes[loanData.productType] || 'working_capital';
  }

  generateRepaymentSchedule(loanData) {
    const schedule = [];
    const startDate = this.parseDate(loanData.date);
    const totalAmount = loanData.principal + loanData.interest;
    
    for (let i = 1; i <= 6; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule.push({
        installmentNumber: i,
        dueDate: dueDate,
        amountDue: Math.ceil(totalAmount / 6),
        principalDue: Math.ceil(loanData.principal / 6),
        interestDue: Math.ceil(loanData.interest / 6),
        status: 'pending',
        amountPaid: 0
      });
    }
    return schedule;
  }

  async generateReport(loanData) {
    console.log('\n📈 Migration Report:');
    console.log('='.repeat(50));
    
    const totalPrincipal = loanData.reduce((sum, loan) => sum + loan.principal, 0);
    const totalOutstanding = loanData.reduce((sum, loan) => sum + loan.totalOutstanding, 0);
    
    console.log(`Total Users: ${this.getUniqueUsers(loanData).length}`);
    console.log(`Total Loans: ${loanData.length}`);
    console.log(`Total Principal: UGX ${totalPrincipal.toLocaleString()}`);
    console.log(`Total Outstanding: UGX ${totalOutstanding.toLocaleString()}`);
    
    const breakdown = {};
    loanData.forEach(loan => {
      breakdown[loan.productType] = (breakdown[loan.productType] || 0) + 1;
    });
    
    console.log('\nLoan Breakdown:');
    Object.entries(breakdown).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} loans`);
    });
  }
}

// Run migration
const migration = new GLDMFMigration();
migration.migrate().catch(console.error);