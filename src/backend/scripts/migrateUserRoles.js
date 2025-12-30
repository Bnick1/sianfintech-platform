// backend/scripts/migrateUserRoles.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateUserRoles = async () => {
  let connection;
  try {
    console.log('🔗 Connecting to MongoDB...');
    connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sianfintech');
    console.log('✅ Connected to MongoDB');

    // Count users without roles
    const usersWithoutRoles = await User.countDocuments({ 
      role: { $exists: false } 
    });
    
    console.log(`📊 Found ${usersWithoutRoles} users without roles`);

    if (usersWithoutRoles > 0) {
      console.log('🔄 Setting default "member" role for existing users...');
      
      // Set default 'member' role for all existing users without roles
      const result = await User.updateMany(
        { role: { $exists: false } },
        { $set: { role: 'member' } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} users with 'member' role`);
    } else {
      console.log('✅ All users already have roles assigned');
    }

    // Verify the migration
    const totalUsers = await User.countDocuments();
    const members = await User.countDocuments({ role: 'member' });
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n🎯 Migration Results:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Members: ${members}`);
    console.log('   Users by Role:');
    usersByRole.forEach(item => {
      console.log(`     - ${item._id}: ${item.count}`);
    });

    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
};

// Run the migration
migrateUserRoles().catch(console.error);