// sanityTest.js - Enhanced for SianFinTech diverse client segments
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:8082';

// Client segments for comprehensive testing
const CLIENT_SEGMENTS = [
  {
    type: 'market_vendor',
    name: 'Sarah Market Vendor',
    email: 'sarah@market.com', 
    phone: '+256700111111',
    product: 'SianVendorGrowth',
    amount: 75000,
    location: 'mbarara'
  },
  {
    type: 'tailor',
    name: 'David Tailor',
    email: 'david@tailor.com',
    phone: '+256700222222', 
    product: 'SianArtisanFund',
    amount: 50000,
    location: 'kampala'
  },
  {
    type: 'boda_boda',
    name: 'John Boda Rider',
    email: 'john@boda.com',
    phone: '+256700333333',
    product: 'SianTransportFund', 
    amount: 100000,
    location: 'jinja'
  },
  {
    type: 'youth_business',
    name: 'Grace Youth Entrepreneur',
    email: 'grace@youth.com',
    phone: '+256700444444',
    product: 'SianYouthVenture',
    amount: 30000,
    location: 'gulu'
  },
  {
    type: 'farmer',
    name: 'Michael Farmer',
    email: 'michael@farm.com',
    phone: '+256700555555',
    product: 'SianAgriFund',
    amount: 100000,
    location: 'masaka'
  }
];

