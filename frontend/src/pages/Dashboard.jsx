// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getRecentActivity, getSystemStatus, testBackendEndpoints, getPlatformAnalytics } from '../services/dashboardService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [platformAnalytics, setPlatformAnalytics] = useState(null);
  const [backendTest, setBackendTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [stats, activityData, status, analytics] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(),
          getSystemStatus(),
          getPlatformAnalytics()
        ]);

        setDashboardData(stats);
        setActivities(activityData);
        setSystemStatus(status);
        setPlatformAnalytics(analytics);
        setLastUpdated(new Date().toLocaleTimeString());
        
        console.log('📈 Real dashboard data loaded successfully');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const runBackendTest = async () => {
    setBackendTest({ loading: true });
    const results = await testBackendEndpoints();
    setBackendTest({ loading: false, results });
  };

  const quickActions = [
    {
      title: 'Admin Portal',
      icon: '⚙️',
      path: '/admin',
      color: 'bg-red-500 hover:bg-red-600',
      description: 'All platform operations & management'
    }
  ];

  const statCards = [
    {
      key: 'clients',
      title: 'Total Clients',
      value: dashboardData?.totalClients?.toLocaleString() || '0',
      change: dashboardData?.dataQuality === 'real' ? 'Live Data' : '+13.1%',
      amount: 'Registered Users',
      icon: '👥',
      color: 'blue',
      borderColor: 'border-l-blue-500',
      badgeColor: dashboardData?.dataQuality === 'real' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800',
      description: dashboardData?.dataQuality === 'real' ? 'Real user count from database' : 'Enhanced registration clients'
    },
    {
      key: 'activeLoans',
      title: 'Active Loans',
      value: dashboardData?.activeLoans?.toLocaleString() || '0',
      change: dashboardData?.dataQuality === 'real' ? 'Live Portfolio' : '+15.0%',
      amount: dashboardData?.portfolioValue ? `UGX ${Math.floor(dashboardData.portfolioValue).toLocaleString()}` : 'USD 1.2B',
      icon: '💰',
      color: 'green',
      borderColor: 'border-l-green-500',
      badgeColor: dashboardData?.dataQuality === 'real' ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800',
      description: dashboardData?.dataQuality === 'real' ? 'Current loan portfolio' : 'AI-optimized portfolio'
    },
    {
      key: 'aiAssessments',
      title: 'AI Assessments',
      value: dashboardData?.totalPayments?.toLocaleString() || '0',
      change: dashboardData?.dataQuality === 'real' ? 'Live Activity' : '+28%',
      amount: dashboardData?.dataQuality === 'real' ? 'Payment Transactions' : '94% Accuracy',
      icon: '🤖',
      color: 'purple',
      borderColor: 'border-l-purple-500',
      badgeColor: dashboardData?.dataQuality === 'real' ? 'bg-purple-100 text-purple-800' : 'bg-purple-100 text-purple-800',
      description: dashboardData?.dataQuality === 'real' ? 'Total payment transactions' : 'Enhanced scoring completed'
    },
    {
      key: 'kiosks',
      title: 'Active Kiosks',
      value: dashboardData?.activeKiosks?.toLocaleString() || '0',
      change: dashboardData?.dataQuality === 'real' ? 'Live Status' : '+8%',
      amount: dashboardData?.totalInvestments ? `${dashboardData.totalInvestments} Investments` : 'Multiple segments',
      icon: '🏪',
      color: 'orange',
      borderColor: 'border-l-orange-500',
      badgeColor: dashboardData?.dataQuality === 'real' ? 'bg-orange-100 text-orange-800' : 'bg-orange-100 text-orange-800',
      description: dashboardData?.dataQuality === 'real' ? 'Operational service points' : 'Service network coverage'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading real data from backend...</p>
          <p className="text-sm text-gray-500">Connecting to database APIs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Global Financial Inclusion Platform</h1>
              <p className="text-gray-600 mt-1">AI-powered insights for emerging markets</p>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`text-sm ${
                  systemStatus?.backend?.status === 'operational' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  Backend: {systemStatus?.backend?.status} • 
                </span>
                <span className={`text-sm ${
                  dashboardData?.dataQuality === 'real' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  Data: {dashboardData?.dataQuality === 'real' ? 'Live from Database' : 'Mock Data'}
                </span>
                {lastUpdated && (
                  <span className="text-sm text-gray-500">
                    • Updated: {lastUpdated}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemStatus?.backend?.status === 'operational' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {systemStatus?.backend?.status === 'operational' ? '✅ Live Data' : '⚠️ Checking'}
              </div>
              <button 
                onClick={runBackendTest}
                disabled={backendTest?.loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm"
              >
                {backendTest?.loading ? 'Testing...' : 'Test APIs'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {backendTest?.results && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Backend API Test Results</h3>
              <span className="text-sm text-gray-500">
                {backendTest.results.filter(r => r.connected).length} of {backendTest.results.length} endpoints connected
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {backendTest.results.map((result, index) => (
                <div key={index} className={`p-3 rounded border ${
                  result.connected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{result.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.connected ? '✅ Connected' : '❌ Failed'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {result.details}
                    {result.responseTime && ` • ${result.responseTime}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to SianFinTech Global</h2>
              <p className="text-blue-100">Empowering informal economies with AI-driven financial solutions</p>
              <p className="text-blue-100 text-sm mt-2">
                {dashboardData?.dataQuality === 'real' ? (
                  <>✅ <strong>Live Data</strong> - Connected to real database • Auto-refresh every 30s</>
                ) : (
                  <>⚠️ <strong>Mock Data</strong> - Backend data unavailable • Using simulated metrics</>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="text-sm">Active Tenants</div>
                <div className="font-bold">{platformAnalytics?.activeTenants || 1}</div>
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="text-sm">API Calls Today</div>
                <div className="font-bold">{platformAnalytics?.apiCallsToday?.toLocaleString() || '0'}</div>
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="text-sm">Data Quality</div>
                <div className="font-bold">{dashboardData?.dataQuality === 'real' ? 'Live' : 'Mock'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.key} className={`bg-white rounded-xl p-6 border-l-4 ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    card.color === 'blue' ? 'bg-blue-100' :
                    card.color === 'green' ? 'bg-green-100' :
                    card.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    <span className="text-xl">{card.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-gray-500 text-sm">{card.description}</p>
                  </div>
                </div>
                <span className={`${card.badgeColor} px-3 py-1 rounded-full text-sm font-medium`}>
                  {card.change}
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                {card.amount && (
                  <div className="text-lg font-semibold text-gray-900">
                    {card.amount}
                  </div>
                )}
              </div>
              {dashboardData?.dataQuality === 'real' && (
                <div className="mt-2 text-xs text-green-600">
                  ✅ Live from database
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Global Operations Center</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-tight">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <span className="text-xs text-gray-500">
                {activities.filter(a => a.source === 'backend').length > 0 ? 'Live' : 'Mock'}
              </span>
            </div>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      activity.type === 'success' ? 'bg-green-500' : 
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      {activity.type === 'success' ? '✓' : activity.type === 'warning' ? '!' : 'i'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-600">{activity.timestamp}</p>
                        {activity.source === 'backend' && (
                          <span className="bg-green-100 text-green-800 text-xs px-1 rounded">Live</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.type === 'success' ? 'bg-green-100 text-green-800' :
                    activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            • SianFinTech Platform • {dashboardData?.dataQuality === 'real' ? 'Live Database Connection' : 'Mock Data Mode'} • 
            Auto-Refresh • Last update: {lastUpdated} •
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;