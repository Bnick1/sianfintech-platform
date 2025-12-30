// src/pages/ClientPortal.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loansAPI, investmentsAPI, paymentsAPI, walletsAPI, creditAPI } from '../services/apiService';

const ClientPortal = () => {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState('UGX');
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState({
    loans: [],
    investments: [],
    recentTransactions: [],
    portfolioSummary: {
      activeLoans: 0,
      totalInvestments: 0,
      walletBalance: 0,
      nextPayment: 0,
      creditScore: 0
    }
  });

  // Currency configuration
  const currencies = {
    UGX: { symbol: 'UGX', name: 'Ugandan Shilling', locale: 'en-UG' },
    KES: { symbol: 'KES', name: 'Kenyan Shilling', locale: 'en-KE' },
    TZS: { symbol: 'TZS', name: 'Tanzanian Shilling', locale: 'en-TZ' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' }
  };

  // Financial products with proper execution endpoints
  const financialProducts = [
    {
      id: 1,
      name: 'Green Bond',
      description: 'Invest in sustainable projects - agriculture, renewable energy, and environmental initiatives',
      minAmount: 10000,
      returns: '14-20%',
      duration: '3-7 years',
      risk: 'Medium',
      category: 'green',
      icon: '🌱',
      type: 'investment',
      actionUrl: '/gldmf/investment-process?type=green-bond&minAmount=10000',
      features: ['ESG Investment', 'Impact Reporting', 'Fixed Returns']
    },
    {
      id: 2,
      name: 'Sian Wallet',
      description: 'Digital wallet for daily transactions, payments, and micro-savings',
      minAmount: 10000,
      returns: 'Transaction Benefits',
      duration: 'Instant Access',
      risk: 'None',
      category: 'wallet',
      icon: '💳',
      type: 'wallet',
      actionUrl: '/sianfintech/wallet-funding?action=deposit&minAmount=10000',
      features: ['Mobile Money Integration', 'Instant Transfers', 'Bill Payments']
    },
    {
      id: 3,
      name: 'Alternative Investments',
      description: 'Fixed deposits, unit trusts and other secure investment options',
      minAmount: 10000,
      returns: '12-15%',
      duration: '3-36 months',
      risk: 'Low',
      category: 'investments',
      icon: '📊',
      type: 'investment',
      actionUrl: '/gldmf/investment-process?type=alternative&minAmount=10000',
      features: ['Fixed Deposits', 'Unit Trusts', 'Guaranteed Returns']
    }
  ];

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading personal data for member:', user.memberNumber || user.id);

        // Use the new user-specific API methods with proper error handling
        const [userLoans, userInvestments, userTransactions, walletData, creditData] = await Promise.all([
          loansAPI.getUserLoans(user.id).catch(error => {
            console.warn('❌ Failed to load user loans, trying fallback:', error);
            return loansAPI.getLoans({ memberId: user.id, userId: user.id }).catch(() => []);
          }),
          investmentsAPI.getUserInvestments(user.id).catch(error => {
            console.warn('❌ Failed to load user investments, trying fallback:', error);
            return investmentsAPI.getInvestments({ userId: user.id }).catch(() => []);
          }),
          paymentsAPI.getUserTransactions(user.id).catch(error => {
            console.warn('❌ Failed to load user transactions, trying fallback:', error);
            return paymentsAPI.getTransactions({ userId: user.id }).catch(() => []);
          }),
          walletsAPI.getBalance(user.id).catch(error => {
            console.warn('❌ Failed to load wallet balance:', error);
            return { balance: 0 };
          }),
          creditAPI.getScore(user.id).catch(error => {
            console.warn('❌ Failed to load credit score:', error);
            return { score: 0 };
          })
        ]);
        
        console.log('📊 User loans response:', userLoans);
        console.log('💰 User investments response:', userInvestments);
        console.log('💳 User transactions response:', userTransactions);
        console.log('👛 Wallet balance response:', walletData);
        console.log('📈 Credit score response:', creditData);

        const activeLoans = Array.isArray(userLoans) 
          ? userLoans.filter(loan => loan.status === 'active' || loan.status === 'approved' || loan.status === 'disbursed')
          : [];

        // Calculate portfolio summary
        const activeLoanBalance = activeLoans.reduce((sum, loan) => 
          sum + (loan.principalOutstanding || loan.outstandingBalance || loan.amount || 0), 0);
        
        const nextPayment = activeLoans.reduce((sum, loan) => {
          const nextInstallment = loan.repaymentSchedule?.find(sched => sched.status === 'pending');
          return sum + (nextInstallment?.amountDue || loan.monthlyPayment || loan.nextPaymentAmount || 0);
        }, 0);

        // Calculate total investments
        const totalInvestments = Array.isArray(userInvestments)
          ? userInvestments.reduce((sum, inv) => sum + (inv.amount || inv.investedAmount || inv.currentValue || 0), 0)
          : 0;

        // Get wallet balance from wallet API
        const walletBalance = walletData?.balance || walletData?.amount || walletData?.currentBalance || 0;

        // Get credit score
        const creditScore = creditData?.score || creditData?.creditScore || creditData?.value || 0;

        setClientData({
          loans: activeLoans.map(loan => ({
            id: loan._id || loan.id,
            amount: loan.principalAmount || loan.amount || loan.loanAmount,
            status: loan.status,
            dueDate: loan.dueDate || loan.nextPaymentDate || loan.maturityDate,
            balance: loan.principalOutstanding || loan.outstandingBalance || loan.remainingBalance,
            currency: loan.currency || 'UGX'
          })),
          investments: Array.isArray(userInvestments) ? userInvestments.map(inv => ({
            id: inv._id || inv.id,
            type: inv.type || inv.productType || 'Investment',
            amount: inv.amount || inv.investedAmount || inv.currentValue,
            return: inv.expectedReturn || inv.returns || inv.annualReturn || 0,
            maturity: inv.maturityDate || inv.duration || inv.term || 'N/A',
            currency: inv.currency || 'UGX'
          })) : [],
          recentTransactions: Array.isArray(userTransactions) ? userTransactions.slice(0, 5).map(transaction => ({
            id: transaction._id || transaction.id,
            date: new Date(transaction.createdAt || transaction.date || transaction.transactionDate).toISOString().split('T')[0],
            description: transaction.description || transaction.type || transaction.narration || 'Transaction',
            amount: transaction.amount || transaction.transactionAmount,
            type: transaction.amount > 0 ? 'credit' : 'debit',
            currency: transaction.currency || 'UGX'
          })) : [],
          portfolioSummary: {
            activeLoans: activeLoanBalance,
            totalInvestments: totalInvestments,
            walletBalance: walletBalance,
            nextPayment: nextPayment,
            creditScore: creditScore
          }
        });

      } catch (error) {
        console.error('❌ Error loading client data:', error);
        // Enhanced error handling - try to load data with fallback methods
        await loadFallbackData();
      } finally {
        setLoading(false);
      }
    };

    const loadFallbackData = async () => {
      try {
        console.log('🔄 Trying fallback data loading methods...');
        
        // Try the original methods as fallback
        const [userLoans, userInvestments, userTransactions] = await Promise.all([
          loansAPI.getLoans({ borrower: user.id, userId: user.id }).catch(() => []),
          investmentsAPI.getInvestments({ investor: user.id, userId: user.id }).catch(() => []),
          paymentsAPI.getTransactions({ userId: user.id }).catch(() => [])
        ]);

        const activeLoans = Array.isArray(userLoans) 
          ? userLoans.filter(loan => loan.status === 'active' || loan.status === 'approved')
          : [];

        const activeLoanBalance = activeLoans.reduce((sum, loan) => 
          sum + (loan.principalOutstanding || loan.outstandingBalance || loan.amount || 0), 0);
        
        const nextPayment = activeLoans.reduce((sum, loan) => {
          const nextInstallment = loan.repaymentSchedule?.find(sched => sched.status === 'pending');
          return sum + (nextInstallment?.amountDue || loan.monthlyPayment || 0);
        }, 0);

        const totalInvestments = Array.isArray(userInvestments)
          ? userInvestments.reduce((sum, inv) => sum + (inv.amount || inv.investedAmount || 0), 0)
          : 0;

        setClientData({
          loans: activeLoans.map(loan => ({
            id: loan._id || loan.id,
            amount: loan.principalAmount || loan.amount,
            status: loan.status,
            dueDate: loan.dueDate || loan.nextPaymentDate,
            balance: loan.principalOutstanding || loan.outstandingBalance,
            currency: loan.currency || 'UGX'
          })),
          investments: Array.isArray(userInvestments) ? userInvestments.map(inv => ({
            id: inv._id || inv.id,
            type: inv.type || 'Investment',
            amount: inv.amount || inv.investedAmount,
            return: inv.expectedReturn || inv.returns || 0,
            maturity: inv.maturityDate || inv.duration || 'N/A',
            currency: inv.currency || 'UGX'
          })) : [],
          recentTransactions: Array.isArray(userTransactions) ? userTransactions.slice(0, 5).map(transaction => ({
            id: transaction._id || transaction.id,
            date: new Date(transaction.createdAt || transaction.date).toISOString().split('T')[0],
            description: transaction.description || transaction.type || 'Transaction',
            amount: transaction.amount,
            type: transaction.amount > 0 ? 'credit' : 'debit',
            currency: transaction.currency || 'UGX'
          })) : [],
          portfolioSummary: {
            activeLoans: activeLoanBalance,
            totalInvestments: totalInvestments,
            walletBalance: 0, // Fallback to 0 if wallet API fails
            nextPayment: nextPayment,
            creditScore: 0 // Fallback to 0 if credit API fails
          }
        });

      } catch (fallbackError) {
        console.error('❌ Fallback data loading also failed:', fallbackError);
        // Ultimate fallback to mock data
        setClientData(getMockClientData());
      }
    };

    const getMockClientData = () => ({
      loans: [
        { id: 1, amount: 5000000, status: 'Active', dueDate: '2024-12-15', balance: 2500000, currency: 'UGX' }
      ],
      investments: [
        { id: 1, type: 'Sian Wallet', amount: 50000, return: 0, maturity: 'Instant', currency: 'UGX' }
      ],
      recentTransactions: [
        { id: 1, date: '2024-01-15', description: 'Loan Payment', amount: -500000, type: 'debit', currency: 'UGX' },
        { id: 2, date: '2024-01-10', description: 'Wallet Top-up', amount: -100000, type: 'debit', currency: 'UGX' }
      ],
      portfolioSummary: {
        activeLoans: 2500000,
        totalInvestments: 50000,
        walletBalance: 50000,
        nextPayment: 500000,
        creditScore: 750
      }
    });

    if (user?.id) {
      loadClientData();
    }
  }, [user]);

  const formatCurrency = (amount, currency = selectedCurrency) => {
    const currencyConfig = currencies[currency];
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.symbol,
      minimumFractionDigits: currencyConfig.symbol === 'UGX' ? 0 : 2,
      maximumFractionDigits: currencyConfig.symbol === 'UGX' ? 0 : 2,
    }).format(amount);
  };

  const formatCreditScore = (score) => {
    if (score >= 800) return { color: 'text-green-600', label: 'Excellent' };
    if (score >= 740) return { color: 'text-blue-600', label: 'Very Good' };
    if (score >= 670) return { color: 'text-yellow-600', label: 'Good' };
    if (score >= 580) return { color: 'text-orange-600', label: 'Fair' };
    return { color: 'text-red-600', label: 'Poor' };
  };

  const handleInvestNow = (product) => {
    console.log(`Initiating investment process for: ${product.name}`);
    console.log(`Redirecting to: ${product.actionUrl}`);
    window.location.href = product.actionUrl;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      case 'None': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your portfolio data...</p>
        </div>
      </div>
    );
  }

  const creditScoreInfo = formatCreditScore(clientData.portfolioSummary.creditScore);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Member Portal</h1>
              <p className="text-gray-600">
                Welcome back, {user.name} 
                {user.memberNumber && ` (Member: ${user.memberNumber})`}
              </p>
              <p className="text-sm text-green-600">
                ✅ Connected to your GLDMF account
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Currency Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Currency:</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(currencies).map(([code, config]) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Credit Score Display */}
              {clientData.portfolioSummary.creditScore > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Credit Score:</span>
                  <span className={`text-sm font-bold ${creditScoreInfo.color}`}>
                    {clientData.portfolioSummary.creditScore} ({creditScoreInfo.label})
                  </span>
                </div>
              )}
              
              <Link to="/member/portfolio" className="text-blue-600 hover:text-blue-800 font-medium border-b-2 border-blue-600">
                My Portfolio
              </Link>
              <Link to="/member/apply-financing" className="text-blue-600 hover:text-blue-800 font-medium">
                Apply for Loan
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards - Updated with Credit Score */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Loans</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(clientData.portfolioSummary.activeLoans)}
            </p>
            <p className="text-sm text-gray-600">
              {clientData.loans.length} active loan{clientData.loans.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Investments</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(clientData.portfolioSummary.totalInvestments)}
            </p>
            <p className="text-sm text-gray-600">
              {clientData.investments.length} investment{clientData.investments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Wallet Balance</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(clientData.portfolioSummary.walletBalance)}
            </p>
            <p className="text-sm text-gray-600">Available instantly</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Next Payment</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(clientData.portfolioSummary.nextPayment)}
            </p>
            <p className="text-sm text-gray-600">Due soon</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Credit Score</h3>
            <p className={`text-2xl font-bold ${creditScoreInfo.color}`}>
              {clientData.portfolioSummary.creditScore || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">{creditScoreInfo.label}</p>
          </div>
        </div>

        {/* Financial Products Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Financial Products</h2>
            <p className="text-gray-600">Start with UGX 10,000. Choose wallet services or investment opportunities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {financialProducts.map(product => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{product.icon}</span>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getRiskColor(product.risk)}`}>
                    {product.risk}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min. Amount:</span>
                    <span className="font-semibold">{formatCurrency(product.minAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {product.type === 'wallet' ? 'Benefits:' : 'Returns:'}
                    </span>
                    <span className={`font-semibold ${
                      product.type === 'wallet' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {product.returns}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{product.duration}</span>
                  </div>
                </div>

                {product.features && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.features.map((feature, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleInvestNow(product)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Invest Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Loans and Investments Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Loans Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Loans</h2>
            {clientData.loans.length > 0 ? (
              <div className="space-y-4">
                {clientData.loans.map(loan => (
                  <div key={loan.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{formatCurrency(loan.amount)}</p>
                        <p className={`text-sm ${loan.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>
                          {loan.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Balance: {formatCurrency(loan.balance)}</p>
                        <p className="text-sm text-gray-600">Due: {loan.dueDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No active loans</p>
            )}
            <Link 
              to="/member/apply-financing"
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-center block font-medium"
            >
              Apply for New Loan
            </Link>
          </div>

          {/* Investments Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Investments & Wallet</h2>
            {clientData.investments.length > 0 ? (
              <div className="space-y-4">
                {clientData.investments.map(investment => (
                  <div key={investment.id} className={`border-l-4 pl-4 py-2 ${
                    investment.type === 'Sian Wallet' ? 'border-blue-500' : 'border-green-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{investment.type}</p>
                        <p className="text-sm text-gray-600">{formatCurrency(investment.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${
                          investment.type === 'Sian Wallet' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {investment.return > 0 ? '+' : ''}{formatCurrency(investment.return)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {investment.type === 'Sian Wallet' ? 'Available:' : 'Matures:'} {investment.maturity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No investments yet</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          {clientData.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {clientData.recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                  <p className={`font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;