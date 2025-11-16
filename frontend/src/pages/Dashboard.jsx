import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const quickActions = [
    {
      title: 'Register Client',
      description: 'Add new client from diverse sectors',
      icon: '👤',
      path: '/register'
    },
    {
      title: 'AI Assessment',
      description: 'AI-driven financial analysis',
      icon: '🤖', 
      path: '/ai-portal'
    },
    {
      title: 'Loan Application',
      description: 'Process new loan requests',
      icon: '💰',
      path: '/loan-application'
    },
    {
      title: 'Investments',
      description: 'Manage investment platform', 
      icon: '📈',
      path: '/investment-platform'
    },
    {
      title: 'Kiosk Management',
      description: 'Manage active kiosks',
      icon: '🏪',
      path: '/kiosk-management'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to SianFinTech
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering Uganda's informal economy through AI-driven financial inclusion
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">👥</div>
              <span className="text-sm text-green-600 font-semibold">+12% from last month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">1,247</h3>
            <p className="text-gray-600">Total Clients</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">💰</div>
              <span className="text-sm text-green-600 font-semibold">+8% from last month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">UGX 856M</h3>
            <p className="text-gray-600">Active Loans</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">📈</div>
              <span className="text-sm text-green-600 font-semibold">+15% from last month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">UGX 1.2B</h3>
            <p className="text-gray-600">Investments</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">🏪</div>
              <span className="text-sm text-green-600 font-semibold">+3 from last month</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">48</h3>
            <p className="text-gray-600">Kiosks Active</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 border border-gray-200 hover:border-blue-500"
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">{action.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-900">{action.title}</h3>
                </div>
                <p className="text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;