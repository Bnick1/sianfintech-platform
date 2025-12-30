// src/pages/admin/SecurityCenter.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SecurityCenter = () => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordExpiry: 90,
    sessionTimeout: 30,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
    ipWhitelist: false,
    apiRateLimit: 1000,
    failedLoginLockout: 5
  });

  const [securityEvents, setSecurityEvents] = useState([
    {
      id: 1,
      type: 'failed_login',
      description: 'Multiple failed login attempts from unknown IP',
      severity: 'high',
      timestamp: '2024-01-15T10:15:00Z',
      status: 'investigating',
      ipAddress: '203.0.113.45'
    },
    {
      id: 2,
      type: 'password_change',
      description: 'User password changed successfully',
      severity: 'info',
      timestamp: '2024-01-15T09:30:00Z',
      status: 'resolved',
      ipAddress: '192.168.1.100'
    },
    {
      id: 3,
      type: 'new_device',
      description: 'Login from new device detected',
      severity: 'medium',
      timestamp: '2024-01-15T08:45:00Z',
      status: 'resolved',
      ipAddress: '192.168.1.101'
    },
    {
      id: 4,
      type: 'api_rate_limit',
      description: 'API rate limit exceeded',
      severity: 'medium',
      timestamp: '2024-01-15T08:30:00Z',
      status: 'resolved',
      ipAddress: '203.0.113.46'
    }
  ]);

  const [activeThreats, setActiveThreats] = useState([
    {
      id: 1,
      type: 'brute_force',
      description: 'Suspected brute force attack in progress',
      severity: 'high',
      firstDetected: '2024-01-15T10:00:00Z',
      affectedUsers: 3,
      status: 'active'
    }
  ]);

  const handleSettingChange = (key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resolveEvent = (eventId) => {
    setSecurityEvents(events =>
      events.map(event =>
        event.id === eventId ? { ...event, status: 'resolved' } : event
      )
    );
  };

  const blockIP = (ipAddress) => {
    if (window.confirm(`Block IP address ${ipAddress}?`)) {
      alert(`IP address ${ipAddress} has been blocked.`);
    }
  };

  const runSecurityScan = () => {
    alert('Security scan initiated. This may take a few minutes...');
    // Simulate scan completion
    setTimeout(() => {
      alert('Security scan completed. No critical issues found.');
    }, 3000);
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
                <h1 className="text-xl font-bold text-gray-900">Security Center</h1>
                <p className="text-sm text-gray-600">Monitor and manage security settings</p>
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
        {/* Security Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">🛡️</div>
            <p className="text-sm text-gray-600">System Secure</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600">
              {activeThreats.length}
            </div>
            <p className="text-sm text-gray-600">Active Threats</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">98%</div>
            <p className="text-sm text-gray-600">Security Score</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {securityEvents.filter(e => e.status !== 'resolved').length}
            </div>
            <p className="text-sm text-gray-600">Pending Events</p>
          </div>
        </div>

        {/* Active Threats */}
        {activeThreats.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">🚨</span>
                <h2 className="text-lg font-semibold text-red-900">Active Security Threats</h2>
              </div>
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {activeThreats.length} Active
              </span>
            </div>
            <div className="space-y-3">
              {activeThreats.map(threat => (
                <div key={threat.id} className="flex items-center justify-between p-3 bg-white border border-red-300 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{threat.description}</h3>
                    <p className="text-sm text-gray-500">
                      First detected: {new Date(threat.firstDetected).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              <button 
                onClick={runSecurityScan}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Run Security Scan
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(securitySettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    {typeof value === 'number' && (
                      <p className="text-xs text-gray-500 mt-1">{value} {key.includes('Timeout') ? 'minutes' : key.includes('Limit') ? 'requests/hour' : 'days'}</p>
                    )}
                  </div>
                  {typeof value === 'boolean' ? (
                    <button
                      onClick={() => handleSettingChange(key, !value)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        value ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          value ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  ) : (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleSettingChange(key, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Security Events</h2>
              <span className="text-sm text-gray-500">
                {securityEvents.length} total
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {securityEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{event.description}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                      <span>IP: {event.ipAddress}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {event.status !== 'resolved' && (
                      <button 
                        onClick={() => resolveEvent(event.id)}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Resolve
                      </button>
                    )}
                    <button 
                      onClick={() => blockIP(event.ipAddress)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Block IP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Recommendations */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Enable 2FA</h3>
              <p className="text-sm text-blue-700">Require two-factor authentication for all admin accounts</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Password Policy</h3>
              <p className="text-sm text-yellow-700">Enforce strong password requirements for all users</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">API Rate Limiting</h3>
              <p className="text-sm text-green-700">Implement rate limiting on all API endpoints</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Security Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Export Security Logs
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
              Update Firewall Rules
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
              Review User Permissions
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
              Emergency Lockdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;