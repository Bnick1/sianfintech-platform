import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loansAPI } from '../../../services/apiService';
import LoanProcessing from '../../../components/operational/LoanProcessing';

const GLDMFLoans = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const loansData = await loansAPI.getLoans(params);
      setLoans(loansData);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disbursed': return 'bg-blue-100 text-blue-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">GLDMF - Process and manage loan applications</p>
        </div>
        <button
          onClick={() => navigate('/admin/gldmf')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <h2 className="text-lg font-semibold text-gray-900">Filter Loans:</h2>
          {['all', 'pending', 'approved', 'rejected', 'disbursed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status} ({status === 'all' ? loans.length : loans.filter(l => l.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Loans List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {filter === 'all' ? 'All' : filter} Loans ({loans.length})
          </h2>
          <button
            onClick={() => navigate('/loan-application')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            New Loan Application
          </button>
        </div>

        <div className="space-y-4">
          {loans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No loans found for the selected filter.
            </div>
          ) : (
            loans.map(loan => (
              <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Loan #{loan.id}</h3>
                    <p className="text-gray-600">Applicant: {loan.applicantName}</p>
                    <p className="text-gray-600">Amount: {formatCurrency(loan.amount)}</p>
                    <p className="text-sm text-gray-500">
                      Applied: {new Date(loan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">Term: {loan.term} months</p>
                  </div>
                </div>

                {loan.status === 'pending' && (
                  <LoanProcessing loan={loan} onUpdate={fetchLoans} />
                )}

                {loan.purpose && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Purpose:</strong> {loan.purpose}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GLDMFLoans;