import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const addGLDMFTenant = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Create GLDMF tenant
    const tenantResult = await db.collection('tenants').insertOne({
      id: 'gldmf',
      name: 'Great Lakes Development Microfinance Limited',
      slug: 'gldmf',
      config: {
        country: 'UG',
        currency: 'UGX',
        language: 'en'
      },
      features: ['loans', 'investments', 'insurance', 'mobile_money'],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ GLDMF tenant created successfully!');
    console.log('Tenant ID: gldmf');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tenant:', error);
    process.exit(1);
  }
};

addGLDMFTenant();