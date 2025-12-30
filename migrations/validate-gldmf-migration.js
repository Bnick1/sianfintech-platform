import mongoose from 'mongoose';
import 'dotenv/config';

class GLDMFValidation {
  constructor() {
    this.tenantCode = 'gldmf';
    this.validationResults = {
      users: { total: 0, passed: 0, failed: 0, issues: [] },
      loans: { total: 0, passed: 0, failed: 0, issues: [] },
      wallets: { total: 0, passed: 0, failed: 0, issues: [] },
      relationships: { total: 0, passed: 0, failed: 0, issues: [] }
    };
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

  async validateAll() {
    try {
      const db = await this.connect();
      
      console.log('🔍 Starting GLDMF Migration Validation...\n');
      
      // Run all validation checks
      await this.validateUsers(db);
      await this.validateLoans(db);
      await this.validateWallets(db);
      await this.validateRelationships(db);
      await this.validateFinancialTotals(db);
      
      // Generate final report
      this.generateValidationReport();
      
      console.log('🎉 GLDMF Validation Completed!');
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
      }
    }
  }

  async validateUsers(db) {
    console.log('👥 Validating Users...');
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({ tenantCode: this.tenantCode }).toArray();
    this.validationResults.users.total = users.length;

    console.log(`📊 Found ${users.length} GLDMF users`);

    for (const user of users) {
      let passed = true;
      const issues = [];

      // Check required fields
      if (!user.name) {
        issues.push('Missing name');
        passed = false;
      }
      
      if (!user.phone || user.phone === '000000000') {
        issues.push('Invalid phone number');
        passed = false;
      }
      
      if (!user.digitalId || !user.digitalId.startsWith('GLDMF_')) {
        issues.push('Invalid digital ID format');
        passed = false;
      }
      
      if (!user.metadata?.gldmfMemNo) {
        issues.push('Missing GLDMF member number');
        passed = false;
      }

      // Check phone format (should be 12 digits starting with 256)
      if (user.phone && !/^256\d{9}$/.test(user.phone)) {
        issues.push('Phone not in Uganda format (256XXXXXXXXX)');
        passed = false;
      }

      if (passed) {
        this.validationResults.users.passed++;
      } else {
        this.validationResults.users.failed++;
        this.validationResults.users.issues.push({
          user: user.name,
          userId: user._id,
          issues: issues
        });
      }
    }

    console.log(`✅ Users Validation: ${this.validationResults.users.passed}/${this.validationResults.users.total} passed`);
  }

  async validateLoans(db) {
    console.log('\n🏦 Validating Loans...');
    const loansCollection = db.collection('loans');
    
    const loans = await loansCollection.find({ tenantCode: this.tenantCode }).toArray();
    this.validationResults.loans.total = loans.length;

    console.log(`📊 Found ${loans.length} GLDMF loans`);

    for (const loan of loans) {
      let passed = true;
      const issues = [];

      // Check required fields
      if (!loan.loanId) {
        issues.push('Missing loan ID');
        passed = false;
      }
      
      if (!loan.userId) {
        issues.push('Missing user reference');
        passed = false;
      }
      
      if (loan.principalAmount === undefined || loan.principalAmount === null) {
        issues.push('Missing principal amount');
        passed = false;
      }
      
      if (loan.totalAmount === undefined || loan.totalAmount === null) {
        issues.push('Missing total amount');
        passed = false;
      }

      // Check financial consistency
      if (loan.principalAmount < 0) {
        issues.push('Negative principal amount');
        passed = false;
      }
      
      if (loan.totalAmount < loan.principalAmount) {
        issues.push('Total amount less than principal');
        passed = false;
      }

      // Check status validity
      const validStatuses = ['active', 'closed', 'disbursed', 'pending'];
      if (!validStatuses.includes(loan.status)) {
        issues.push(`Invalid status: ${loan.status}`);
        passed = false;
      }

      if (passed) {
        this.validationResults.loans.passed++;
      } else {
        this.validationResults.loans.failed++;
        this.validationResults.loans.issues.push({
          loanId: loan.loanId,
          issues: issues
        });
      }
    }

    console.log(`✅ Loans Validation: ${this.validationResults.loans.passed}/${this.validationResults.loans.total} passed`);
  }

