// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '📊', description: 'AI Overview' },
    { path: '/register', label: 'Client Registration', icon: '👥', description: 'Enhanced' },
    { path: '/ai-portal', label: 'AI Assessment', icon: '🤖', description: 'Credit Risk' },
    { path: '/kiosk-ai', label: 'Kiosk AI', icon: '🏪', description: 'Field Assessment' },
    { path: '/loan-application', label: 'Loans', icon: '💰', description: 'Management' },
    { path: '/investment-platform', label: 'Investments', icon: '📈', description: 'Portfolio' },
    { path: '/admin', label: 'Admin', icon: '⚙️', description: 'Enhanced' },
    { path: '/reports', label: 'Reports', icon: '📋', description: 'Analytics' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Enhanced branding */}
          <div className="flex items-center">
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

          {/* Desktop Navigation - Enhanced with AI indicators */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 min-w-20 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-b from-blue-50 to-blue-100 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-lg">{item.icon}</span>
                  {item.description.includes('AI') || item.description.includes('Enhanced') ? (
                    <span className="text-xs bg-green-500 text-white px-1 rounded">AI</span>
                  ) : null}
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
                <span className="text-xs text-gray-500 mt-1">{item.description}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* AI Status Indicator */}
          <div className="hidden lg:flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">AI Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{item.label}</span>
                    {(item.description.includes('AI') || item.description.includes('Enhanced')) && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">AI</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{item.description}</span>
                </div>
              </Link>
            ))}
            
            {/* Mobile AI Status */}
            <div className="px-3 py-2 border-t border-gray-200 mt-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">AI System: Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;