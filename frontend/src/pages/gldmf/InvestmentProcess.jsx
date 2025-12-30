// src/pages/gldmf/InvestmentProcess.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const InvestmentProcess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [investmentData, setInvestmentData] = useState({
    amount: searchParams.get('minAmount') || '10000',
    type: searchParams.get('type') || 'green-bond',
    duration: '12',
    paymentMethod: 'mobile_money',
    phoneNumber: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process investment - this would connect to GLDMF backend
    console.log('Processing investment:', investmentData);
    alert('Investment application submitted to GLDMF successfully!');
    navigate('/member/portfolio');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 text-white p-3 rounded-lg mr-4">
              <span className="text-2xl">🌱</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GLDMF Investment Application</h1>
              <p className="text-gray-600">Complete your investment process</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Type
              </label>
              <select
                value={investmentData.type}
                onChange={(e) => setInvestmentData({...investmentData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="green-bond">Green Bond</option>
                <option value="alternative">Alternative Investments</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount (UGX)
              </label>
              <input
                type="number"
                value={investmentData.amount}
                onChange={(e) => setInvestmentData({...investmentData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min="10000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Duration (Months)
              </label>
              <select
                value={investmentData.duration}
                onChange={(e) => setInvestmentData({...investmentData, duration: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={investmentData.paymentMethod}
                onChange={(e) => setInvestmentData({...investmentData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {investmentData.paymentMethod === 'mobile_money' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Money Number
                </label>
                <input
                  type="tel"
                  value={investmentData.phoneNumber}
                  onChange={(e) => setInvestmentData({...investmentData, phoneNumber: e.target.value})}
                  placeholder="0771234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Submit Investment Application to GLDMF
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvestmentProcess;