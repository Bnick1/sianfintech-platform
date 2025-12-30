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

  formatPhoneNumber(phoneInput) {
    if (!phoneInput) return '000000000';
    
    try {
      let phone = phoneInput.toString().trim();
      
      // Convert scientific notation to full number
      if (phone.includes('E+') || phone.includes('e+')) {
        phone = parseFloat(phone).toFixed(0);
      }
      
      // Remove any non-digit characters
      phone = phone.replace(/\D/g, '');
      
      // Handle Uganda phone number formats
      if (phone.startsWith('0') && phone.length === 10) {
        // Convert 07XXXXXXXX to 2567XXXXXXXX
        phone = '256' + phone.substring(1);
      } else if (phone.length === 9 && !phone.startsWith('256')) {
        // Convert 7XXXXXXXX to 2567XXXXXXXX
        phone = '256' + phone;
      } else if (phone.startsWith('256') && phone.length === 12) {
        // Already correct format
        return phone;
      }
      
      // If we have a valid 12-digit number, return it
      if (phone.length === 12 && phone.startsWith('256')) {
        return phone;
      }
      
      console.warn(`Invalid format after conversion: ${phoneInput} → ${phone}`);
      return phone.length > 0 ? phone : '000000000';
      
    } catch (error) {
      console.error(`Error formatting phone: ${phoneInput}`, error);
      return '000000000';
    }
  }

  async fixPhoneNumbers() {
    try {
      const db = await this.connect();
      const usersCollection = db.collection('users');

      console.log('📱 Finding GLDMF users with phone number issues...');
      
      // Find GLDMF users
      const users = await usersCollection.find({
        tenantCode: this.tenantCode
      }).toArray();

      console.log(`🔍 Found ${users.length} GLDMF users`);

      let updatedCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          const originalPhone = user.phone;
          const formattedPhone = this.formatPhoneNumber(originalPhone);
          
          if (formattedPhone && formattedPhone !== originalPhone) {
            await usersCollection.updateOne(
              { _id: user._id },
              { 
                $set: { 
                  phone: formattedPhone,
                  'metadata.originalPhone': originalPhone // Keep original for reference
                } 
              }
            );
            updatedCount++;
            console.log(`✓ Updated ${user.name}: ${originalPhone} → ${formattedPhone}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`✗ Failed to update ${user.name}:`, error.message);
        }
      }

      console.log('\n📊 Fix Summary:');
      console.log('==================================================');
      console.log(`Total GLDMF users: ${users.length}`);
      console.log(`Successfully updated: ${updatedCount}`);
      console.log(`Errors: ${errorCount}`);
      
      if (updatedCount > 0) {
        console.log('\n✅ Phone numbers fixed successfully!');
        console.log('Examples of changes:');
        console.log('  "2.56705E+11" → "256705000000"');
        console.log('  "751392959" → "256751392959"');
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
fixer.fixPhoneNumbers().catch(console.error);