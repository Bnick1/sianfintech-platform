// src/pages/MobileMoneyPayment.jsx
import React, { useState } from 'react';
import { mobileMoneyService } from '../services/mobileMoneyService'; // Use your new service

const MobileMoneyPayment = () => {
  const [paymentData, setPaymentData] = useState({
    provider: 'mtn',
    phoneNumber: '',
    amount: '',
    purpose: 'loan_repayment',
    reference: '',
    userId: '',
    sector: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [userRole, setUserRole] = useState('user'); // Would come from auth context

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhoneNumber = (phone) => {
    // Ensure phone number starts with +256 for Uganda
    let formatted = phone.trim();
    if (formatted.startsWith('0')) {
      formatted = '+256' + formatted.substring(1);
    } else if (!formatted.startsWith('+')) {
      formatted = '+256' + formatted;
    }
    return formatted.replace(/\s/g, '');
  };

  const initiatePayment = async () => {
    if (!paymentData.phoneNumber || !paymentData.amount || paymentData.amount <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    setLoading(true);
    setPaymentStatus(null);

    try {
      const formattedData = {
        ...paymentData,
        phoneNumber: formatPhoneNumber(paymentData.phoneNumber),
        amount: parseFloat(paymentData.amount),
        currency: 'UGX',
        timestamp: new Date().toISOString(),
        metadata: {
          sector: paymentData.sector,
          userAgent: navigator.userAgent,
          location: 'UG'
        }
      };

      // Use mobileMoneyService instead of paymentsAPI
      const response = await mobileMoneyService.initiatePayment(formattedData);

      setPaymentStatus({
        status: 'pending',
        transactionId: response.transactionId || response.id,
        message: 'Payment initiated. Please check your phone to complete the transaction.',
        providerReference: response.providerReference || response.reference,
        sector: paymentData.sector,
        purpose: paymentData.purpose,
        amount: parseFloat(paymentData.amount)
      });

      // Start polling for status using mobileMoneyService
      pollPaymentStatus(response.transactionId || response.id);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus({
        status: 'failed',
        message: `Payment failed: ${error.message}`,
        error: error.response?.data || error.message,
        sector: paymentData.sector
      });
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (transactionId) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setPaymentStatus(prev => ({
          ...prev,
          status: 'timeout',
          message: 'Payment status check timeout. Please verify manually.'
        }));
        return;
      }

      try {
        // Use mobileMoneyService to check status
        const status = await mobileMoneyService.checkPaymentStatus(transactionId);
        
        if (status.status === 'completed' || status.status === 'success') {
          setPaymentStatus({
            status: 'completed',
            transactionId,
            message: 'Payment completed successfully!',
            providerReference: status.providerReference || status.reference,
            amount: status.amount || parseFloat(paymentData.amount),
            timestamp: status.timestamp || new Date().toISOString(),
            sector: paymentData.sector,
            purpose: paymentData.purpose
          });
        } else if (status.status === 'failed' || status.status === 'error') {
          setPaymentStatus({
            status: 'failed',
            transactionId,
            message: `Payment failed: ${status.reason || status.error || 'Unknown error'}`,
            error: status.reason || status.error,
            sector: paymentData.sector
          });
        } else {
          // Still pending, check again in 10 seconds
          attempts++;
          setTimeout(checkStatus, 10000);
        }
      } catch (error) {
        console.error('Status check failed:', error);
        attempts++;
        setTimeout(checkStatus, 10000);
      }
    };

    checkStatus();
  };

  const handleVerifyPayment = async () => {
    if (!paymentStatus?.transactionId) return;

    setVerificationLoading(true);
    try {
      // Use mobileMoneyService for verification
      const verification = await mobileMoneyService.checkPaymentStatus(paymentStatus.transactionId);
      
      if (verification.status === 'completed' || verification.verified) {
        setPaymentStatus(prev => ({
          ...prev,
          status: 'completed',
          message: 'Payment verified and completed successfully!',
          verified: true
        }));
      } else {
        setPaymentStatus(prev => ({
          ...prev,
          message: `Payment status: ${verification.status}`
        }));
      }
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Verification failed: ' + error.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  // Configuration arrays (keep your existing ones)
  const providers = [
    { id: 'mtn', name: 'MTN Mobile Money', color: 'bg-yellow-500' },
    { id: 'airtel', name: 'Airtel Money', color: 'bg-red-500' }
  ];

  const purposes = [
    { id: 'loan_repayment', name: 'Loan Repayment' },
    { id: 'investment', name: 'Investment' },
    { id: 'savings', name: 'Savings' },
    { id: 'service_fee', name: 'Service Fee' },
    { id: 'other', name: 'Other' }
  ];

  const sectors = [
    { id: 'agriculture', name: 'Agriculture', icon: '🌱' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'trade', name: 'Trade', icon: '🏪' },
    { id: 'services', name: 'Services', icon: '💼' },
    { id: 'general', name: 'General', icon: '💰' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mobile Money Payments
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure and instant mobile money transactions for all your financial needs
          </p>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Initiate Payment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Money Provider
              </label>
              <div className="grid grid-cols-2 gap-3">
                {providers.map(provider => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleInputChange('provider', provider.id)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      paymentData.provider === provider.id
                        ? `border-blue-500 bg-blue-50 ${provider.color} text-white`
                        : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {provider.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Sector
              </label>
              <select
                value={paymentData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>
                    {sector.icon} {sector.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={paymentData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="e.g., 0700123456 or +256700123456"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (UGX) *
              </label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="Enter amount"
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Purpose
              </label>
              <select
                value={paymentData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {purposes.map(purpose => (
                  <option key={purpose.id} value={purpose.id}>
                    {purpose.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference (Optional)
              </label>
              <input
                type="text"
                value={paymentData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                placeholder="Payment reference"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={initiatePayment}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay UGX ${paymentData.amount || '0'} with ${paymentData.provider.toUpperCase()}`
            )}
          </button>
        </div>

        {/* Payment Status */}
        {paymentStatus && (
          <div className={`rounded-2xl shadow-xl p-6 mb-6 ${
            paymentStatus.status === 'completed' ? 'bg-green-50 border border-green-200' :
            paymentStatus.status === 'failed' ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Payment Status: {paymentStatus.status.toUpperCase()}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                paymentStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                paymentStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {paymentStatus.status}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-gray-700">{paymentStatus.message}</p>
              
              {paymentStatus.transactionId && (
                <p className="text-sm text-gray-600">
                  <strong>Transaction ID:</strong> {paymentStatus.transactionId}
                </p>
              )}
              
              {paymentStatus.providerReference && (
                <p className="text-sm text-gray-600">
                  <strong>Provider Reference:</strong> {paymentStatus.providerReference}
                </p>
              )}
              
              {paymentStatus.amount && (
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> UGX {paymentStatus.amount.toLocaleString()}
                </p>
              )}
              
              {paymentStatus.sector && (
                <p className="text-sm text-gray-600">
                  <strong>Sector:</strong> {sectors.find(s => s.id === paymentStatus.sector)?.name}
                </p>
              )}
              
              {paymentStatus.purpose && (
                <p className="text-sm text-gray-600">
                  <strong>Purpose:</strong> {purposes.find(p => p.id === paymentStatus.purpose)?.name}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              {paymentStatus.status === 'pending' && (
                <button
                  onClick={handleVerifyPayment}
                  disabled={verificationLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {verificationLoading ? 'Checking...' : 'Verify Payment'}
                </button>
              )}
              
              <button
                onClick={() => setPaymentStatus(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                New Payment
              </button>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Secure Mobile Money Payments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-center">
              <span className="text-lg mr-2">🔒</span>
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg mr-2">⚡</span>
              <span>Instant processing</span>
            </div>
            <div className="flex items-center">
              <span className="text-lg mr-2">📱</span>
              <span>Mobile optimized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMoneyPayment;