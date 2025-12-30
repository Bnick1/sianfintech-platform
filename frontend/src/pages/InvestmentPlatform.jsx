// src/components/InvestmentApplicationForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { investmentsAPI } from '../services/apiService';

const InvestmentApplicationForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Auto-populated from logged-in user
    investorId: user?.id || '',
    investorName: user?.name || '',
    investorPhone: user?.phone || '',
    investorEmail: user?.email || '',
    
    // Investment details (user fills these)
    investmentType: '',
    amount: '',
    duration: '',
    expectedReturns: '',
    riskAppetite: 'medium',
    paymentMethod: 'mobile_money',
    
    // Auto-generated fields
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-calculate expected returns based on type and amount
    if (formData.investmentType && formData.amount) {
      const returns = calculateExpectedReturns(formData.investmentType, formData.amount);
      setFormData(prev => ({ ...prev, expectedReturns: returns }));
    }
  }, [formData.investmentType, formData.amount]);

  const calculateExpectedReturns = (type, amount) => {
    const rates = {
      'green_bond': 0.18, // 18%
      'fixed_deposit': 0.12, // 12%
      'treasury_bills': 0.15, // 15%
      'corporate_bonds': 0.16, // 16%
      'unit_trusts': 0.14 // 14%
    };
    
    const rate = rates[type] || 0.12;
    return (parseFloat(amount) * rate).toFixed(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await investmentsAPI.create(formData);
      
      // Show success message and redirect
      alert('Investment application submitted successfully!');
      
      // Redirect to investment portfolio or show confirmation
      window.location.href = '/member/investments';
      
    } catch (error) {
      console.error('Investment application failed:', error);
      alert('Failed to submit investment application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply for Investment</h2>
      
      {/* User Information Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">Your Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <p className="font-medium">{user?.phone}</p>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <p className="font-medium">{user?.email || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-gray-600">Member ID:</span>
            <p className="font-medium">{user?.memberNumber || user?.digitalId}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Investment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Type *
          </label>
          <select
            name="investmentType"
            value={formData.investmentType}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Investment Type</option>
            <option value="green_bond">Green Bond (18% returns)</option>
            <option value="fixed_deposit">Fixed Deposit (12% returns)</option>
            <option value="treasury_bills">Treasury Bills (15% returns)</option>
            <option value="corporate_bonds">Corporate Bonds (16% returns)</option>
            <option value="unit_trusts">Unit Trusts (14% returns)</option>
          </select>
        </div>

        {/* Investment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Amount (UGX) *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="10000"
            step="1000"
            placeholder="Minimum: 10,000 UGX"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Investment Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Duration *
          </label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Duration</option>
            <option value="3_months">3 Months</option>
            <option value="6_months">6 Months</option>
            <option value="1_year">1 Year</option>
            <option value="2_years">2 Years</option>
            <option value="3_years">3 Years</option>
          </select>
        </div>

        {/* Expected Returns (Auto-calculated) */}
        {formData.expectedReturns && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-1">Expected Returns</h4>
            <p className="text-lg font-bold text-green-600">
              {parseInt(formData.expectedReturns).toLocaleString()} UGX
            </p>
            <p className="text-sm text-green-600">
              Based on your selected investment type and amount
            </p>
          </div>
        )}

        {/* Risk Appetite */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Appetite
          </label>
          <select
            name="riskAppetite"
            value={formData.riskAppetite}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method *
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="mobile_money">Mobile Money ({user?.phone})</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="wallet_balance">Sian Wallet Balance</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Submitting Application...' : 'Submit Investment Application'}
        </button>
      </form>
    </div>
  );
};

export default InvestmentApplicationForm;