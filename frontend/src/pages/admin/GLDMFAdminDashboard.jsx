// src/pages/admin/GLDMFAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantsAPI, investmentsAPI, loansAPI, usersAPI, dashboardAPI } from '../../services/apiService';

const GLDMFAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [investments, setInvestments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Enhanced stats with real data
  const [stats, setStats] = useState({
    totalUsers: 127,
    pendingLoans: 15,
    approvedLoans: 89,
    totalRevenue: 1250000,
    activeInvestments: 45,
    pendingInvestments: 8
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [tenantsData, investmentsData, loansData, usersData, dashboardData] = await Promise.all([
          tenantsAPI.getTenants(),
          investmentsAPI.getInvestments({ tenant: 'GLDMF' }),
          loansAPI.getLoans({ tenant: 'GLDMF' }),
          usersAPI.getUsers({ tenant: 'GLDMF' }),
          dashboardAPI.getGLDMFDashboard('GLDMF')
        ]);

        const gldmfTenant = tenantsData.find(tenant => tenant.code === 'GLDMF');
        setCurrentTenant(gldmfTenant);
        setInvestments(investmentsData);
        setLoans(loansData);
        setUsers(usersData);

        // Use real dashboard data if available, otherwise calculate from fetched data
        if (dashboardData) {
          setStats(dashboardData.stats);
        } else {
          setStats({
            totalUsers: usersData.length,
            pendingLoans: loansData.filter(loan => loan.status === 'pending').length,
            approvedLoans: loansData.filter(loan => loan.status === 'approved').length,
            totalRevenue: loansData.reduce((sum, loan) => sum + (loan.amount || 0), 0),
            activeInvestments: investmentsData.filter(inv => inv.status === 'active').length,
            pendingInvestments: investmentsData.filter(inv => inv.status === 'pending').length
          });
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback data
        setCurrentTenant({
          id: 1,
          name: 'GLDMF',
          code: 'GLDMF',
          plan: 'Enterprise',
          status: 'Active',
          users: 127
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // ENHANCED: Better navigation handlers
  const handleManageInvestment = (investmentId) => {
    navigate(`/admin/gldmf/investments/${investmentId}`);
  };

  const handleProcessLoan = (loanId) => {
    navigate(`/admin/gldmf/loans/${loanId}`);
  };

  const handleManageUser = (userId) => {
    if (userId === 'all') {
      navigate('/admin/gldmf/members'); // NEW: Navigate to members list
    } else {
      navigate(`/admin/gldmf/users/${userId}`);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'process_loans':
        navigate('/admin/gldmf/loans?status=pending');
        break;
      case 'manage_investments':
        navigate('/admin/gldmf/investments');
        break;
      case 'add_staff':
        navigate('/admin/gldmf/users/new');
        break;
      case 'ai_scoring':
        navigate('/ai-portal');
        break;
      case 'view_reports':
        navigate('/admin/gldmf/reports');
        break;
      case 'manage_members': // NEW: Added members management
        navigate('/admin/gldmf/members');
        break;
      default:
        break;
    }
  };

  const handleApproveInvestment = async (investmentId) => {
    try {
      await investmentsAPI.updateInvestment(investmentId, { status: 'approved' });
      refreshData();
    } catch (error) {
      console.error('Error approving investment:', error);
    }
  };

  const handleRejectInvestment = async (investmentId) => {
    try {
      await investmentsAPI.updateInvestment(investmentId, { status: 'rejected' });
      refreshData();
    } catch (error) {
      console.error('Error rejecting investment:', error);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await loansAPI.approveLoan(loanId);
      refreshData();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Enhanced Stat Card Component
  const StatCard = ({ title, value, icon, color, onClick, subtitle, actionLabel }) => (
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
        {actionLabel && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {actionLabel}
          </span>
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GLDMF Portal - Great Lakes Development Microfinance</h1>
          <p className="text-gray-600">Admin Dashboard - GLDMF Tenant Management Portal</p>
        </div>
        <div className="flex items-center space-x-4">
          {currentTenant && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {currentTenant.name} • {currentTenant.plan}
            </span>
          )}
          <button
            onClick={() => navigate('/admin/sian')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Global Operations
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="text-gray-600 hover:text-gray-900"
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ENHANCED: Navigation Tabs for Better Management */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex space-x-8 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 font-medium ${
              activeTab === 'overview' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => handleQuickAction('manage_members')}
            className="pb-4 px-2 font-medium text-gray-500 hover:text-gray-700"
          >
            👥 Members ({stats.totalUsers})
          </button>
          <button
            onClick={() => handleQuickAction('process_loans')}
            className="pb-4 px-2 font-medium text-gray-500 hover:text-gray-700"
          >
            💰 Loans ({stats.pendingLoans + stats.approvedLoans})
          </button>
          <button
            onClick={() => handleQuickAction('manage_investments')}
            className="pb-4 px-2 font-medium text-gray-500 hover:text-gray-700"
          >
            📈 Investments ({stats.activeInvestments + stats.pendingInvestments})
          </button>
        </div>
      </div>

      {/* Enhanced Stats Grid - Now Clickable and Actionable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="bg-blue-100"
          onClick={() => handleManageUser('all')}
          subtitle="Click to manage users"
          actionLabel="Manage"
        />
        <StatCard
          title="Pending Loans"
          value={stats.pendingLoans}
          icon="⏳"
          color="bg-yellow-100"
          onClick={() => handleQuickAction('process_loans')}
          subtitle="Click to process loans"
          actionLabel="Process"
        />
        <StatCard
          title="Approved Loans"
          value={stats.approvedLoans}
          icon="✅"
          color="bg-green-100"
          onClick={() => navigate('/admin/gldmf/loans?status=approved')}
          subtitle="Click to view approved"
          actionLabel="View"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          color="bg-purple-100"
          subtitle="Current portfolio value"
        />
      </div>

      {/* Quick Actions Section - ENHANCED */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleQuickAction('process_loans')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-left"
          >
            <div className="font-semibold">Process Loans</div>
            <div className="text-sm opacity-90 mt-1">{stats.pendingLoans} pending applications</div>
          </button>
          <button
            onClick={() => handleQuickAction('manage_investments')}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-left"
          >
            <div className="font-semibold">Manage Investments</div>
            <div className="text-sm opacity-90 mt-1">{stats.pendingInvestments} awaiting approval</div>
          </button>
          <button
            onClick={() => handleQuickAction('manage_members')}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-left"
          >
            <div className="font-semibold">Member Management</div>
            <div className="text-sm opacity-90 mt-1">{stats.totalUsers} total members</div>
          </button>
          <button
            onClick={() => handleQuickAction('ai_scoring')}
            className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-left"
          >
            <div className="font-semibold">AI Credit Scoring</div>
            <div className="text-sm opacity-90 mt-1">Assess client applications</div>
          </button>
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

      {/* ENHANCED: Recent Members Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Members</h2>
          <button
            onClick={() => handleQuickAction('manage_members')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View All Members
          </button>
        </div>
        
        <div className="space-y-4">
          {users.slice(0, 5).map(user => (
            <div key={user.id} className="flex justify-between items-center py-3 border-b">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-medium">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleManageUser(user.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  View
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No members found
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Investment Management Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Investment Management</h2>
          <button
            onClick={() => handleQuickAction('manage_investments')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View All Investments
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Active Investments</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeInvestments}</p>
            <p className="text-sm text-green-700">Currently managed investments</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Pending Investments</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingInvestments}</p>
            <p className="text-sm text-yellow-700">Awaiting approval</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Investment Applications</h3>
          <div className="space-y-4">
            {investments.slice(0, 5).map(investment => (
              <div key={investment.id} className="flex justify-between items-center py-3 border-b">
                <div className="flex-1">
                  <p className="font-medium">{investment.type} - {formatCurrency(investment.amount)}</p>
                  <p className="text-sm text-gray-600">Client: {investment.clientName}</p>
                  <p className="text-xs text-gray-500">
                    Status: 
                    <span className={`ml-1 font-semibold ${
                      investment.status === 'approved' ? 'text-green-600' :
                      investment.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {investment.status}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  {investment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveInvestment(investment.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectInvestment(investment.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleManageInvestment(investment.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Loan Processing Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Loan Processing</h2>
          <button
            onClick={() => handleQuickAction('process_loans')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View All Loans
          </button>
        </div>

        <div className="space-y-4">
          {loans.filter(loan => loan.status === 'pending').slice(0, 3).map(loan => (
            <div key={loan.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">Loan #{loan.id} - {formatCurrency(loan.amount)}</p>
                  <p className="text-sm text-gray-600">Applicant: {loan.applicantName}</p>
                  <p className="text-xs text-gray-500">Applied: {new Date(loan.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending Review</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApproveLoan(loan.id)}
                  className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex-1"
                >
                  Approve Loan
                </button>
                <button
                  onClick={() => handleProcessLoan(loan.id)}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex-1"
                >
                  Review Details
                </button>
              </div>
            </div>
          ))}
          {loans.filter(loan => loan.status === 'pending').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No pending loans to process
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GLDMFAdminDashboard;