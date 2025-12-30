import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { investmentsAPI } from '../../../services/apiService';
import InvestmentApproval from '../../../components/operational/InvestmentApproval';

const GLDMFInvestments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    fetchInvestments();
  }, [filter]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const investmentsData = await investmentsAPI.getInvestments(params);
      setInvestments(investmentsData);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Investment Management</h1>
          <p className="text-gray-600">GLDMF - Manage investment applications and portfolios</p>
        </div>
        <button
          onClick={() => navigate('/admin/gldmf')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600">Total Investments</p>
          <p className="text-2xl font-bold text-gray-900">{investments.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {investments.filter(i => i.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {investments.filter(i => i.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(investments.reduce((sum, inv) => sum + (inv.amount || 0), 0))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <h2 className="text-lg font-semibold text-gray-900">Filter Investments:</h2>
          {['all', 'pending', 'approved', 'rejected', 'active'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status} ({status === 'all' ? investments.length : investments.filter(i => i.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {filter === 'all' ? 'All' : filter} Investments ({investments.length})
          </h2>
          <button
            onClick={() => navigate('/investment-platform')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            New Investment
          </button>
        </div>

        <div className="space-y-6">
          {investments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No investments found for the selected filter.
            </div>
          ) : (
            investments.map(investment => (
              <div key={investment.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{investment.type} Investment</h3>
                    <p className="text-gray-600">Client: {investment.clientName}</p>
                    <p className="text-gray-600">Amount: {formatCurrency(investment.amount)}</p>
                    <p className="text-gray-600">Duration: {investment.duration} months</p>
                    {investment.expectedReturn && (
                      <p className="text-gray-600">
                        Expected Return: {formatCurrency(investment.expectedReturn)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      investment.status === 'approved' ? 'bg-green-100 text-green-800' :
                      investment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      investment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {investment.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Created: {new Date(investment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {investment.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Description:</strong> {investment.description}
                    </p>
                  </div>
                )}

                <InvestmentApproval investment={investment} onUpdate={fetchInvestments} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GLDMFInvestments;