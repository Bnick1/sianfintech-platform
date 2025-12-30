import axios from 'axios';

const testData = {
  occupation: 'market_vendor',
  transactionHistory: { averageMonthlyIncome: 1500000, consistency: 0.8 },
  mobileMoneyData: { averageBalance: 280000, frequency: 'daily' },
  socialData: { communityInvolvement: true, references: 2 },
  locationData: { region: 'Central' }
};

// Test the new informal sector assessment
axios.post('http://localhost:8082/api/ai/informal-sector-assessment', testData)
  .then(response => {
    console.log('✅ Informal Sector Assessment:', response.data.comprehensiveScore);
  });