  async validateWallets(db) {
    console.log('\n💰 Validating Wallets...');
    const walletsCollection = db.collection('wallets');
    
    const wallets = await walletsCollection.find({ tenantCode: this.tenantCode }).toArray();
    this.validationResults.wallets.total = wallets.length;

    console.log(`📊 Found ${wallets.length} GLDMF wallets`);

    let totalBalance = 0;

    for (const wallet of wallets) {
      let passed = true;
      const issues = [];

      // Check required fields
      if (!wallet.walletId) {
        issues.push('Missing wallet ID');
        passed = false;
      }
      
      if (wallet.currentBalance === undefined || wallet.currentBalance === null) {
        issues.push('Missing current balance');
        passed = false;
      }
      
      if (wallet.availableBalance === undefined || wallet.availableBalance === null) {
        issues.push('Missing available balance');
        passed = false;
      }

      // Check balance consistency
      if (wallet.currentBalance < 0) {
        issues.push('Negative current balance');
        passed = false;
      }
      
      if (wallet.availableBalance > wallet.currentBalance) {
        issues.push('Available balance greater than current balance');
        passed = false;
      }

      // Check account type validity
      const validAccountTypes = ['savings', 'current', 'staff', 'director_savings'];
      if (!validAccountTypes.includes(wallet.accountType)) {
        issues.push(`Invalid account type: ${wallet.accountType}`);
        passed = false;
      }

      totalBalance += wallet.currentBalance;

      if (passed) {
        this.validationResults.wallets.passed++;
      } else {
        this.validationResults.wallets.failed++;
        this.validationResults.wallets.issues.push({
          walletId: wallet.walletId,
          accountNumber: wallet.accountNumber,
          issues: issues
        });
      }
    }

    console.log(`✅ Wallets Validation: ${this.validationResults.wallets.passed}/${this.validationResults.wallets.total} passed`);
    console.log(`💰 Total wallet balance: UGX ${totalBalance.toLocaleString()}`);
  }

  async validateRelationships(db) {
    console.log('\n🔗 Validating Relationships...');
    const usersCollection = db.collection('users');
    const loansCollection = db.collection('loans');
    const walletsCollection = db.collection('wallets');
    
    const users = await usersCollection.find({ tenantCode: this.tenantCode }).toArray();
    let relationshipCount = 0;

    for (const user of users) {
      let passed = true;
      const issues = [];

      // Check if user has loans
      const userLoans = await loansCollection.find({ userId: user._id }).toArray();
      
      // Check if user has wallets
      const userWallets = await walletsCollection.find({ userId: user._id }).toArray();

      // Validate user has appropriate relationships
      if (userLoans.length === 0 && userWallets.length === 0) {
        issues.push('User has no loans or wallets');
        passed = false;
      }

      // Check wallet consistency
      if (userWallets.length > 3) { // Reasonable limit
        issues.push(`User has ${userWallets.length} wallets (suspicious)`);
        passed = false;
      }

      relationshipCount++;

      if (passed) {
        this.validationResults.relationships.passed++;
      } else {
        this.validationResults.relationships.failed++;
        this.validationResults.relationships.issues.push({
          user: user.name,
          userId: user._id,
          loans: userLoans.length,
          wallets: userWallets.length,
          issues: issues
        });
      }
    }

    this.validationResults.relationships.total = relationshipCount;
    console.log(`✅ Relationships Validation: ${this.validationResults.relationships.passed}/${this.validationResults.relationships.total} passed`);
  }

