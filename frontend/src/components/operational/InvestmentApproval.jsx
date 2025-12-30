import React, { useState } from 'react';
import { investmentsAPI } from '../../services/apiService';

const InvestmentApproval = ({ investment, onUpdate }) => {
  const [status, setStatus] = useState(investment.status);
  const [processing, setProcessing] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setProcessing(true);
    try {
      await investmentsAPI.updateInvestment(investment.id, { status: newStatus });
      setStatus(newStatus);
      onUpdate(); // Refresh parent
    } catch (error) {
      console.error('Error updating investment:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-3">Manage Investment</h3>
      <div className="flex space-x-2">
        <button
          onClick={() => handleStatusUpdate('approved')}
          disabled={processing || status === 'approved'}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
        >
          {processing ? '...' : 'Approve'}
        </button>
        <button
          onClick={() => handleStatusUpdate('rejected')}
          disabled={processing || status === 'rejected'}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
        >
          {processing ? '...' : 'Reject'}
        </button>
        <button
          onClick={() => handleStatusUpdate('pending')}
          disabled={processing || status === 'pending'}
          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 disabled:bg-gray-400"
        >
          {processing ? '...' : 'Set Pending'}
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Current Status: <span className={`font-semibold ${
          status === 'approved' ? 'text-green-600' : 
          status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
        }`}>{status}</span>
      </div>
    </div>
  );
};

export default InvestmentApproval;