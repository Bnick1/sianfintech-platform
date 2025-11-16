// App.jsx - Fixed Router issue
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UserRegistration from './pages/UserRegistration';
import AIportal from './pages/AIportal';
import LoanApplication from './pages/LoanApplication';
import InvestmentPlatform from './pages/InvestmentPlatform';
import KioskManagement from './pages/KioskManagement';
import { checkBackendHealth } from './services/api';
import './index.css';
import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import KioskAIportal from './components/KioskAIportal';

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <KioskAIportal />
      </div>
    </LanguageProvider>
  );
}

export default App;

function App() {
  const [backendReady, setBackendReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const isHealthy = await checkBackendHealth();
      setBackendReady(isHealthy);
    } catch (error) {
      console.log('Connection check error:', error);
      setBackendReady(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to SianFinTech...</p>
        </div>
      </div>
    );
  }

  if (!backendReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Backend Not Connected</h2>
          <p className="text-gray-600 mb-6">
            Backend server is not reachable. Please ensure your backend is running on port 8082.
          </p>
          <button 
            onClick={checkConnection}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<UserRegistration />} />
      <Route path="/ai-portal" element={<AIportal />} />
      <Route path="/loan-application" element={<LoanApplication />} />
      <Route path="/investment-platform" element={<InvestmentPlatform />} />
      <Route path="/kiosk-management" element={<KioskManagement />} />
    </Routes>
  );
}

export default App;