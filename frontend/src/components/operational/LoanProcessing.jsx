import React, { useState } from 'react';
import { loansAPI } from '../../services/apiService';

const LoanProcessing = ({ loan, onUpdate }) => {
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleProcessLoan = async () => {
    setProcessing(true);
    try {
      if (action === 'approve') {
        await loansAPI.approveLoan(loan.id);
      } else if (action === 'reject') {
        await loansAPI.rejectLoan(loan.id);
      }
      onUpdate(); // Refresh parent component
    } catch (error) {
      console.error('Error processing loan:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-semibold mb-3">Process Loan Application</h3>
      <div className="space-y-3">
        <select 
          value={action} 
          onChange={(e) => setAction(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Action</option>
          <option value="approve">Approve Loan</option>
          <option value="reject">Reject Loan</option>
          <option value="request-info">Request More Information</option>
        </select>
        
        <textarea
          placeholder="Add notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border rounded"
          rows="3"
        />
        
        <button
          onClick={handleProcessLoan}
          disabled={!action || processing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {processing ? 'Processing...' : 'Process Loan'}
        </button>
      </div>
    </div>
  );
};

export default LoanProcessing;