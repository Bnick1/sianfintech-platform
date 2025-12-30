// backend/fixAllMembersTenant.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

async function fixAllMembersTenant() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const UserModule = await import('./models/User.js');
    const User = UserModule.default;

    // Find ALL members that need fixing (role: 'member')
    const members = await User.find({ role: 'member' });
    console.log(`📊 Found ${members.length} total members`);

    // Update ALL members to ensure tenantCode is set
    let updatedCount = 0;
    let alreadySetCount = 0;
    let problems = [];
    
    for (const member of members) {
      try {
        // Determine tenantCode
        let tenantCode = member.tenantCode;
        
        // If tenantCode doesn't exist, is null, undefined, or empty
        if (!tenantCode || tenantCode === '' || tenantCode === null || tenantCode === undefined) {
          // Determine based on email or default
          if (member.email && member.email.includes('@')) {
            const domain = member.email.split('@')[1];
            if (domain.includes('gldmf')) {
              tenantCode = 'gldmf';
            } else if (domain.includes('sianfintech')) {
              tenantCode = 'sianfintech';
            } else {
              tenantCode = 'gldmf'; // Default
            }
          } else {
            tenantCode = 'gldmf'; // Default
          }
          
          // Update the member
          const result = await User.updateOne(
            { _id: member._id },
            { $set: { tenantCode: tenantCode } }
          );
          
          if (result.modifiedCount > 0) {
            updatedCount++;
            console.log(`✅ Updated ${member.email || member.phone} with tenantCode: ${tenantCode}`);
          }
        } else {
          alreadySetCount++;
        }
        
      } catch (error) {
        problems.push({
          memberId: member._id,
          error: error.message
        });
        console.error(`❌ Error updating member ${member._id}:`, error.message);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total members processed: ${members.length}`);
    console.log(`   Already had tenantCode: ${alreadySetCount}`);
    console.log(`   Updated with tenantCode: ${updatedCount}`);
    console.log(`   Problems encountered: ${problems.length}`);
    
    if (problems.length > 0) {
      console.log('\n⚠️ Problems:');
      problems.forEach(problem => {
        console.log(`   - ${problem.memberId}: ${problem.error}`);
      });
    }

    // Final verification
    console.log('\n🔍 Final verification:');
    const counts = await User.aggregate([
      { $match: { role: 'member' } },
      { 
        $group: {
          _id: {
            $cond: [
              { $or: [
                { $eq: ['$tenantCode', null] },
                { $eq: ['$tenantCode', undefined] },
                { $eq: [{ $type: '$tenantCode' }, 'missing'] }
              ]},
              'no_tenant',
              '$tenantCode'
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('   Tenant distribution:');
    counts.forEach(item => {
      console.log(`   - ${item._id}: ${item.count}`);
    });

    // Also check raw counts
    const gldmfCount = await User.countDocuments({ role: 'member', tenantCode: 'gldmf' });
    const sianCount = await User.countDocuments({ role: 'member', tenantCode: 'sianfintech' });
    const otherCount = await User.countDocuments({ 
      role: 'member', 
      tenantCode: { $nin: ['gldmf', 'sianfintech'] }
    });
    const nullCount = await User.countDocuments({ 
      role: 'member', 
      $or: [
        { tenantCode: { $exists: false } },
        { tenantCode: null },
        { tenantCode: '' }
      ]
    });

    console.log('\n📈 Raw counts:');
    console.log(`   GLDMF: ${gldmfCount}`);
    console.log(`   SianFinTech: ${sianCount}`);
    console.log(`   Other tenants: ${otherCount}`);
    console.log(`   No tenant (should be 0): ${nullCount}`);
    console.log(`   Total (should be 244): ${gldmfCount + sianCount + otherCount + nullCount}`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
fixAllMembersTenant();