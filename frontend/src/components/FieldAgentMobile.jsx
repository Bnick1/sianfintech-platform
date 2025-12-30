// src/components/FieldAgentMobile.jsx
import React, { useState } from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';

const FieldAgentMobile = () => {
  const [currentClient, setCurrentClient] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { syncData, getOfflineData } = useOfflineSync();

  const features = {
    offlineAssessment: 'Complete client assessment without internet',
    digitalKYC: 'Capture ID and biometric data with phone camera',
    communityValidation: 'Verify client through local community networks',
    instantScoring: 'Real-time AI-powered credit scoring',
    offlineTransactions: 'Process loans and repayments offline'
  };

  const captureBiometricData = async () => {
    // Simulate biometric capture
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          facialData: 'captured',
          idPhoto: 'stored',
          timestamp: new Date().toISOString()
        });
      }, 2000);
    });
  };

  const performCommunityValidation = (clientData) => {
    // Simulate community validation
    const validators = [
      { type: 'local_leader', verified: true },
      { type: 'group_member', verified: true },
      { type: 'business_associate', verified: true }
    ];
    
    return validators.filter(v => v.verified).length >= 2;
  };

  const handleClientOnboarding = async (clientData) => {
    try {
      // Capture biometric data
      const biometricData = await captureBiometricData();
      
      // Perform community validation
      const communityValidated = performCommunityValidation(clientData);
      
      // Generate instant score
      const instantScore = generateInstantScore({
        ...clientData,
        biometricData,
        communityValidated
      });

      // Store offline if no internet
      if (!isOnline) {
        await syncData('pending_clients', {
          ...clientData,
          biometricData,
          instantScore,
          communityValidated,
          timestamp: new Date().toISOString()
        });
      }

      return { success: true, score: instantScore, communityValidated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const generateInstantScore = (clientData) => {
    let score = 50; // Base score
    
    // Add points for community validation
    if (clientData.communityValidated) score += 20;
    
    // Add points for mobile money usage
    if (clientData.mobileMoneyUsage) score += 15;
    
    // Add points for group memberships
    if (clientData.communityGroups?.length > 0) score += 15;
    
    return Math.min(100, score);
  };

  return (
    <div className="bg-white min-h-screen p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Field Agent Portal</h1>
            <p className="text-blue-100">Offline Client Onboarding</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button className="bg-blue-500 text-white p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">👤</div>
          <div className="font-semibold">New Client</div>
        </button>
        <button className="bg-green-500 text-white p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="font-semibold">Process Loan</div>
        </button>
        <button className="bg-purple-500 text-white p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold">Assess Risk</div>
        </button>
        <button className="bg-orange-500 text-white p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div className="font-semibold">Sync Data</div>
        </button>
      </div>

      {/* Features List */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Field Agent Capabilities</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {Object.entries(features).map(([key, feature]) => (
            <li key={key} className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Pending Sync Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Pending Sync</h3>
        <p className="text-yellow-700 text-sm">
          {isOnline ? 'All data synced' : 'Data will sync when online'}
        </p>
      </div>
    </div>
  );
};

export default FieldAgentMobile;