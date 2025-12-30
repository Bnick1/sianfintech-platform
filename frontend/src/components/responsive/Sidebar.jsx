import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '📊', description: 'AI Overview' },
    { path: '/register', label: 'Client Registration', icon: '👥', description: 'Enhanced' },
    { path: '/ai-portal', label: 'AI Assessment', icon: '🤖', description: 'Credit Risk' },
    { path: '/kiosk-management', label: 'Kiosk Management', icon: '🏪', description: 'Field Assessment' },
    { path: '/loan-application', label: 'Loans', icon: '💰', description: 'Management' },
    { path: '/investment-platform', label: 'Investments', icon: '📈', description: 'Portfolio' },
    { path: '/mobile-money', label: 'Mobile Money', icon: '📱', description: 'Payments' },
    { path: '/reports', label: 'Reports', icon: '📋', description: 'Analytics' },
    { path: '/admin/users', label: 'Admin', icon: '⚙️', description: 'Enhanced' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar w-64 bg-white shadow-lg border-r border-gray-200 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
            <span className="font-bold text-lg">SF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">SianFinTech</span>
            <span className="text-xs text-gray-500 -mt-1">AI-Powered Platform</span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.label}</span>
                {(item.description.includes('AI') || item.description.includes('Enhanced')) && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">AI</span>
                )}
              </div>
              <span className="text-sm text-gray-500">{item.description}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* AI Status */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">AI System Active</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;