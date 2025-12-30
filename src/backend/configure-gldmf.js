import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const configureGLDMF = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Add GLDMF branding configuration
    await db.collection('tenantconfigs').insertMany([
      {
        tenantId: 'gldmf',
        configKey: 'brand.primary_color',
        configValue: '#1E40AF',
        createdAt: new Date()
      },
      {
        tenantId: 'gldmf',
        configKey: 'brand.company_name', 
        configValue: 'GLDMF',
        createdAt: new Date()
      },
      {
        tenantId: 'gldmf',
        configKey: 'brand.logo_url',
        configValue: 'https://gldmf.com/logo.png',
        createdAt: new Date()
      },
      {
        tenantId: 'gldmf',
        configKey: 'domain',
        configValue: 'gldmf.sianfintech.com',
        createdAt: new Date()
      },
      {
        tenantId: 'gldmf',
        configKey: 'mobile_money.providers',
        configValue: JSON.stringify(['mtn', 'airtel']),
        createdAt: new Date()
      },
      {
        tenantId: 'gldmf', 
        configKey: 'loan.max_amount',
        configValue: '5000000', // 5M UGX
        createdAt: new Date()
      }
    ]);

    console.log('✅ GLDMF branding and configuration added!');
    console.log('🎨 Primary Color: #1E40AF');
    console.log('🏢 Display Name: GLDMF');
    console.log('🌐 Domain: gldmf.sianfintech.com');
    console.log('📱 Mobile Money: MTN & Airtel');
    console.log('💰 Max Loan: 5,000,000 UGX');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error configuring GLDMF:', error);
    process.exit(1);
  }
};

configureGLDMF();