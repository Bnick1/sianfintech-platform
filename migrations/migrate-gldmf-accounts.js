import mongoose from 'mongoose';
import 'dotenv/config';

class GLDMFAccountsMigration {
  constructor() {
    this.tenantCode = 'gldmf';
  }

  async connect() {
    const mongoUri = 'mongodb+srv://Bnick:Bwanga1986@cluster0.4uzxsaq.mongodb.net/sianfintech?retryWrites=true&w=majority';
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB Atlas database');
      return mongoose.connection.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  parseAccountData(csvContent) {
    console.log('📖 Parsing Account balance.csv...');
    const lines = csvContent.split('\n');
    const records = [];
    let currentAccountType = '';
    let currentCategory = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || line.includes('Names,Mem No.,Account No,B/F,Period Balance,Balance As At End Date')) {
        continue;
      }

      // Detect account type sections
      if (line === 'individual' || line === 'group' || line === 'institution') {
        currentCategory = line;
        continue;
      }

      if (line.includes('GLD STAFFACCOUT')) {
        currentAccountType = 'staff';
        continue;
      } else if (line.includes('GLD SAVINGS ACCOUNT')) {
        currentAccountType = 'savings';
        continue;
      } else if (line.includes('GLD CURRENT ACCOUNT')) {
        currentAccountType = 'current';
        continue;
      } else if (line.includes('GLD DIRECTOR\'S SAVINGS')) {
        currentAccountType = 'director_savings';
        continue;
      }

      // Skip summary lines
      if (line.includes('Total') || line.includes('Grand Total')) {
        continue;
      }

      // Parse data lines
      const fields = this.parseCSVLine(line);
      
      if (fields.length >= 6 && fields[0] && fields[0] !== 'Names' && !fields[0].includes('---')) {
        const parseAmount = (amountStr) => {
          if (!amountStr || amountStr === 'UGX' || amountStr === '0') return 0;
          
          try {
            // Handle all currency formats: "UGX 451", "UGX 451", "UGX 12,401", "14,205,780"
            let cleanStr = amountStr.toString();
            
            // Remove "UGX" prefix and any spaces/non-breaking spaces
            cleanStr = cleanStr.replace(/UGX\s*/g, '');
            
            // Remove all commas for thousands separators
            cleanStr = cleanStr.replace(/,/g, '');
            
            // Remove any remaining non-digit characters
            cleanStr = cleanStr.replace(/[^\d.]/g, '');
            
            const amount = parseFloat(cleanStr);
            
            return isNaN(amount) ? 0 : amount;
          } catch (error) {
            return 0;
          }
        };

        const record = {
          name: fields[0],
          memNo: fields[1] || '',
          accountNo: fields[2] || '',
          bf: parseAmount(fields[3]),
          periodBalance: parseAmount(fields[4]),
          balance: parseAmount(fields[5]),
          accountType: currentAccountType,
          category: currentCategory,
          customerType: this.determineCustomerType(currentCategory, currentAccountType)
        };

        // Only add valid records with member numbers or account numbers
        if (record.memNo || record.accountNo) {
          records.push(record);
        }
      }
    }

