import dotenv from 'dotenv';
dotenv.config();

// Test basic crypto functionality first
async function testBasicCrypto() {
  console.log('🧪 Testing Basic Crypto Setup...\n');
  
  try {
    // Test 1: Check if environment variables are loaded
    console.log('1. Checking Environment Variables...');
    console.log('BLOCKCYPHER_API_KEY:', process.env.BLOCKCYPHER_API_KEY ? '✅ Loaded' : '❌ Missing');
    console.log('INFURA_API_KEY:', process.env.INFURA_API_KEY ? '✅ Loaded' : '❌ Missing');
    
    // Test 2: Check if dependencies are installed
    console.log('\n2. Checking Dependencies...');
    try {
      const { ethers } = await import('ethers');
      console.log('✅ Ethers.js: Loaded');
      
      const bitcoin = await import('bitcoinjs-lib');
      console.log('✅ BitcoinJS: Loaded');
      
      const CryptoJS = await import('crypto-js');
      console.log('✅ CryptoJS: Loaded');
      
      const axios = await import('axios');
      console.log('✅ Axios: Loaded');
    } catch (err) {
      console.log('❌ Dependency error:', err.message);
    }
    
    // Test 3: Simple API calls
    console.log('\n3. Testing API Connectivity...');
    try {
      const axios = await import('axios');
      
      // Test CoinGecko API (for prices)
      const priceResponse = await axios.default.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );
      console.log('✅ CoinGecko API: Working - BTC Price:', priceResponse.data.bitcoin.usd);
      
      // Test BlockCypher API
      const bcResponse = await axios.default.get(
        `https://api.blockcypher.com/v1/btc/main?token=${process.env.BLOCKCYPHER_API_KEY}`
      );
      console.log('✅ BlockCypher API: Working');
      
    } catch (apiError) {
      console.log('❌ API Test failed:', apiError.message);
    }
    
    console.log('\n🎉 Basic crypto setup is working!');
    
  } catch (error) {
    console.error('❌ Crypto test failed:', error.message);
  }
}

testBasicCrypto();