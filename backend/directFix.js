// backend/directFix.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function directFix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // DIRECT FIX: Update ALL members to have tenantCode = 'gldmf'
    console.log('🔄 Updating ALL members to tenantCode: gldmf...');
    
    const result = await db.collection('users').updateMany(
      { role: 'member' },
      { $set: { tenantCode: 'gldmf' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} members`);
    console.log(`📊 Matched ${result.matchedCount} members`);
    
    // Verify the fix
    const gldmfCount = await db.collection('users').countDocuments({ 
      role: 'member', 
      tenantCode: 'gldmf' 
    });
    
    const totalMembers = await db.collection('users').countDocuments({ role: 'member' });
    
    console.log('\n🔍 Verification:');
    console.log(`   Total members: ${totalMembers}`);
    console.log(`   Members with tenantCode 'gldmf': ${gldmfCount}`);
    console.log(`   Should be equal: ${gldmfCount === totalMembers ? '✅ YES' : '❌ NO'}`);
    
    // Also check for any members with different tenantCode
    const otherTenants = await db.collection('users').find({ 
      role: 'member',
      tenantCode: { $ne: 'gldmf' }
    }).toArray();
    
    if (otherTenants.length > 0) {
      console.log('\n⚠️ Members with other tenantCodes:');
      otherTenants.forEach(member => {
        console.log(`   - ${member.email || member.phone}: ${member.tenantCode}`);
      });
    } else {
      console.log('\n✅ All members now have tenantCode: gldmf');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

directFix();