    console.log(`✅ Parsed ${records.length} account records`);
    return records;
  }

  // Robust CSV line parsing that handles quoted fields
  parseCSVLine(line) {
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // Add the last field
    fields.push(currentField.trim());
    
    return fields;
  }

  determineCustomerType(category, accountType) {
    if (category === 'group') return 'group';
    if (category === 'institution') return 'institution';
    if (accountType === 'staff') return 'staff';
    return 'individual';
  }

  async migrate() {
    try {
      const db = await this.connect();
      
      console.log('🚀 Starting GLDMF Accounts Migration...');
      
      // Read and parse CSV file
      const fs = await import('fs');
      const csvContent = fs.readFileSync('./Account balance.csv', 'utf8');
      const accountData = this.parseAccountData(csvContent);
      
      if (accountData.length === 0) {
        console.log('❌ No account data found to migrate');
        return;
      }

      // Step 1: Create or update wallets
      await this.createWallets(db, accountData);
      
      // Step 2: Generate report
      await this.generateReport(accountData);
      
      console.log('🎉 GLDMF Accounts Migration Completed!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
      }
    }
  }

  async createWallets(db, accountData) {
    console.log('💰 Creating wallets...');
    const walletsCollection = db.collection('wallets');
    const usersCollection = db.collection('users');

    let walletsCreated = 0;
    let walletsUpdated = 0;
    let errors = 0;

    for (const account of accountData) {
      try {
        // Find existing user by member number
        let user = null;
        if (account.memNo) {
          user = await usersCollection.findOne({
            $or: [
              { 'metadata.gldmfMemNo': account.memNo },
              { digitalId: `GLDMF_${account.memNo}` }
            ]
          });
        }

        const walletData = {
          walletId: this.generateWalletId(account),
          userId: user ? user._id : null,
          tenantCode: this.tenantCode,
          accountType: account.accountType,
          customerType: account.customerType,
          currentBalance: account.balance,
          availableBalance: account.balance,
          currency: 'UGX',
          status: 'active',
          accountNumber: account.accountNo || this.generateAccountNumber(account),
          metadata: {
            migratedFrom: 'GLDMF',
            gldmfMemNo: account.memNo,
            gldmfAccountNo: account.accountNo,
            originalName: account.name,
            bf: account.bf,
            periodBalance: account.periodBalance,
            migrationDate: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Check if wallet already exists
        const existingWallet = await walletsCollection.findOne({
          $or: [
            { walletId: walletData.walletId },
            { 'metadata.gldmfAccountNo': account.accountNo },
            { accountNumber: walletData.accountNumber }
          ]
        });

        if (existingWallet) {
          // Update existing wallet
          await walletsCollection.updateOne(
            { _id: existingWallet._id },
            { 
              $set: {
                currentBalance: account.balance,
                availableBalance: account.balance,
                updatedAt: new Date(),
                'metadata.bf': account.bf,
                'metadata.periodBalance': account.periodBalance
              }
            }
          );
          walletsUpdated++;
        } else {
          // Create new wallet
          await walletsCollection.insertOne(walletData);
          walletsCreated++;
        }

        if ((walletsCreated + walletsUpdated) % 50 === 0) {
          console.log(`✓ Processed ${walletsCreated + walletsUpdated} wallets...`);
        }
        
      } catch (error) {
        errors++;
        console.log(`✗ Failed to process wallet for ${account.name}:`, error.message);
      }
    }
    
    console.log(`✅ Created ${walletsCreated} new wallets`);
    console.log(`✅ Updated ${walletsUpdated} existing wallets`);
    console.log(`❌ Errors: ${errors}`);
  }

  generateWalletId(account) {
    if (account.accountNo) {
      return `W${account.accountNo}`;
    } else if (account.memNo) {
      return `W${account.memNo}`;
    } else {
      return `W${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  generateAccountNumber(account) {
    if (account.accountNo && account.accountNo !== '0') {
      return account.accountNo;
    } else if (account.memNo) {
      return `ACC${account.memNo}`;
    } else {
      return `ACC${Date.now().toString().slice(-8)}`;
    }
  }

  async generateReport(accountData) {
    console.log('\n📈 Accounts Migration Report:');
    console.log('='.repeat(50));
    
    const totalBalance = accountData.reduce((sum, account) => sum + account.balance, 0);
    const accountTypeBreakdown = {};
    const categoryBreakdown = {};

    accountData.forEach(account => {
      accountTypeBreakdown[account.accountType] = (accountTypeBreakdown[account.accountType] || 0) + 1;
      categoryBreakdown[account.category] = (categoryBreakdown[account.category] || 0) + 1;
    });
    
    console.log(`Total Accounts: ${accountData.length}`);
    console.log(`Total Balance: UGX ${totalBalance.toLocaleString()}`);
    
    console.log('\nAccount Type Breakdown:');
    Object.entries(accountTypeBreakdown).forEach(([type, count]) => {
      const typeBalance = accountData.filter(a => a.accountType === type).reduce((sum, a) => sum + a.balance, 0);
      console.log(`  ${type}: ${count} accounts - UGX ${typeBalance.toLocaleString()}`);
    });
    
    console.log('\nCategory Breakdown:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      const categoryBalance = accountData.filter(a => a.category === category).reduce((sum, a) => sum + a.balance, 0);
      console.log(`  ${category}: ${count} accounts - UGX ${categoryBalance.toLocaleString()}`);
    });

    // Show top 5 accounts by balance
    const topAccounts = accountData
      .filter(a => a.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);
    
    console.log('\n🏆 Top 5 Accounts by Balance:');
    topAccounts.forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.name}: UGX ${account.balance.toLocaleString()}`);
    });
  }
}

// Run migration
const migration = new GLDMFAccountsMigration();
migration.migrate().catch(console.error);