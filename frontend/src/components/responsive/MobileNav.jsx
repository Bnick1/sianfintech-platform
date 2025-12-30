import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MobileNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/register', icon: '👤', label: 'Register' },
    { path: '/loan-application', icon: '💰', label: 'Loans' },
    { path: '/mobile-money', icon: '📱', label: 'Payments' },
    { path: '/ai-portal', icon: '🤖', label: 'AI Portal' },
    { path: '/reports', icon: '📈', label: 'Reports' },
    { path: '/help', icon: '❓', label: 'Help' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="mobile-nav">
      {/* Top Mobile Header */}
      <div className="mobile-header bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors"
            >
              ☰
            </button>
            <h1 className="text-lg font-bold">SianFinTech</h1>
          </div>
          <div className="text-sm bg-blue-500 px-2 py-1 rounded-full">
            Mobile
          </div>
        </div>
      </div>

      {/* Slide-out Menu */}
      {isMenuOpen && (
        <div 
          className="mobile-menu fixed inset-0 z-50 bg-black bg-opacity-50" 
          onClick={closeMenu}
        >
          <div 
            className="w-64 h-full bg-white shadow-xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button 
                  onClick={closeMenu}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <nav className="p-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {/* Admin Section Separator */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Admin
                </h3>
                <Link
                  to="/admin/users"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xl">👥</span>
                  <span className="font-medium">Users</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 shadow-lg">
        <div className="flex justify-around">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;