// src/pages/admin/gldmf/LoanDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loansAPI, usersAPI } from '../../../services/apiService';

const LoanDetails = () => {
  const navigate = useNavigate();
  const { loanId } = useParams();
  const [loan, setLoan] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchLoanDetails();
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const loanData = await loansAPI.getLoan(loanId);
      setLoan(loanData);

      // Fetch applicant details if available
      if (loanData.applicantId) {
        const applicantData = await usersAPI.getUserById(loanData.applicantId);
        setApplicant(applicantData);
      }
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async () => {
    try {
      await loansAPI.approveLoan(loanId);
      fetchLoanDetails(); // Refresh data
      alert('Loan approved successfully!');
    } catch (error) {
      console.error('Error approving loan:', error);
      alert('Error approving loan. Please try again.');
    }
  };

  const handleRejectLoan = async () => {
    try {
      await loansAPI.rejectLoan(loanId);
      fetchLoanDetails(); // Refresh data
      alert('Loan rejected successfully!');
    } catch (error) {
      console.error('Error rejecting loan:', error);
      alert('Error rejecting loan. Please try again.');
    }
  };

  const handleDisburseLoan = async () => {
    try {
      await loansAPI.updateLoan(loanId, { status: 'disbursed' });
      fetchLoanDetails(); // Refresh data
      alert('Loan disbursed successfully!');
    } catch (error) {
      console.error('Error disbursing loan:', error);
      alert('Error disbursing loan. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const calculateMonthlyPayment = () => {
    if (!loan?.amount || !loan?.interestRate || !loan?.term) return 0;
    const principal = loan.amount;
    const monthlyRate = (loan.interestRate / 100) / 12;
    const numberOfPayments = loan.term;
    
    return principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loan Not Found</h2>
          <p className="text-gray-600 mb-4">The loan you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/gldmf/loans')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Loans
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
              onClick={() => navigate('/admin/gldmf/loans')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Loans
            </button>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
              {loan.status.toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Loan #{loan.id}</h1>
          <p className="text-gray-600">Detailed view and management</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          {loan.status === 'pending' && (
            <>
              <button
                onClick={handleApproveLoan}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Approve Loan
              </button>
              <button
                onClick={handleRejectLoan}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reject Loan
              </button>
            </>
          )}
          {loan.status === 'approved' && (
            <button
              onClick={handleDisburseLoan}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Disburse Funds
            </button>
          )}
          <button
            onClick={() => navigate('/admin/gldmf/loans')}
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
            {['overview', 'applicant', 'documents', 'payments', 'history'].map((tab) => (
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

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Loan Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Loan Amount</label>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(loan.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Interest Rate</label>
                    <p className="text-lg font-semibold text-gray-900">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Term</label>
                    <p className="text-lg font-semibold text-gray-900">{loan.term} months</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Monthly Payment</label>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(calculateMonthlyPayment())}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Purpose</label>
                    <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{loan.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Total Loan Amount</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(loan.amount)}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Total Interest</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(loan.amount * (loan.interestRate / 100))}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600">Total Repayment</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {formatCurrency(loan.amount * (1 + loan.interestRate / 100))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applicant Tab */}
          {activeTab === 'applicant' && applicant && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Applicant Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900">{applicant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{applicant.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{applicant.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Member Since</label>
                      <p className="text-gray-900">{new Date(applicant.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        applicant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {applicant.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Last Login</label>
                      <p className="text-gray-900">
                        {applicant.lastLogin ? new Date(applicant.lastLogin).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/gldmf/users/${applicant.id}`)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Loan Documents</h2>
              <div className="space-y-4">
                {loan.documents && loan.documents.length > 0 ? (
                  loan.documents.map((doc, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-600">Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Download
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No documents uploaded for this loan.
                  </div>
                )}
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Upload New Document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Loan Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Actions</h3>
            <div className="space-y-3">
              {loan.status === 'pending' && (
                <>
                  <button
                    onClick={handleApproveLoan}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve Loan
                  </button>
                  <button
                    onClick={handleRejectLoan}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject Loan
                  </button>
                </>
              )}
              {loan.status === 'approved' && (
                <button
                  onClick={handleDisburseLoan}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Disburse Funds
                </button>
              )}
              <button className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700">
                Generate Contract
              </button>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                Send Notification
              </button>
            </div>
          </div>

          {/* Loan Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Loan Applied</p>
                  <p className="text-sm text-gray-600">{new Date(loan.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {loan.status !== 'pending' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Loan {loan.status}</p>
                    <p className="text-sm text-gray-600">{new Date(loan.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;