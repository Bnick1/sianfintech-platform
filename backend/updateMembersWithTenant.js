// backend/updateMembersWithTenant.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

async function updateMembersWithTenant() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import User model
    const UserModule = await import('./models/User.js');
    const User = UserModule.default;

    // Find all members (users with role 'member')
    const members = await User.find({ role: 'member' });
    console.log(`📊 Found ${members.length} members to update`);

    // Update each member with tenantCode
    let updatedCount = 0;
    
    for (const member of members) {
      // Check if tenantCode already exists
      if (!member.tenantCode) {
        // Set tenantCode based on email or default to 'gldmf'
        let tenantCode = 'gldmf';
        
        if (member.email && member.email.includes('@')) {
          const domain = member.email.split('@')[1];
          if (domain.includes('gldmf')) {
            tenantCode = 'gldmf';
          } else if (domain.includes('sianfintech')) {
            tenantCode = 'sianfintech';
          }
        }
        
        member.tenantCode = tenantCode;
        await member.save();
        updatedCount++;
        
        if (updatedCount % 50 === 0) {
          console.log(`🔄 Updated ${updatedCount} members...`);
        }
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} members with tenantCode`);
    
    // Verify the update
    const gldmfMembers = await User.countDocuments({ role: 'member', tenantCode: 'gldmf' });
    const sianMembers = await User.countDocuments({ role: 'member', tenantCode: 'sianfintech' });
    const noTenant = await User.countDocuments({ role: 'member', tenantCode: { $exists: false } });
    
    console.log('\n📊 Verification:');
    console.log(`   GLDMF members: ${gldmfMembers}`);
    console.log(`   SianFinTech members: ${sianMembers}`);
    console.log(`   Members without tenant: ${noTenant}`);
    console.log(`   Total members: ${await User.countDocuments({ role: 'member' })}`);

  } catch (error) {
    console.error('❌ Error updating members:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
updateMembersWithTenant();