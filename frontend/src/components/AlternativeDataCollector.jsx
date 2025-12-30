// src/components/AlternativeDataCollector.jsx
import React, { useState } from 'react';

const AlternativeDataCollector = () => {
  const [clientData, setClientData] = useState({
    // Mobile Money Data
    mobileMoney: {
      provider: '',
      averageMonthlyTransactions: 0,
      averageBalance: 0,
      transactionFrequency: 'daily',
      commonTransactionTypes: []
    },
    
    // Social Capital Data
    socialCapital: {
      communityGroups: [],
      membershipDuration: 0,
      leadershipRoles: [],
      meetingAttendance: 'regular'
    },
    
    // Business Activity Data
    businessActivity: {
      customerTraffic: 'high', // high/medium/low
      supplierRelationships: [],
      seasonalPatterns: [],
      inventoryTurnover: 0
    },
    
    // Behavioral Data
    behavioralPatterns: {
      savingsConsistency: 'consistent',
      emergencyFundUsage: 'occasional',
      repaymentHabits: 'timely',
      digitalAdoption: 'high'
    }
  });

  const mobileMoneyProviders = [
    { value: 'mtn', label: 'MTN Mobile Money', icon: '📱' },
    { value: 'airtel', label: 'Airtel Money', icon: '📱' },
    { value: 'africell', label: 'Africell Money', icon: '📱' }
  ];

  const transactionFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const communityGroups = [
    'Village Savings Group (VSLA)',
    'Farmers Cooperative',
    'Trade Association',
    'Religious Group',
    'Community Development Group',
    'Women\'s Group',
    'Youth Group'
  ];

  const handleDataCollection = (section, field, value) => {
    setClientData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const calculateAlternativeScore = () => {
    let score = 0;
    
    // Mobile Money Scoring (0-40 points)
    if (clientData.mobileMoney.averageMonthlyTransactions > 20) score += 20;
    if (clientData.mobileMoney.averageBalance > 100000) score += 20;
    
    // Social Capital Scoring (0-30 points)
    score += clientData.socialCapital.communityGroups.length * 5;
    if (clientData.socialCapital.meetingAttendance === 'regular') score += 10;
    
    // Business Activity Scoring (0-20 points)
    if (clientData.businessActivity.customerTraffic === 'high') score += 10;
    if (clientData.businessActivity.inventoryTurnover > 2) score += 10;
    
    // Behavioral Scoring (0-10 points)
    if (clientData.behavioralPatterns.repaymentHabits === 'timely') score += 10;
    
    return Math.min(100, score);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Alternative Data Collection
      </h2>
      
      {/* Mobile Money Section */}
      <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📱 Mobile Money Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Provider</label>
            <select
              value={clientData.mobileMoney.provider}
              onChange={(e) => handleDataCollection('mobileMoney', 'provider', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select Provider</option>
              {mobileMoneyProviders.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Average Monthly Transactions
            </label>
            <input
              type="number"
              value={clientData.mobileMoney.averageMonthlyTransactions}
              onChange={(e) => handleDataCollection('mobileMoney', 'averageMonthlyTransactions', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Social Capital Section */}
      <div className="mb-6 p-4 border border-green-200 rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold text-green-900 mb-4">👥 Social Capital</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Community Group Memberships
            </label>
            <div className="space-y-2">
              {communityGroups.map(group => (
                <label key={group} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={clientData.socialCapital.communityGroups.includes(group)}
                    onChange={(e) => {
                      const updatedGroups = e.target.checked
                        ? [...clientData.socialCapital.communityGroups, group]
                        : clientData.socialCapital.communityGroups.filter(g => g !== group);
                      handleDataCollection('socialCapital', 'communityGroups', updatedGroups);
                    }}
                    className="rounded border-gray-300 text-blue-600 shadow-sm"
                  />
                  <span className="ml-2 text-sm text-gray-700">{group}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Alternative Credit Score</h3>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-blue-600">
            {calculateAlternativeScore()}/100
          </div>
          <div className="text-sm text-gray-600">
            Based on mobile money, social capital, and behavioral data
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlternativeDataCollector;