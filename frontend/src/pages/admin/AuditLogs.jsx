// src/pages/admin/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: 'all',
    user: 'all',
    dateRange: 'today'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const mockLogs = [
    {
      id: 1,
      timestamp: '2024-01-15T10:30:00Z',
      user: 'John Admin',
      action: 'user_login',
      description: 'User logged in successfully',
      ipAddress: '192.168.1.100',
      status: 'success',
      severity: 'info'
    },
    {
      id: 2,
      timestamp: '2024-01-15T10:25:00Z',
      user: 'Sarah Manager',
      action: 'loan_approved',
      description: 'Loan application approved for client #12345',
      ipAddress: '192.168.1.101',
      status: 'success',
      severity: 'info'
    },
    {
      id: 3,
      timestamp: '2024-01-15T10:20:00Z',
      user: 'Mike Analyst',
      action: 'user_created',
      description: 'New user account created: emily.agent',
      ipAddress: '192.168.1.102',
      status: 'success',
      severity: 'info'
    },
    {
      id: 4,
      timestamp: '2024-01-15T10:15:00Z',
      user: 'Unknown',
      action: 'failed_login',
      description: 'Failed login attempt for user admin',
      ipAddress: '203.0.113.45',
      status: 'failed',
      severity: 'warning'
    },
    {
      id: 5,
      timestamp: '2024-01-15T10:10:00Z',
      user: 'John Admin',
      action: 'settings_updated',
      description: 'System settings updated',
      ipAddress: '192.168.1.100',
      status: 'success',
      severity: 'info'
    },
    {
      id: 6,
      timestamp: '2024-01-15T10:05:00Z',
      user: 'System',
      action: 'backup_completed',
      description: 'Automated system backup completed',
      ipAddress: '127.0.0.1',
      status: 'success',
      severity: 'info'
    },
    {
      id: 7,
      timestamp: '2024-01-15T10:00:00Z',
      user: 'Unknown',
      action: 'api_rate_limit',
      description: 'API rate limit exceeded from IP 203.0.113.45',
      ipAddress: '203.0.113.45',
      status: 'failed',
      severity: 'high'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    return status === 'success' 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'user_login': return '🔐';
      case 'failed_login': return '⚠️';
      case 'user_created': return '👤';
      case 'loan_approved': return '💰';
      case 'settings_updated': return '⚙️';
      case 'backup_completed': return '💾';
      case 'api_rate_limit': return '🚫';
      default: return '📝';
    }
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link to="/" className="bg-blue-600 text-white p-2 rounded-lg">
                <span className="font-bold text-lg">Sian</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-sm text-gray-600">Monitor system activity and security events</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/"
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
            <span className="text-red-600 mr-2">📋</span>
            <div>
              <p className="text-red-800 font-medium">Security Monitoring</p>
              <p className="text-red-700 text-sm">All system activities are logged for security and compliance</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  🔍
                </div>
              </div>
              
              <select
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Actions</option>
                <option value="user_login">User Logins</option>
                <option value="failed_login">Failed Logins</option>
                <option value="user_created">User Creation</option>
                <option value="settings_updated">Settings Changes</option>
              </select>

              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
              <span className="mr-2">📤</span>
              Export Logs
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
            <p className="text-sm text-gray-600">Total Events</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {logs.filter(log => log.status === 'success').length}
            </p>
            <p className="text-sm text-gray-600">Successful</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-red-600">
              {logs.filter(log => log.status === 'failed').length}
            </p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {logs.filter(log => log.severity === 'high').length}
            </p>
            <p className="text-sm text-gray-600">High Severity</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.user}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getActionIcon(log.action)}</span>
                        <span className="text-sm text-gray-900 capitalize">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search criteria' : 'No audit logs available for the selected period'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-500"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;