import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { systemAPI, tenantsAPI } from '../../../services/apiService';

const SianSystem = () => {
  const navigate = useNavigate();
  const [systemHealth, setSystemHealth] = useState({});
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const [healthData, tenantsData] = await Promise.all([
        systemAPI.getHealth(),
        tenantsAPI.getTenants()
      ]);
      
      setSystemHealth(healthData);
      setTenants(tenantsData);
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthLabel = (status) => {
    switch (status) {
      case 'healthy': return 'All Systems Operational';
      case 'degraded': return 'Partial Outage';
      case 'unhealthy': return 'Major Outage';
      default: return 'Unknown Status';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">SianFinTech - Global System Monitoring</p>
        </div>
        <button
          onClick={() => navigate('/admin/sian')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* System Status Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">System Status</h2>
          <button
            onClick={fetchSystemData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh Status
          </button>
        </div>

        <div className={`p-6 rounded-lg mb-6 ${
          systemHealth.status === 'healthy' ? 'bg-green-50 border border-green-200' :
          systemHealth.status === 'degraded' ? 'bg-yellow-50 border border-yellow-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${getHealthColor(systemHealth.status)} mr-3`}></div>
            <div>
              <h3 className="text-lg font-semibold">
                {getHealthLabel(systemHealth.status)}
              </h3>
              <p className="text-sm opacity-80">
                Last checked: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">API Response Time</p>
            <p className="text-2xl font-bold text-gray-900">
              {systemHealth.apiResponseTime || 'N/A'} ms
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Database Connections</p>
            <p className="text-2xl font-bold text-gray-900">
              {systemHealth.databaseConnections || 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-gray-900">
              {systemHealth.activeUsers || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Tenant Health Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Tenant Health Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map(tenant => (
            <div key={tenant.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  tenant.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {tenant.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold">{tenant.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Users:</span>
                  <span className="font-semibold">{tenant.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-semibold text-green-600">99.9%</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => navigate(`/admin/tenant/${tenant.code}`)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigate(`/admin/sian/analytics?tenant=${tenant.code}`)}
                  className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700"
                >
                  Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
            <div className="font-semibold">Run Backup</div>
            <div className="text-sm opacity-90 mt-1">Database backup</div>
          </button>
          <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
            <div className="font-semibold">Clear Cache</div>
            <div className="text-sm opacity-90 mt-1">System cache</div>
          </button>
          <button className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 transition-colors">
            <div className="font-semibold">Run Diagnostics</div>
            <div className="text-sm opacity-90 mt-1">System check</div>
          </button>
          <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors">
            <div className="font-semibold">Generate Report</div>
            <div className="text-sm opacity-90 mt-1">System report</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SianSystem;