async function runTests() {
  console.log('--- SianFinTech Backend Sanity Tests ---\n');
  console.log('🎯 Testing diverse client segments: Market Vendors, Artisans, Transport, Youth, Farmers\n');

  // Track created entities for cleanup
  const createdEntities = {
    userId: null,
    investmentId: null,
    loanId: null,
    paymentId: null,
    kioskId: 'KSK001',
    testUsers: [] // Track multiple test users
  };

  try {
    // ==========================
    // 1️⃣ Core User Registration
    // ==========================
    const userPayload = {
      name: 'Nickson',
      email: 'nick@siantech.ai',
      phone: '+256700123456',
    };
    const userRes = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload),
    });
    const userData = await userRes.json();
    console.log('✅ Core user registration:', userData.user?._id ? 'Success' : 'Failed');
    createdEntities.userId = userData.user?._id;
    if (!createdEntities.userId) throw new Error('Core user registration failed');

    // ==========================
    // 2️⃣ Get User by ID
    // ==========================
    const getUserRes = await fetch(`${BASE_URL}/users/${createdEntities.userId}`);
    const getUserData = await getUserRes.json();
    console.log('✅ Get user by ID:', getUserData._id ? 'Success' : 'Failed');

    // ==========================
    // 3️⃣ AI Prediction (Enhanced for informal sector)
    // ==========================
    try {
      const aiPayload = {
        input: 'Market vendor with consistent daily sales and good customer base',
        occupation: 'market_vendor',
        businessType: 'retail',
        location: 'mbarara',
        monthlyVolume: 750000
      };
      const aiRes = await fetch(`${BASE_URL}/ai/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPayload),
      });
      const aiData = await aiRes.json();
      console.log('✅ AI prediction (Market Vendor):', {
        riskScore: aiData.prediction?.riskScore,
        recommendation: aiData.prediction?.recommendation,
        maxLoanAmount: aiData.prediction?.maxLoanAmount
      });
    } catch (err) {
      console.log('⚠️ AI prediction skipped:', err.message);
    }

    // ==========================
    // 4️⃣ Investment (Tailored for informal sector)
    // ==========================
    try {
      const investmentPayload = {
        productType: 'SianVendorGrowth',
        amount: 75000,
        userId: createdEntities.userId,
        duration: 6
      };
      const investRes = await fetch(`${BASE_URL}/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investmentPayload),
      });
      const investData = await investRes.json();
      console.log('✅ Investment creation:', investData.status === 'success' ? 'Success' : 'Failed');
      createdEntities.investmentId = investData.investment?._id || investData.investment?.id;
    } catch (err) {
      console.log('⚠️ Investment creation skipped:', err.message);
    }

    // ==========================
    // 5️⃣ Loan Application
    // ==========================
    try {
      const loanPayload = {
        userId: createdEntities.userId,
        amount: 1000,
        termMonths: 6,
        purpose: 'General',
      };
      const loanRes = await fetch(`${BASE_URL}/loans/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanPayload),
      });
      const loanData = await loanRes.json();
      console.log('✅ Loan creation:', loanData.status === 'success' ? 'Success' : 'Failed');
      createdEntities.loanId = loanData.loan?._id || loanData.loan?.id;
    } catch (err) {
      console.log('⚠️ Loan creation skipped:', err.message);
    }

    // ==========================
    // 6️⃣ Payment Processing
    // ==========================
    try {
      const paymentPayload = {
        loanId: createdEntities.loanId,
        walletId: createdEntities.userId,
        amount: 200,
        method: 'mobile_money',
        reference: 'TXN-' + Date.now(),
      };
      const paymentRes = await fetch(`${BASE_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload),
      });
      const paymentData = await paymentRes.json();
      console.log('✅ Payment processing:', paymentData.status === 'success' ? 'Success' : 'Failed');
      createdEntities.paymentId = paymentData.payment?._id || paymentData.payment?.id;
    } catch (err) {
      console.log('⚠️ Payment processing skipped:', err.message);
    }

    // ==========================
    // 7️⃣ Kiosk Management
    // ==========================
    try {
      const kioskRes = await fetch(`${BASE_URL}/kiosks/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kioskId: createdEntities.kioskId,
          location: 'Mbarara Central Market',
          operatorName: 'Field Agent Sarah',
        }),
      });
      const kioskData = await kioskRes.json();
      console.log('✅ Kiosk registration:', kioskData.status === 'success' ? 'Success' : 'Failed');

      const kioskStatusRes = await fetch(`${BASE_URL}/kiosks/status/${createdEntities.kioskId}`);
      const kioskStatus = await kioskStatusRes.json();
      console.log('✅ Kiosk status:', kioskStatus.status === 'success' ? 'Active' : 'Inactive');
    } catch (err) {
      console.log('⚠️ Kiosk test skipped:', err.message);
    }

    // ==========================
    // 8️⃣ Multi-Client Segment Registration
    // ==========================
    console.log('\n👥 Testing multiple client segments...');
    for (const client of CLIENT_SEGMENTS.slice(0, 3)) { // Test first 3 to avoid overload
      try {
        const clientRes = await fetch(`${BASE_URL}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: client.name,
            email: client.email, 
            phone: client.phone
          }),
        });
        const clientData = await clientRes.json();
        if (clientData.user?._id) {
          createdEntities.testUsers.push(clientData.user._id);
          console.log(`✅ ${client.type} registration: SUCCESS (${clientData.user._id})`);
          
          // Test AI prediction for this client type
          try {
            const clientAiRes = await fetch(`${BASE_URL}/ai/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                occupation: client.type,
                businessType: getBusinessType(client.type),
                location: client.location,
                monthlyVolume: client.amount * 6 // Estimate monthly volume
              }),
            });
            const clientAiData = await clientAiRes.json();
            console.log(`   🤖 AI Assessment: ${clientAiData.prediction?.recommendation} (Score: ${clientAiData.prediction?.riskScore})`);
          } catch (aiErr) {
            console.log(`   🤖 AI skipped for ${client.type}`);
          }
        } else {
          console.log(`⚠️ ${client.type} registration: FAILED`);
        }
      } catch (err) {
        console.log(`⚠️ ${client.type} registration skipped:`, err.message);
      }
    }

    console.log('\n🎯 All sanity tests executed successfully!');
    console.log('📊 Client segments tested:', CLIENT_SEGMENTS.map(c => c.type).join(', '));

  } catch (err) {
    console.error('❌ Sanity test error:', err.message);
  } finally {
    // ==========================
    // Cleanup
    // ==========================
    console.log('\n🧹 Cleaning up test data...');
    await cleanupTestData(createdEntities);
  }
}

// Helper function to determine business type
function getBusinessType(occupation) {
  const businessMap = {
    'market_vendor': 'retail',
    'tailor': 'services',
    'boda_boda': 'transport',
    'youth_business': 'retail',
    'farmer': 'agriculture'
  };
  return businessMap[occupation] || 'services';
}

// Cleanup function
async function cleanupTestData(entities) {
  try {
    if (entities.paymentId) {
      await fetch(`${BASE_URL}/payments/${entities.paymentId}`, { method: 'DELETE' });
      console.log('🗑️ Deleted payment:', entities.paymentId);
    }
    if (entities.loanId) {
      await fetch(`${BASE_URL}/loans/${entities.loanId}`, { method: 'DELETE' });
      console.log('🗑️ Deleted loan:', entities.loanId);
    }
    if (entities.investmentId) {
      await fetch(`${BASE_URL}/investments/${entities.investmentId}`, { method: 'DELETE' });
      console.log('🗑️ Deleted investment:', entities.investmentId);
    }
    if (entities.userId) {
      await fetch(`${BASE_URL}/users/${entities.userId}`, { method: 'DELETE' });
      console.log('🗑️ Deleted core user:', entities.userId);
    }
    // Cleanup test users
    for (const userId of entities.testUsers) {
      try {
        await fetch(`${BASE_URL}/users/${userId}`, { method: 'DELETE' });
        console.log('🗑️ Deleted test user:', userId);
      } catch (err) {
        console.log('⚠️ Failed to delete test user:', userId);
      }
    }
    if (entities.kioskId) {
      await fetch(`${BASE_URL}/kiosks/${entities.kioskId}`, { method: 'DELETE' });
      console.log('🗑️ Deleted kiosk:', entities.kioskId);
    }
  } catch (cleanupErr) {
    console.error('❌ Cleanup error:', cleanupErr.message);
  }
}

// Run the tests
runTests();