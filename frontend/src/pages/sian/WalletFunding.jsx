// src/pages/sian/WalletFunding.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMobileMoney } from '../../hooks/useMobileMoney';
import { cryptoAPI, cryptoUtils } from '../../services/cryptoService';
import CryptoTransfer from '../../components/CryptoTransfer';

const WalletFunding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { initiatePayment, paymentStatus, loading: paymentLoading } = useMobileMoney();
  
  const [fundingData, setFundingData] = useState({
    amount: searchParams.get('minAmount') || '10000',
    paymentMethod: 'mobile_money', // mobile_money, crypto, bank_transfer
    provider: 'mtn',
    coin: 'BTC',
    cryptoAddress: '',
    phoneNumber: user?.phoneNumber || '',
    contributionType: 'one_time',
    autoDebit: false
  });

  const [step, setStep] = useState(1);
  const [cryptoWallets, setCryptoWallets] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loadingCrypto, setLoadingCrypto] = useState(false);

  // Load crypto data when component mounts
  useEffect(() => {
    if (user?.id) {
      loadCryptoData();
    }
  }, [user]);

  const loadCryptoData = async () => {
    try {
      setLoadingCrypto(true);
      const [walletsResponse, pricesResponse] = await Promise.all([
        cryptoAPI.getWallets(user.id),
        cryptoAPI.getPrices()
      ]);
      
      setCryptoWallets(walletsResponse.data || walletsResponse);
      setCryptoPrices(pricesResponse.data || pricesResponse);
    } catch (error) {
      console.error('Failed to load crypto data:', error);
    } finally {
      setLoadingCrypto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }

    // Handle mobile money payment
    if (step === 2 && fundingData.paymentMethod === 'mobile_money') {
      try {
        const paymentData = {
          provider: fundingData.provider,
          phoneNumber: fundingData.phoneNumber,
          amount: parseFloat(fundingData.amount),
          purpose: 'wallet_funding',
          reference: `WALLET${Date.now()}`,
          currency: 'UGX',
          metadata: {
            userId: user.id,
            contributionType: fundingData.contributionType,
            autoDebit: fundingData.autoDebit,
            walletAction: 'deposit'
          }
        };

        await initiatePayment(paymentData);
        
        if (paymentStatus?.status === 'completed') {
          setStep(3);
        }
      } catch (error) {
        alert('Payment failed: ' + error.message);
      }
    }

    if (step === 3) {
      navigate('/member/portfolio');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/member');
    }
  };

  const handleCryptoTransferSuccess = (transaction) => {
    console.log('Crypto deposit completed:', transaction);
    setStep(3); // Move to success step
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCryptoAmount = (amount, coin) => {
    return cryptoUtils.formatCryptoAmount(amount, coin);
  };

  const paymentMethods = [
    { 
      value: 'mobile_money', 
      label: 'Mobile Money', 
      icon: '📱',
      description: 'Instant deposit via MTN or Airtel Money',
      supportedCurrencies: ['UGX']
    },
    { 
      value: 'crypto', 
      label: 'Cryptocurrency', 
      icon: '₿',
      description: 'Deposit Bitcoin, Ethereum, or other cryptocurrencies',
      supportedCurrencies: ['BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'XRP']
    },
    { 
      value: 'bank_transfer', 
      label: 'Bank Transfer', 
      icon: '🏦',
      description: 'Transfer from your bank account',
      supportedCurrencies: ['UGX', 'USD']
    }
  ];

  const contributionOptions = [
    { value: 'one_time', label: 'One-time deposit', description: 'Single deposit to your wallet' },
    { value: 'daily', label: 'Daily contributions', description: 'Automatically deposit UGX 10,000 daily' },
    { value: 'weekly', label: 'Weekly contributions', description: 'Automatically deposit UGX 50,000 weekly' },
    { value: 'monthly', label: 'Monthly contributions', description: 'Automatically deposit UGX 200,000 monthly' }
  ];

  const getCurrentPaymentMethod = () => {
    return paymentMethods.find(method => method.value === fundingData.paymentMethod);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              Amount
            </div>
            <div className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              Payment
            </div>
            <div className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              Complete
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className={`p-3 rounded-lg mr-4 ${
              fundingData.paymentMethod === 'crypto' ? 'bg-orange-500' : 'bg-blue-600'
            } text-white`}>
              <span className="text-2xl">
                {getCurrentPaymentMethod()?.icon || '💳'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fund Your Sian Wallet</h1>
              <p className="text-gray-600">
                {getCurrentPaymentMethod()?.description || 'Add money to your digital wallet'}
              </p>
            </div>
          </div>

          {/* Crypto Transfer Component for Step 2 */}
          {step === 2 && fundingData.paymentMethod === 'crypto' ? (
            <CryptoTransfer 
              userId={user.id}
              onSuccess={handleCryptoTransferSuccess}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Amount & Payment Method Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {paymentMethods.map(method => (
                        <label 
                          key={method.value}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            fundingData.paymentMethod === method.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={fundingData.paymentMethod === method.value}
                            onChange={(e) => setFundingData({
                              ...fundingData, 
                              paymentMethod: e.target.value,
                              amount: method.value === 'crypto' ? '0.001' : '10000'
                            })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-2xl ml-3 mr-4">{method.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{method.label}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Contribution Type (Only for mobile money) */}
                  {fundingData.paymentMethod === 'mobile_money' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How do you want to fund your wallet?
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {contributionOptions.map(option => (
                          <label 
                            key={option.value}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              fundingData.contributionType === option.value 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="contributionType"
                              value={option.value}
                              checked={fundingData.contributionType === option.value}
                              onChange={(e) => setFundingData({...fundingData, contributionType: e.target.value})}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {fundingData.paymentMethod === 'crypto' ? 'Amount to Deposit' : 'Amount to Deposit (UGX)'}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step={fundingData.paymentMethod === 'crypto' ? '0.00000001' : '1000'}
                        min={fundingData.paymentMethod === 'crypto' ? '0.0001' : '10000'}
                        value={fundingData.amount}
                        onChange={(e) => setFundingData({...fundingData, amount: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                        required
                      />
                      {fundingData.paymentMethod === 'crypto' && (
                        <select
                          value={fundingData.coin}
                          onChange={(e) => setFundingData({...fundingData, coin: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="BTC">BTC</option>
                          <option value="ETH">ETH</option>
                          <option value="USDT">USDT</option>
                          <option value="BNB">BNB</option>
                          <option value="ADA">ADA</option>
                          <option value="XRP">XRP</option>
                        </select>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {fundingData.paymentMethod === 'crypto' 
                        ? `Minimum deposit: 0.0001 ${fundingData.coin}`
                        : 'Minimum deposit: UGX 10,000'
                      }
                      {fundingData.paymentMethod === 'crypto' && cryptoPrices[fundingData.coin] && (
                        <span className="ml-2">
                          ≈ {cryptoUtils.convertToFiat(fundingData.amount, cryptoPrices[fundingData.coin].usd)}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Auto-debit option (Only for mobile money recurring) */}
                  {fundingData.paymentMethod === 'mobile_money' && fundingData.contributionType !== 'one_time' && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoDebit"
                        checked={fundingData.autoDebit}
                        onChange={(e) => setFundingData({...fundingData, autoDebit: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="autoDebit" className="ml-2 text-sm text-gray-700">
                        Enable auto-debit from my mobile money
                      </label>
                    </div>
                  )}

                  {/* Wallet Benefits */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Sian Wallet Benefits</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Instant transfers to other Sian users</li>
                      <li>• Pay for services and products</li>
                      <li>• {fundingData.paymentMethod === 'crypto' ? 'Crypto & ' : ''}Mobile money integration</li>
                      <li>• Secure and fast transactions</li>
                      {fundingData.paymentMethod === 'crypto' && <li>• Blockchain security</li>}
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Details (Mobile Money Only) */}
              {step === 2 && fundingData.paymentMethod === 'mobile_money' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Deposit Amount:</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(parseFloat(fundingData.amount))}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {contributionOptions.find(opt => opt.value === fundingData.contributionType)?.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Money Provider
                    </label>
                    <select
                      value={fundingData.provider}
                      onChange={(e) => setFundingData({...fundingData, provider: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="airtel">Airtel Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Money Number
                    </label>
                    <input
                      type="tel"
                      value={fundingData.phoneNumber}
                      onChange={(e) => setFundingData({...fundingData, phoneNumber: e.target.value})}
                      placeholder="0771234567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      You will receive a mobile money prompt to complete the payment
                    </p>
                  </div>

                  {paymentStatus && (
                    <div className={`p-4 rounded-lg ${
                      paymentStatus.status === 'completed' ? 'bg-green-50 border border-green-200' :
                      paymentStatus.status === 'failed' ? 'bg-red-50 border border-red-200' :
                      'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center">
                        <span className="mr-2">
                          {paymentStatus.status === 'completed' ? '✅' :
                           paymentStatus.status === 'failed' ? '❌' : '⏳'}
                        </span>
                        <div>
                          <p className={`font-medium ${
                            paymentStatus.status === 'completed' ? 'text-green-800' :
                            paymentStatus.status === 'failed' ? 'text-red-800' : 'text-yellow-800'
                          }`}>
                            {paymentStatus.message}
                          </p>
                          {paymentStatus.status === 'pending' && (
                            <p className="text-sm text-yellow-700 mt-1">
                              Please check your phone to complete the payment
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl text-green-600">✅</span>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {fundingData.paymentMethod === 'crypto' ? 'Crypto Deposit Successful!' : 'Wallet Funding Successful!'}
                    </h2>
                    <p className="text-gray-600">
                      {fundingData.paymentMethod === 'crypto' 
                        ? `Your crypto deposit of ${formatCryptoAmount(fundingData.amount, fundingData.coin)} ${fundingData.coin} is being confirmed`
                        : `Your Sian Wallet has been funded with ${formatCurrency(parseFloat(fundingData.amount))}`
                      }
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-gray-900">
                          {fundingData.paymentMethod === 'crypto' ? 'CRYPTO' : 'WALLET'}{Date.now()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold text-green-600">
                          {fundingData.paymentMethod === 'crypto' 
                            ? `${formatCryptoAmount(fundingData.amount, fundingData.coin)} ${fundingData.coin}`
                            : formatCurrency(parseFloat(fundingData.amount))
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
                    <ul className="text-sm text-blue-700 space-y-1 text-left">
                      <li>• Use your wallet for instant payments</li>
                      <li>• Transfer money to other Sian users</li>
                      <li>• Pay for services and products</li>
                      <li>• Monitor your transactions in your portfolio</li>
                      {fundingData.paymentMethod === 'crypto' && (
                        <li>• Track your crypto investments</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons (Only show for non-crypto or step 1) */}
              {(step === 1 || (step === 2 && fundingData.paymentMethod !== 'crypto')) && (
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    {step === 1 ? 'Cancel' : 'Back'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {paymentLoading ? 'Processing...' : 
                     step === 1 ? 'Continue to Payment' :
                     step === 2 ? 'Complete Payment' : 'Go to Portfolio'}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">🔒</span>
              <div>
                <p className="text-yellow-800 font-medium">Secure Transaction</p>
                <p className="text-yellow-700 text-sm">
                  {fundingData.paymentMethod === 'crypto' 
                    ? 'Your crypto transactions are secured by blockchain technology and processed through certified exchanges.'
                    : 'Your payment is processed securely through certified mobile money providers. Funds are held in escrow with our banking partners.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletFunding;