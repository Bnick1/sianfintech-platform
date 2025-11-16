// test-connection.js
import { userService } from './src/services/api.js';

async function testConnection() {
  console.log('Testing frontend-backend connection...');
  
  try {
    const response = await userService.register({
      name: 'Connection Test User',
      email: 'connection@test.com',
      phone: '+256700123999'
    });
    console.log('✅ SUCCESS: Frontend connected to backend!');
    console.log('User created:', response.data);
  } catch (error) {
    console.log('❌ FAILED: Frontend cannot connect to backend');
    console.log('Error:', error.message);
  }
}

testConnection();