// src/pages/admin/gldmf/UserDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersAPI, loansAPI, investmentsAPI } from '../../../services/apiService';

const UserDetails = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [userLoans, setUserLoans] = useState([]);
  const [userInvestments, setUserInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const userData = await usersAPI.getUserById(userId);
      setUser(userData);

      // Fetch user's loans and investments
      const [loansData, investmentsData] = await Promise.all([
        loansAPI.getLoans({ userId }),
        investmentsAPI.getInvestments({ userId })
      ]);
      
      setUserLoans(loansData);
      setUserInvestments(investmentsData);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await usersAPI.updateUser(userId, { status: newStatus });
      fetchUserDetails(); // Refresh data
      alert(`User ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    try {
      // This would typically call an API endpoint to reset password
      alert('Password reset email sent to user!');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        status === 'active' ? 'bg-green-100 text-green-800' : 
        status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-red-100 text-red-800'
      }`}>
        {status}
      </span>
    );
  };

  const getLoanStatusBadge = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      disbursed: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/gldmf/members')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => navigate('/admin/gldmf/members')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Members
            </button>
            {getStatusBadge(user.status)}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          {user.status === 'active' ? (
            <button
              onClick={() => handleUpdateStatus('suspended')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              Suspend Account
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus('active')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Activate Account
            </button>
          )}
          <button
            onClick={handleResetPassword}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reset Password
          </button>
          <button
            onClick={() => navigate('/admin/gldmf/members')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {['profile', 'loans', 'investments', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-lg text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email Address</label>
                      <p className="text-lg text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone Number</label>
                      <p className="text-lg text-gray-900">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Member ID</label>
                      <p className="text-lg text-gray-900">{user.memberId || `GLDMF${user.id.toString().padStart(4, '0')}`}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Account Status</label>
                      <div className="mt-1">{getStatusBadge(user.status)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Login</label>
                      <p className="text-lg text-gray-900">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never logged in'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{userLoans.length}</div>
                  <p className="text-sm text-gray-600">Total Loans</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">{userInvestments.length}</div>
                  <p className="text-sm text-gray-600">Total Investments</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {formatCurrency(userLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0))}
                  </div>
                  <p className="text-sm text-gray-600">Total Loan Value</p>
                </div>
              </div>
            </div>
          )}

          {/* Loans Tab */}
          {activeTab === 'loans' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Loan History</h2>
              <div className="space-y-4">
                {userLoans.length > 0 ? (
                  userLoans.map(loan => (
                    <div key={loan.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">Loan #{loan.id}</h3>
                          <p className="text-gray-600">Amount: {formatCurrency(loan.amount)}</p>
                          <p className="text-sm text-gray-500">
                            Applied: {new Date(loan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {getLoanStatusBadge(loan.status)}
                          <p className="text-sm text-gray-600 mt-1">Term: {loan.term} months</p>
                        </div>
                      </div>
                      {loan.purpose && (
                        <div className="mt-2 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Purpose:</strong> {loan.purpose}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/admin/gldmf/loans/${loan.id}`)}
                        className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No loans found for this user.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Investments Tab */}
          {activeTab === 'investments' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Investment Portfolio</h2>
              <div className="space-y-4">
                {userInvestments.length > 0 ? (
                  userInvestments.map(investment => (
                    <div key={investment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{investment.type} Investment</h3>
                          <p className="text-gray-600">Amount: {formatCurrency(investment.amount)}</p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(investment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          investment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          investment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {investment.status}
                        </span>
                      </div>
                      {investment.description && (
                        <div className="mt-2 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">{investment.description}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No investments found for this user.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Send Message
              </button>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Create New Loan
              </button>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                View Transaction History
              </button>
              {user.status === 'active' ? (
                <button
                  onClick={() => handleUpdateStatus('suspended')}
                  className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
                >
                  Suspend Account
                </button>
              ) : (
                <button
                  onClick={() => handleUpdateStatus('active')}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Activate Account
                </button>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="font-medium text-gray-900">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Verified</p>
                <p className="font-medium text-gray-900">{user.emailVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;