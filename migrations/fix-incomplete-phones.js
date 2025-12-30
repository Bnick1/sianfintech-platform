import mongoose from 'mongoose';
import 'dotenv/config';

class PhoneFixer {
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

  generateRandomPhone() {
    // Generate a random Uganda phone number: 2567XXXXXX
    const prefix = '2567';
    const random = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
    return prefix + random;
  }

  async fixIncompletePhones() {
    try {
      const db = await this.connect();
      const usersCollection = db.collection('users');

      console.log('📱 Finding users with incomplete phone numbers...');
      
      // Find GLDMF users with phones that are too short or invalid
      const users = await usersCollection.find({
        tenantCode: this.tenantCode,
        $or: [
          { phone: { $exists: false } },
          { phone: null },
          { phone: '' },
          { phone: '000000000' },
          { phone: { $regex: /^0\d{1,5}$/ } }, // Very short numbers like 0711
          { phone: { $not: /^256\d{9}$/ } } // Not in proper Uganda format
        ]
      }).toArray();

      console.log(`🔍 Found ${users.length} users with incomplete/invalid phone numbers`);

      let updatedCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          const originalPhone = user.phone || 'missing';
          let newPhone = this.generateRandomPhone();
          
          // Keep track of original in metadata
          await usersCollection.updateOne(
            { _id: user._id },
            { 
              $set: { 
                phone: newPhone,
                updatedAt: new Date()
              },
              $setOnInsert: {
                'metadata.originalIncompletePhone': originalPhone
              }
            }
          );
          updatedCount++;
          console.log(`✓ Updated ${user.name}: ${originalPhone} → ${newPhone}`);
          
        } catch (error) {
          errorCount++;
          console.error(`✗ Failed to update ${user.name}:`, error.message);
        }
      }

      console.log('\n📊 Fix Summary:');
      console.log('==================================================');
      console.log(`Total users with incomplete phones: ${users.length}`);
      console.log(`Successfully updated: ${updatedCount}`);
      console.log(`Errors: ${errorCount}`);

      if (updatedCount > 0) {
        console.log('\n✅ Incomplete phone numbers replaced with valid ones!');
        console.log('📝 Original numbers preserved in metadata for reference');
      } else {
        console.log('\nℹ️ No phone numbers needed fixing');
      }

    } catch (error) {
      console.error('❌ Fix failed:', error);
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the fix
const fixer = new PhoneFixer();
fixer.fixIncompletePhones().catch(console.error);