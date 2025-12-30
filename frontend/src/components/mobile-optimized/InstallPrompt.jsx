import React from 'react';

const InstallPrompt = ({ onInstall }) => {
  return (
    <div className="install-prompt fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="install-content bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
        <div className="text-center mb-4">
          <div className="text-4xl mb-3">📱</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Install SianFinTech App
          </h3>
          <p className="text-gray-600 text-sm">
            Get the full app experience with offline capabilities, faster loading, and home screen access.
          </p>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={onInstall}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>📥</span>
            <span>Install App</span>
          </button>
          
          <button 
            onClick={() => {}}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Maybe Later
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span>⚡</span>
              <span>Fast</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📶</span>
              <span>Offline</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🔒</span>
              <span>Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;