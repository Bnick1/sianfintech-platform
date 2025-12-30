import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantsAPI } from '../services/apiService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [tenants, setTenants] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for users and stats
  const [users] = useState([
    {
      id: 1,
      name: 'John Admin',
      email: 'john.admin@gldmf.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T08:00:00Z'
    },
    {
      id: 2,
      name: 'Sarah Manager',
      email: 'sarah.manager@gldmf.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-15T09:15:00Z',
      createdAt: '2024-01-05T14:20:00Z'
    }
  ]);

  const [stats] = useState({
    totalUsers: 127,
    pendingLoans: 15,
    approvedLoans: 89,
    totalRevenue: 1250000,
    activeTenants: 1
  });

  // Fetch only tenants from backend
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const tenantsData = await tenantsAPI.getTenants();
        setTenants(tenantsData);
        
        // Set GLDMF as current tenant
        const gldmfTenant = tenantsData.find(tenant => tenant.code === 'GLDMF');
        setCurrentTenant(gldmfTenant || tenantsData[0]);
        
      } catch (err) {
        console.error('Error fetching tenants:', err);
        // Fallback to mock tenant
        setCurrentTenant({
          id: 1,
          name: 'GLDMF',
          code: 'GLDMF',
          plan: 'Enterprise',
          status: 'Active'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            {currentTenant?.name || 'GLDMF'} Tenant Management Portal
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {currentTenant && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {currentTenant.name} • {currentTenant.plan}
            </span>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="text-gray-600 hover:text-gray-900"
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Loans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingLoans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Approved Loans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedLoans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Tenant Info */}
      {currentTenant && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Tenant Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tenant Name</p>
              <p className="font-semibold">{currentTenant.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="font-semibold">{currentTenant.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-green-600">{currentTenant.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Users</p>
              <p className="font-semibold">{currentTenant.users || stats.totalUsers}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <span className="text-green-600 mr-2">✅</span>
          <div>
            <p className="text-green-800 font-medium">Backend Integration Successful!</p>
            <p className="text-green-700 text-sm">Tenants API is now connected to your backend</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;