  async validateFinancialTotals(db) {
    console.log('\n📈 Validating Financial Totals...');
    
    const loansCollection = db.collection('loans');
    const walletsCollection = db.collection('wallets');

    // Calculate total loan portfolio
    const loans = await loansCollection.find({ tenantCode: this.tenantCode }).toArray();
    const totalLoanPrincipal = loans.reduce((sum, loan) => sum + (loan.principalAmount || 0), 0);
    const totalLoanOutstanding = loans.reduce((sum, loan) => sum + (loan.totalOutstanding || 0), 0);

    // Calculate total wallet balances by type
    const wallets = await walletsCollection.find({ tenantCode: this.tenantCode }).toArray();
    const walletBalanceByType = {};
    
    wallets.forEach(wallet => {
      const type = wallet.accountType || 'unknown';
      walletBalanceByType[type] = (walletBalanceByType[type] || 0) + (wallet.currentBalance || 0);
    });

    console.log('💰 Financial Summary:');
    console.log(`   Total Loan Principal: UGX ${totalLoanPrincipal.toLocaleString()}`);
    console.log(`   Total Loan Outstanding: UGX ${totalLoanOutstanding.toLocaleString()}`);
    console.log(`   Total Wallet Balances: UGX ${Object.values(walletBalanceByType).reduce((a, b) => a + b, 0).toLocaleString()}`);
    
    console.log('\n🏦 Wallet Balances by Type:');
    Object.entries(walletBalanceByType).forEach(([type, balance]) => {
      console.log(`   ${type}: UGX ${balance.toLocaleString()}`);
    });

    // Validate against expected totals
    const expectedLoanPrincipal = 52644; // From your migration report
    if (Math.abs(totalLoanPrincipal - expectedLoanPrincipal) > 100) { // Allow small rounding differences
      console.warn(`⚠️  Loan principal mismatch: Expected ~UGX ${expectedLoanPrincipal.toLocaleString()}, Got UGX ${totalLoanPrincipal.toLocaleString()}`);
    } else {
      console.log('✅ Loan principal matches expected amount');
    }
  }

  generateValidationReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 GLDMF MIGRATION VALIDATION REPORT');
    console.log('='.repeat(60));

    const totalTests = Object.values(this.validationResults).reduce((sum, category) => sum + category.total, 0);
    const totalPassed = Object.values(this.validationResults).reduce((sum, category) => sum + category.passed, 0);
    const totalFailed = Object.values(this.validationResults).reduce((sum, category) => sum + category.failed, 0);

    console.log(`\n📈 Overall Results: ${totalPassed}/${totalTests} passed (${((totalPassed/totalTests)*100).toFixed(1)}%)`);

    // Detailed category results
    Object.entries(this.validationResults).forEach(([category, results]) => {
      const percentage = ((results.passed / results.total) * 100).toFixed(1);
      console.log(`\n${category.toUpperCase()}: ${results.passed}/${results.total} passed (${percentage}%)`);
      
      if (results.failed > 0) {
        console.log(`❌ Issues found: ${results.failed}`);
        
        // Show first 3 issues for each category
        results.issues.slice(0, 3).forEach(issue => {
          if (category === 'users') {
            console.log(`   - ${issue.user}: ${issue.issues.join(', ')}`);
          } else if (category === 'loans') {
            console.log(`   - ${issue.loanId}: ${issue.issues.join(', ')}`);
          } else if (category === 'wallets') {
            console.log(`   - ${issue.walletId}: ${issue.issues.join(', ')}`);
          } else if (category === 'relationships') {
            console.log(`   - ${issue.user}: ${issue.issues.join(', ')} (Loans: ${issue.loans}, Wallets: ${issue.wallets})`);
          }
        });
        
        if (results.issues.length > 3) {
          console.log(`   ... and ${results.issues.length - 3} more issues`);
        }
      }
    });

    // Final recommendation
    console.log('\n' + '='.repeat(60));
    if (totalFailed === 0) {
      console.log('🎉 EXCELLENT! All data validation checks passed!');
      console.log('✅ The GLDMF migration is READY FOR PRODUCTION!');
    } else if (totalFailed < 10) {
      console.log('✅ GOOD! Minor issues found that should be reviewed.');
      console.log('⚠️  Review the issues above before going to production.');
    } else {
      console.log('❌ ATTENTION NEEDED! Significant issues found.');
      console.log('🔧 Please fix the issues above before production use.');
    }
    console.log('='.repeat(60));
  }
}

// Run validation
const validator = new GLDMFValidation();
validator.validateAll().catch(console.error);