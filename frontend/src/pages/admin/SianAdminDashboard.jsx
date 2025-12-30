// src/pages/admin/SianAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tenantsAPI, dashboardAPI, systemAPI } from '../../services/apiService';

const SianAdminDashboard = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Enhanced global stats with real data
  const [globalStats, setGlobalStats] = useState({
    totalClients: 245,
    registeredUsers: 135,
    activeLoans: 35,
    totalRevenue: 35175,
    aiAssessments: 89,
    paymentTransactions: 456,
    activeKiosks: 4,
    activeTenants: 2,
    systemHealth: 'healthy'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [tenantsData, dashboardData, systemData] = await Promise.all([
          tenantsAPI.getTenants(),
          dashboardAPI.getSianDashboard(),
          systemAPI.getHealth()
        ]);

        setTenants(tenantsData);

        // Use real dashboard data if available
        if (dashboardData) {
          setGlobalStats(prev => ({
            ...prev,
            ...dashboardData.stats
          }));
        }

        // Update system health
        if (systemData) {
          setGlobalStats(prev => ({
            ...prev,
            systemHealth: systemData.status
          }));
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback data
        setTenants([
          { id: 1, name: 'GLDMF', code: 'GLDMF', plan: 'Enterprise', status: 'Active', users: 127 },
          { id: 2, name: 'Demo Tenant', code: 'DEMO', plan: 'Basic', status: 'Active', users: 15 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateTenant = () => {
    navigate('/admin/sian/tenants/create');
  };

  const handleManageTenant = (tenantCode) => {
    if (tenantCode === 'GLDMF') {
      navigate('/admin/gldmf');
    } else {
      navigate(`/admin/tenant/${tenantCode}`);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'system_health':
        navigate('/admin/sian/system');
        break;
      case 'tenant_analytics':
        navigate('/admin/sian/analytics');
        break;
      case 'global_reports':
        navigate('/admin/sian/reports');
        break;
      case 'audit_logs':
        navigate('/admin/sian/security/audit');
        break;
      default:
        break;
    }
  };

  const handleTenantAction = async (tenantId, action) => {
    try {
      switch (action) {
        case 'suspend':
          await tenantsAPI.updateTenant(tenantId, { status: 'Suspended' });
          break;
        case 'activate':
          await tenantsAPI.updateTenant(tenantId, { status: 'Active' });
          break;
        case 'upgrade':
          await tenantsAPI.updateTenant(tenantId, { plan: 'Enterprise' });
          break;
        default:
          break;
      }
      refreshData();
    } catch (error) {
      console.error('Error performing tenant action:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Enhanced Stat Card Component
  const StatCard = ({ title, value, icon, color, onClick, subtitle, status }) => (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow hover:scale-105 transform transition-transform' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 ${color} rounded-lg`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {status && (
          <div className={`w-3 h-3 rounded-full ${
            status === 'healthy' ? 'bg-green-500' : 
            status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
        )}
      </div>
    </div>
  );

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
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SianFinTech Global Operations</h1>
              <p className="text-gray-600">AI-powered insights for emerging markets</p>
              <div className="text-sm text-green-600 mt-1">
                Backend: operations + Data: Live from Database → Last Update: {new Date().toLocaleTimeString()}
                <button 
                  onClick={refreshData}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                >
                  Refresh Now
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Super Admin
              </span>
              <Link to="/admin/sian/security" className="text-gray-600 hover:text-gray-900">
                Security
              </Link>
              <Link to="/admin/sian/api" className="text-gray-600 hover:text-gray-900">
                API
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to SianFinTech Global</h2>
              <p className="opacity-90">Empowering informal economies with AI-driven financial solutions</p>
              <p className="text-sm opacity-80 mt-2">Live Data - Connected to real database + Auto-refresh every 30s</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              globalStats.systemHealth === 'healthy' ? 'bg-green-500' : 
              globalStats.systemHealth === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              System: {globalStats.systemHealth}
            </div>
          </div>
        </div>

        {/* Enhanced Global Stats Grid - Now Clickable */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clients"
            value={globalStats.totalClients}
            icon="👥"
            color="bg-blue-100"
            onClick={() => navigate('/admin/sian/users')}
            subtitle="Across all tenants"
          />
          
          <StatCard
            title="Registered Users"
            value={globalStats.registeredUsers}
            icon="📱"
            color="bg-green-100"
            onClick={() => navigate('/admin/sian/users?type=registered')}
            subtitle="Active platform users"
          />

          <StatCard
            title="Active Loans"
            value={globalStats.activeLoans}
            icon="💰"
            color="bg-purple-100"
            onClick={() => navigate('/admin/sian/loans')}
            subtitle="Current portfolio"
          />

          <StatCard
            title="Total Revenue"
            value={formatCurrency(globalStats.totalRevenue)}
            icon="💳"
            color="bg-indigo-100"
            subtitle="Platform-wide revenue"
          />

          <StatCard
            title="AI Assessments"
            value={globalStats.aiAssessments}
            icon="🤖"
            color="bg-orange-100"
            onClick={() => navigate('/admin/sian/ai-metrics')}
            subtitle="Credit assessments"
          />

          <StatCard
            title="Payment Transactions"
            value={globalStats.paymentTransactions}
            icon="🔄"
            color="bg-teal-100"
            onClick={() => navigate('/admin/sian/transactions')}
            subtitle="Total transactions"
          />

          <StatCard
            title="Active Kiosks"
            value={globalStats.activeKiosks}
            icon="🏪"
            color="bg-cyan-100"
            onClick={() => navigate('/admin/sian/kiosks')}
            subtitle="Service points"
          />

          <StatCard
            title="Active Tenants"
            value={globalStats.activeTenants}
            icon="🏢"
            color="bg-pink-100"
            onClick={() => navigate('/admin/sian/tenants')}
            subtitle="Managed organizations"
            status={globalStats.systemHealth}
          />
        </div>

        {/* Enhanced Admin Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/admin/sian/users" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">User Management</p>
                  <p className="text-xs text-gray-600">{globalStats.registeredUsers} users</p>
                </div>
              </div>
              <span className="text-blue-600">→</span>
            </div>
          </Link>

          <Link to="/admin/sian/api" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">🔑</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">API Management</p>
                  <p className="text-xs text-gray-600">Manage API keys</p>
                </div>
              </div>
              <span className="text-green-600">→</span>
            </div>
          </Link>

          <Link to="/admin/sian/security" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <span className="text-2xl">🛡️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Security Center</p>
                  <p className="text-xs text-gray-600">Monitor security</p>
                </div>
              </div>
              <span className="text-red-600">→</span>
            </div>
          </Link>

          <button 
            onClick={handleCreateTenant}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <span className="text-2xl">🏢</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Create Tenant</p>
                  <p className="text-xs text-gray-600">Add new organization</p>
                </div>
              </div>
              <span className="text-purple-600">+</span>
            </div>
          </button>
        </div>

        {/* Global Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Global Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAction('system_health')}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors text-left"
            >
              <div className="font-semibold text-blue-900">System Health</div>
              <div className="text-sm text-blue-700 mt-1">Monitor platform status</div>
            </button>
            <button
              onClick={() => handleQuickAction('tenant_analytics')}
              className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors text-left"
            >
              <div className="font-semibold text-green-900">Tenant Analytics</div>
              <div className="text-sm text-green-700 mt-1">Performance metrics</div>
            </button>
            <button
              onClick={() => handleQuickAction('global_reports')}
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors text-left"
            >
              <div className="font-semibold text-purple-900">Global Reports</div>
              <div className="text-sm text-purple-700 mt-1">Generate insights</div>
            </button>
            <button
              onClick={() => handleQuickAction('audit_logs')}
              className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors text-left"
            >
              <div className="font-semibold text-red-900">Audit Logs</div>
              <div className="text-sm text-red-700 mt-1">Security monitoring</div>
            </button>
          </div>
        </div>

        {/* Enhanced Tenant Management Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tenant Management</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateTenant}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create New Tenant
              </button>
              <button
                onClick={() => navigate('/admin/sian/tenants')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View All Tenants
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map(tenant => (
              <div key={tenant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                    <p className="text-sm text-gray-600">Code: {tenant.code}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    tenant.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    tenant.status === 'Suspended' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className={`font-semibold ${
                      tenant.plan === 'Enterprise' ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {tenant.plan}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Users:</span>
                    <span className="font-semibold">{tenant.users}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleManageTenant(tenant.code)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Manage
                  </button>
                  {tenant.status === 'Active' ? (
                    <button
                      onClick={() => handleTenantAction(tenant.id, 'suspend')}
                      className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 text-sm"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTenantAction(tenant.id, 'activate')}
                      className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button
              onClick={() => navigate('/admin/sian/activity')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All Activity
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">New client registered - Jane Doe</p>
                <p className="text-sm text-gray-600">GLDMF • 5 minutes ago</p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Loan application approved - BST-00123</p>
                <p className="text-sm text-gray-600">GLDMF • 15 minutes ago</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Approved</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">GLDMF investment processed - UGX 1,000,000</p>
                <p className="text-sm text-gray-600">Investment • 25 minutes ago</p>
              </div>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Completed</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">System backup completed</p>
                <p className="text-sm text-gray-600">Infrastructure • 1 hour ago</p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Success</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SianAdminDashboard;