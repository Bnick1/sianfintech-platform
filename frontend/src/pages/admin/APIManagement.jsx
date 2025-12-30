// src/pages/admin/APIManagement.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const APIManagement = () => {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Mobile App API',
      key: 'sk_live_abc123def456',
      created: '2024-01-01T00:00:00Z',
      lastUsed: '2024-01-15T10:30:00Z',
      status: 'active',
      permissions: ['read:clients', 'write:transactions', 'read:loans']
    },
    {
      id: 2,
      name: 'Partner Integration',
      key: 'sk_live_xyz789uvw012',
      created: '2024-01-05T00:00:00Z',
      lastUsed: '2024-01-14T15:45:00Z',
      status: 'active',
      permissions: ['read:clients', 'read:loans']
    },
    {
      id: 3,
      name: 'Internal Dashboard',
      key: 'sk_live_internal_789',
      created: '2024-01-10T00:00:00Z',
      lastUsed: '2024-01-15T09:20:00Z',
      status: 'revoked',
      permissions: ['read:*', 'write:*']
    }
  ]);

  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);

  const availablePermissions = [
    'read:clients',
    'write:clients',
    'read:loans',
    'write:loans',
    'read:transactions',
    'write:transactions',
    'read:investments',
    'write:investments',
    'read:reports',
    'admin:system'
  ];

  const generateNewKey = () => {
    if (!newKeyName.trim()) return;
    
    const newKey = {
      id: apiKeys.length + 1,
      name: newKeyName,
      key: 'sk_live_' + Math.random().toString(36).substr(2, 16),
      created: new Date().toISOString(),
      lastUsed: 'Never',
      status: 'active',
      permissions: selectedPermissions
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setSelectedPermissions([]);
    setShowNewKeyForm(false);
  };

  const revokeKey = (keyId) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, status: 'revoked' } : key
      ));
    }
  };

  const regenerateKey = (keyId) => {
    if (window.confirm('Regenerating this key will invalidate the current key. Continue?')) {
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { 
          ...key, 
          key: 'sk_live_' + Math.random().toString(36).substr(2, 16),
          lastUsed: 'Never'
        } : key
      ));
    }
  };

  const togglePermission = (permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link to="/admin/sian" className="bg-blue-600 text-white p-2 rounded-lg">
                <span className="font-bold text-lg">Sian</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">API Management</h1>
                <p className="text-sm text-gray-600">Manage API keys and endpoints</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/sian"
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Admin Alert */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">🔑</span>
            <div>
              <p className="text-red-800 font-medium">API Security Management</p>
              <p className="text-red-700 text-sm">API keys provide full access to system data. Handle with care.</p>
            </div>
          </div>
        </div>

        {/* API Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{apiKeys.length}</div>
            <p className="text-sm text-gray-600">Total API Keys</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {apiKeys.filter(k => k.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Active Keys</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">1,247</div>
            <p className="text-sm text-gray-600">API Calls Today</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">99.8%</div>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Keys List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                <button 
                  onClick={() => setShowNewKeyForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <span className="mr-2">+</span>
                  Generate New Key
                </button>
              </div>
              
              <div className="space-y-4">
                {apiKeys.map(apiKey => (
                  <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                        <p className="text-sm text-gray-500 font-mono mt-1 bg-gray-50 p-2 rounded">
                          {apiKey.key}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Created: {formatDate(apiKey.created)}</span>
                          <span>Last used: {apiKey.lastUsed}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apiKey.status)}`}>
                          {apiKey.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Permissions */}
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map(permission => (
                          <span 
                            key={permission}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => regenerateKey(apiKey.id)}
                        disabled={apiKey.status === 'revoked'}
                        className="text-blue-600 hover:text-blue-900 text-sm disabled:text-gray-400"
                      >
                        Regenerate
                      </button>
                      <button 
                        onClick={() => revokeKey(apiKey.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        {apiKey.status === 'active' ? 'Revoke' : 'Revoked'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generate New Key Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {showNewKeyForm ? 'Generate New API Key' : 'Quick Actions'}
            </h2>
            
            {showNewKeyForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Name *
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availablePermissions.map(permission => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={generateNewKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    Generate Key
                  </button>
                  <button
                    onClick={() => setShowNewKeyForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={() => setShowNewKeyForm(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">🔑</span>
                  Generate New API Key
                </button>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Security Tips</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Never share API keys in client-side code</li>
                    <li>• Regularly rotate production keys</li>
                    <li>• Use minimal required permissions</li>
                    <li>• Monitor API usage logs</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Base URL</h3>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                https://api.sianfintech.com/v1
              </code>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Authentication</h3>
              <code className="text-sm bg-gray-100 p-2 rounded block">
                Authorization: Bearer sk_live_your_api_key
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIManagement;