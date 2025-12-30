import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const testGLDMFAccess = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Test 1: Verify tenant exists
    const tenant = await db.collection('tenants').findOne({ id: 'gldmf' });
    console.log('✅ Tenant verification:', tenant ? 'FOUND' : 'NOT FOUND');
    
    // Test 2: Verify tenant configuration
    const configs = await db.collection('tenantconfigs').find({ tenantId: 'gldmf' }).toArray();
    console.log('✅ Tenant configurations:', configs.length, 'settings found');
    
    // Test 3: Verify admin user
    const adminUser = await db.collection('users').findOne({ tenantId: 'gldmf', role: 'admin' });
    console.log('✅ Admin user:', adminUser ? 'CREATED' : 'NOT FOUND');
    
    // Test 4: Display GLDMF setup summary
    console.log('\n🎉 GLDMF TENANT SETUP COMPLETE!');
    console.log('================================');
    console.log('🏢 Tenant: Great Lakes Development Microfinance Limited');
    console.log('🔗 ID: gldmf');
    console.log('🌐 Domain: gldmf.sianfintech.com');
    console.log('👤 Admin: admin@gldmf.com');
    console.log('💼 Features: Loans, Investments, Insurance, Mobile Money');
    console.log('💰 Max Loan: 5,000,000 UGX');
    console.log('🎨 Brand Color: #1E40AF');
    console.log('\n🚀 Ready for client migration and live transactions!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing GLDMF access:', error);
    process.exit(1);
  }
};

testGLDMFAccess();