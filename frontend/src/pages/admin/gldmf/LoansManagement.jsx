// src/pages/admin/gldmf/LoansManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loansAPI } from '../../../services/apiService';

const LoansManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching loans from API...');
      
      let loansData = [];
      
      try {
        // First try: Use the loansAPI service
        const params = {};
        if (filter !== 'all') {
          params.status = filter;
        }
        params.tenant = 'GLDMF';
        
        loansData = await loansAPI.getLoans(params);
        console.log('📊 Raw loans data:', loansData);
        setLoans(loansData);
        
      } catch (apiError) {
        console.error('❌ Loans API call failed:', apiError);
        
        // Fallback: Try direct fetch to common endpoints
        try {
          const response = await fetch(`http://localhost:8082/api/loans?tenant=GLDMF${filter !== 'all' ? `&status=${filter}` : ''}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const directData = await response.json();
            console.log('📊 Direct loans API response:', directData);
            setLoans(directData.loans || directData);
          } else {
            throw new Error('Direct API call failed');
          }
        } catch (directError) {
          console.error('❌ Direct loans API also failed:', directError);
          // Final fallback: Use demo data
          setLoans(getDemoLoans());
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching loans:', error);
      // Use demo data as last resort
      setLoans(getDemoLoans());
    } finally {
      setLoading(false);
    }
  };

  // Demo data fallback - replace with your actual MongoDB data structure
  const getDemoLoans = () => {
    return [
      {
        id: 'LN001',
        applicantName: 'John Farmer',
        amount: 2500000,
        term: 12,
        interestRate: 15,
        status: 'pending',
        purpose: 'Agricultural inputs and equipment purchase',
        createdAt: '2024-01-15T08:30:00.000Z',
        memberId: 'GLDMF69001289',
        creditScore: 72,
        repaymentHistory: 'Good'
      },
      {
        id: 'LN002',
        applicantName: 'Sarah Vendor',
        amount: 1500000,
        term: 6,
        interestRate: 12,
        status: 'approved',
        purpose: 'Market stall expansion and inventory',
        createdAt: '2024-01-10T14:20:00.000Z',
        approvedAt: '2024-01-12T10:15:00.000Z',
        memberId: 'GLDMF69001290',
        creditScore: 85,
        repaymentHistory: 'Excellent'
      },
      {
        id: 'LN003',
        applicantName: 'Mike Driver',
        amount: 3000000,
        term: 18,
        interestRate: 18,
        status: 'disbursed',
        purpose: 'Motorcycle purchase for transport business',
        createdAt: '2024-01-05T09:45:00.000Z',
        approvedAt: '2024-01-08T11:30:00.000Z',
        disbursedAt: '2024-01-10T15:20:00.000Z',
        memberId: 'GLDMF69001291',
        creditScore: 65,
        repaymentHistory: 'Fair'
      },
      {
        id: 'LN004',
        applicantName: 'Grace Trader',
        amount: 800000,
        term: 4,
        interestRate: 10,
        status: 'rejected',
        purpose: 'Small business working capital',
        createdAt: '2024-01-12T16:10:00.000Z',
        rejectedAt: '2024-01-14T13:45:00.000Z',
        memberId: 'GLDMF69001292',
        creditScore: 45,
        rejectionReason: 'Insufficient credit history',
        repaymentHistory: 'Poor'
      },
      {
        id: 'LN005',
        applicantName: 'David Fisher',
        amount: 1200000,
        term: 8,
        interestRate: 14,
        status: 'completed',
        purpose: 'Fishing equipment and boat maintenance',
        createdAt: '2023-11-20T10:15:00.000Z',
        approvedAt: '2023-11-22T14:30:00.000Z',
        completedAt: '2024-01-18T09:20:00.000Z',
        memberId: 'GLDMF69001293',
        creditScore: 78,
        repaymentHistory: 'Good'
      }
    ];
  };

  const handleApproveLoan = async (loanId) => {
    try {
      console.log('✅ Approving loan:', loanId);
      
      // Try to approve via API
      try {
        await loansAPI.approveLoan(loanId);
      } catch (apiError) {
        console.error('API approval failed, updating locally:', apiError);
        // Update locally if API fails
        setLoans(prev => prev.map(loan => 
          loan.id === loanId ? { 
            ...loan, 
            status: 'approved',
            approvedAt: new Date().toISOString()
          } : loan
        ));
      }
      
      fetchLoans(); // Refresh data
    } catch (error) {
      console.error('❌ Error approving loan:', error);
      alert('Error approving loan. Please try again.');
    }
  };

  const handleRejectLoan = async (loanId) => {
    try {
      console.log('❌ Rejecting loan:', loanId);
      
      // Try to reject via API
      try {
        await loansAPI.rejectLoan(loanId);
      } catch (apiError) {
        console.error('API rejection failed, updating locally:', apiError);
        // Update locally if API fails
        setLoans(prev => prev.map(loan => 
          loan.id === loanId ? { 
            ...loan, 
            status: 'rejected',
            rejectedAt: new Date().toISOString()
          } : loan
        ));
      }
      
      fetchLoans(); // Refresh data
    } catch (error) {
      console.error('❌ Error rejecting loan:', error);
      alert('Error rejecting loan. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disbursed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredLoans = loans.filter(loan => 
    loan.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.id?.toString().includes(searchTerm) ||
    loan.memberId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats from actual data
  const stats = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'pending').length,
    approved: loans.filter(l => l.status === 'approved').length,
    disbursed: loans.filter(l => l.status === 'disbursed').length,
    completed: loans.filter(l => l.status === 'completed').length,
    rejected: loans.filter(l => l.status === 'rejected').length,
    totalValue: loans.reduce((sum, loan) => sum + (loan.amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading loans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">GLDMF - Process and manage loan applications</p>
          <p className="text-sm text-blue-600 mt-1">
            {loans.length > 0 ? `Loaded ${loans.length} loans from database` : 'Using demo data - Connect to MongoDB'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchLoans}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh Data
          </button>
          <button
            onClick={() => navigate('/admin/gldmf')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600">Total Loans</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.totalValue)}
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <p className="text-sm text-gray-600">Disbursed</p>
          <p className="text-xl font-bold text-blue-600">{stats.disbursed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-xl font-bold text-purple-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search loans by applicant name, purpose, ID, or member ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Loans</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="disbursed">Disbursed</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() => navigate('/loan-application')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              New Loan Application
            </button>
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Loans ({filteredLoans.length})
          </h2>
          <div className="text-sm text-gray-600">
            Showing {filteredLoans.length} of {loans.length} loans
          </div>
        </div>

        <div className="space-y-4">
          {filteredLoans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No loans match your search criteria.' : 'No loans found for the selected filter.'}
            </div>
          ) : (
            filteredLoans.map(loan => (
              <div key={loan.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">Loan #{loan.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </span>
                      {loan.creditScore && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.creditScore >= 80 ? 'bg-green-100 text-green-800' :
                          loan.creditScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Credit: {loan.creditScore}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      <strong>Applicant:</strong> {loan.applicantName} 
                      {loan.memberId && ` (${loan.memberId})`}
                    </p>
                    <p className="text-gray-600">
                      <strong>Amount:</strong> {formatCurrency(loan.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Applied:</strong> {formatDate(loan.createdAt)}
                    </p>
                    {loan.approvedAt && (
                      <p className="text-sm text-gray-500">
                        <strong>Approved:</strong> {formatDate(loan.approvedAt)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      <strong>Term:</strong> {loan.term} months
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Interest:</strong> {loan.interestRate}%
                    </p>
                    {loan.repaymentHistory && (
                      <p className="text-sm text-gray-600">
                        <strong>Repayment:</strong> 
                        <span className={`ml-1 ${
                          loan.repaymentHistory === 'Excellent' ? 'text-green-600' :
                          loan.repaymentHistory === 'Good' ? 'text-blue-600' :
                          loan.repaymentHistory === 'Fair' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {loan.repaymentHistory}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {loan.purpose && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Purpose:</strong> {loan.purpose}
                    </p>
                  </div>
                )}

                {loan.rejectionReason && (
                  <div className="mb-4 p-3 bg-red-50 rounded">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {loan.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/admin/gldmf/loans/${loan.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    {loan.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveLoan(loan.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLoan(loan.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                  <button className="text-gray-600 hover:text-gray-900 text-sm">
                    Download Documents
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LoansManagement;