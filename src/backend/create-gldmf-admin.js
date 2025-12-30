import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const createGLDMFAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Create GLDMF admin user
    await db.collection('users').insertOne({
      email: 'admin@gldmf.com',
      password: 'temp_password_123', // Should be hashed in production
      name: 'GLDMF Administrator',
      role: 'admin',
      tenantId: 'gldmf',
      permissions: ['users.manage', 'loans.approve', 'reports.view'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ GLDMF admin user created!');
    console.log('📧 Email: admin@gldmf.com');
    console.log('🔑 Temporary Password: temp_password_123');
    console.log('👤 Role: Administrator');
    console.log('🏢 Tenant: GLDMF');
    console.log('');
    console.log('⚠️  IMPORTANT: Change password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createGLDMFAdmin();