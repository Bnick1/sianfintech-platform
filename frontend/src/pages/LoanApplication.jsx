import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoanApplication = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    loanAmount: '',
    loanPeriod: '12',
    loanPurpose: '',
    repaymentSource: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loanPurposes = [
    'Agricultural Inputs',
    'Business Expansion',
    'Equipment Purchase',
    'Working Capital',
    'Education Fees',
    'Medical Expenses',
    'Home Improvement',
    'Vehicle Purchase',
    'Other'
  ];

  const repaymentSources = [
    'Business Revenue',
    'Salary/Employment',
    'Farm Produce Sales',
    'Investment Returns',
    'Other Income'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call to submit loan application
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Loan application submitted:', {
        ...formData,
        memberId: user.memberNumber,
        applicantName: user.name,
        phoneNumber: user.phoneNumber,
        occupation: user.occupation,
        timestamp: new Date().toISOString()
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting loan application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your loan application has been received and is under review by our team.
            You will be notified via SMS once a decision is made.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Application received by GLDMF staff</li>
              <li>• AI credit assessment in progress</li>
              <li>• Manual review by loan officer</li>
              <li>• Decision within 2-3 business days</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.href = '/member/dashboard'}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Application</h1>
            <p className="text-gray-600">Apply for financing to grow your business or meet personal needs</p>
          </div>

          {/* Applicant Info (Read-only from system) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Applicant Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Name</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-blue-700">Member ID</p>
                <p className="font-semibold">{user.memberNumber}</p>
              </div>
              <div>
                <p className="text-blue-700">Phone</p>
                <p className="font-semibold">{user.phoneNumber}</p>
              </div>
              <div>
                <p className="text-blue-700">Occupation</p>
                <p className="font-semibold capitalize">{user.occupation}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (UGX) *
              </label>
              <input
                type="number"
                required
                value={formData.loanAmount}
                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter desired loan amount"
                min="100000"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum loan amount: UGX 100,000</p>
            </div>

            {/* Loan Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Period (Months) *
              </label>
              <select
                required
                value={formData.loanPeriod}
                onChange={(e) => handleInputChange('loanPeriod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
              </select>
            </div>

            {/* Loan Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Purpose *
              </label>
              <select
                required
                value={formData.loanPurpose}
                onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select purpose</option>
                {loanPurposes.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
            </div>

            {/* Repayment Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Repayment Source *
              </label>
              <select
                required
                value={formData.repaymentSource}
                onChange={(e) => handleInputChange('repaymentSource', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select source</option>
                {repaymentSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Provide any additional details about your loan request..."
              />
            </div>

            {/* Terms Agreement */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mt-1 mr-3"
                />
                <div>
                  <p className="text-sm text-yellow-800">
                    I agree to the terms and conditions. I understand that this application 
                    will be assessed by GLDMF staff and approval is subject to credit assessment. 
                    If approved, funds will be disbursed via mobile money.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Application...
                </>
              ) : (
                'Submit Loan Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;