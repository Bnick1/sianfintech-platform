// src/pages/AIportal.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AIportal = () => {
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [clientDetails, setClientDetails] = useState(null);
  const [assessmentType, setAssessmentType] = useState('comprehensive');

  // Enhanced mock client data matching the new registration structure
  const mockClients = [
    { 
      id: 'CL001', 
      name: 'Sarah Kamya', 
      customerType: 'market_vendor',
      occupationProfile: {
        primaryOccupation: 'Fresh Produce Vendor',
        yearsInOccupation: 3,
        sectorSpecific: {
          businessAge: 3,
          monthlyRevenue: 1200000,
          marketLocation: 'Kampala Market'
        }
      },
      financialProfile: {
        averageMonthlyIncome: 850000,
        mobileMoneyUsage: {
          primaryProvider: 'mtn',
          averageBalance: 250000,
          transactionFrequency: 'daily'
        }
      },
      locationContext: {
        region: 'Central',
        district: 'Kampala'
      }
    },
    { 
      id: 'CL002', 
      name: 'James Okello', 
      customerType: 'farmer',
      occupationProfile: {
        primaryOccupation: 'Crop Farmer',
        yearsInOccupation: 8,
        sectorSpecific: {
          cropType: 'Maize',
          farmSize: 5,
          farmingExperience: 8,
          landOwnership: 'owned'
        }
      },
      financialProfile: {
        averageMonthlyIncome: 750000,
        mobileMoneyUsage: {
          primaryProvider: 'airtel',
          averageBalance: 180000,
          transactionFrequency: 'weekly'
        }
      },
      locationContext: {
        region: 'Eastern',
        district: 'Jinja'
      }
    },
    { 
      id: 'CL003', 
      name: 'Grace Nakato', 
      customerType: 'artisan',
      occupationProfile: {
        primaryOccupation: 'Tailor',
        yearsInOccupation: 2,
        sectorSpecific: {
          businessAge: 2,
          monthlyRevenue: 650000
        }
      },
      financialProfile: {
        averageMonthlyIncome: 550000,
        mobileMoneyUsage: {
          primaryProvider: 'mtn',
          averageBalance: 120000,
          transactionFrequency: 'daily'
        }
      }
    },
    { 
      id: 'CL004', 
      name: 'David Ssemwanga', 
      customerType: 'taxi_driver',
      occupationProfile: {
        primaryOccupation: 'Boda Boda Rider',
        yearsInOccupation: 1,
        sectorSpecific: {
          gigPlatform: 'Bodaboda',
          monthlyRevenue: 550000
        }
      },
      financialProfile: {
        averageMonthlyIncome: 480000,
        mobileMoneyUsage: {
          primaryProvider: 'mtn',
          averageBalance: 80000,
          transactionFrequency: 'daily'
        }
      }
    }
  ];

  // Load clients and search history
  useEffect(() => {
    setClients(mockClients);
    
    const savedHistory = localStorage.getItem('aiAssessmentHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save to search history
  const saveToHistory = (client, result) => {
    const newEntry = {
      clientId: client.id,
      clientName: client.name,
      result,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    const updatedHistory = [newEntry, ...searchHistory.slice(0, 4)];
    setSearchHistory(updatedHistory);
    localStorage.setItem('aiAssessmentHistory', JSON.stringify(updatedHistory));
  };

  const handleClientSelect = (clientId) => {
    setSelectedClient(clientId);
    const client = clients.find(c => c.id === clientId);
    setClientDetails(client);
    setResult(null);
    setError(null);
  };

  const handleAIAssessment = async () => {
    if (!selectedClient) {
      setError('Please select a client from the system');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const client = clients.find(c => c.id === selectedClient);
      
      // Enhanced AI assessment using comprehensive client data
      const assessmentResult = generateEnhancedAssessment(client);

      setResult(assessmentResult);
      saveToHistory(client, assessmentResult);
      
    } catch (error) {
      console.error('Assessment error:', error);
      setError('Assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced assessment algorithm using new data structure
  const generateEnhancedAssessment = (client) => {
    const { customerType, occupationProfile, financialProfile, socialCapital, locationContext } = client;
    
    // Base scoring system
    let creditScore = 500; // Starting score
    
    // Customer Type scoring
    const customerTypeScore = calculateCustomerTypeScore(customerType);
    creditScore += customerTypeScore;
    
    // Occupation stability scoring
    const occupationScore = calculateOccupationScore(occupationProfile);
    creditScore += occupationScore;
    
    // Financial profile scoring
    const financialScore = calculateFinancialScore(financialProfile);
    creditScore += financialScore;
    
    // Location context scoring
    const locationScore = calculateLocationScore(locationContext);
    creditScore += locationScore;
    
    // Normalize score to 300-850 range
    creditScore = Math.max(300, Math.min(850, creditScore));
    
    // Determine risk level and recommendations
    const riskLevel = calculateRiskLevel(creditScore);
    const loanLimit = calculateLoanLimit(creditScore, financialProfile.averageMonthlyIncome);
    const interestRate = calculateInterestRate(creditScore);
    
    return {
      creditScore: Math.round(creditScore),
      riskLevel,
      loanLimit,
      interestRate,
      recommendation: getRecommendation(riskLevel),
      confidence: (85 + Math.random() * 10).toFixed(1),
      factors: generateEnhancedRiskFactors(client, creditScore),
      breakdown: {
        customerTypeScore,
        occupationScore: Math.round(occupationScore),
        financialScore: Math.round(financialScore),
        locationScore: Math.round(locationScore),
        baseScore: 500
      },
      client: {
        name: client.name,
        customerType: client.customerType,
        occupation: occupationProfile.primaryOccupation,
        location: locationContext?.district || 'Unknown'
      },
      behavioralInsights: generateBehavioralInsights(client)
    };
  };

  const calculateCustomerTypeScore = (customerType) => {
    const scores = {
      'farmer': 80,
      'market_vendor': 70,
      'taxi_driver': 60,
      'artisan': 65,
      'shop_owner': 85,
      'gig_worker': 55,
      'small_business': 90,
      'other': 50
    };
    
    return scores[customerType] || 50;
  };

  const calculateOccupationScore = (occupationProfile) => {
    let score = 0;
    
    // Years in occupation (max 100 points)
    score += Math.min(100, occupationProfile.yearsInOccupation * 15);
    
    // Sector-specific factors
    if (occupationProfile.sectorSpecific) {
      if (occupationProfile.sectorSpecific.businessAge) {
        score += Math.min(50, occupationProfile.sectorSpecific.businessAge * 8);
      }
      if (occupationProfile.sectorSpecific.farmingExperience) {
        score += Math.min(50, occupationProfile.sectorSpecific.farmingExperience * 8);
      }
    }
    
    return score;
  };

  const calculateFinancialScore = (financialProfile) => {
    let score = 0;
    
    // Income scoring (max 150 points)
    if (financialProfile.averageMonthlyIncome) {
      score += Math.min(150, (financialProfile.averageMonthlyIncome / 1000000) * 150);
    }
    
    // Mobile money usage scoring (max 100 points)
    if (financialProfile.mobileMoneyUsage) {
      const mm = financialProfile.mobileMoneyUsage;
      
      // Balance scoring
      if (mm.averageBalance) {
        score += Math.min(50, (mm.averageBalance / 500000) * 50);
      }
      
      // Transaction frequency
      const frequencyScores = {
        'daily': 30,
        'weekly': 25,
        'monthly': 15,
        'rarely': 5
      };
      score += frequencyScores[mm.transactionFrequency] || 10;
    }
    
    return score;
  };

  const calculateLocationScore = (locationContext) => {
    let score = 50; // Base location score
    
    if (locationContext) {
      // Urban areas score higher
      const urbanDistricts = ['Kampala', 'Entebbe', 'Jinja', 'Mbale'];
      if (urbanDistricts.includes(locationContext.district)) {
        score += 20;
      }
      
      // Central region advantage
      if (locationContext.region === 'Central') {
        score += 15;
      }
    }
    
    return score;
  };

  const calculateRiskLevel = (score) => {
    if (score >= 750) return 'Low Risk';
    if (score >= 650) return 'Moderate Risk';
    if (score >= 550) return 'Medium Risk';
    return 'High Risk';
  };

  const calculateLoanLimit = (score, monthlyIncome) => {
    const baseMultiplier = score / 850;
    const income = monthlyIncome || 500000;
    return Math.round(income * 12 * baseMultiplier * 2);
  };

  const calculateInterestRate = (score) => {
    if (score >= 750) return 12.5;
    if (score >= 650) return 16.8;
    if (score >= 550) return 22.3;
    return 28.9;
  };

  const getRecommendation = (riskLevel) => {
    const recommendations = {
      'Low Risk': 'APPROVE - Excellent candidate for lending',
      'Moderate Risk': 'APPROVE - Good candidate with standard terms',
      'Medium Risk': 'REVIEW - Requires additional verification',
      'High Risk': 'DECLINE - High default risk detected'
    };
    return recommendations[riskLevel];
  };

  const generateEnhancedRiskFactors = (client, score) => {
    const factors = [];
    const { customerType, occupationProfile, financialProfile } = client;
    
    // Customer type factors
    factors.push(`${customerType.replace('_', ' ').toUpperCase()} profile`);
    
    // Occupation factors
    if (occupationProfile.yearsInOccupation > 5) {
      factors.push('Established business history');
    } else if (occupationProfile.yearsInOccupation < 2) {
      factors.push('New business venture');
    }
    
    // Financial factors
    if (financialProfile.averageMonthlyIncome > 1000000) {
      factors.push('Strong income capacity');
    } else if (financialProfile.averageMonthlyIncome < 300000) {
      factors.push('Limited income buffer');
    }
    
    // Mobile money factors
    if (financialProfile.mobileMoneyUsage) {
      if (financialProfile.mobileMoneyUsage.transactionFrequency === 'daily') {
        factors.push('Active mobile money user');
      }
      if (financialProfile.mobileMoneyUsage.averageBalance > 200000) {
        factors.push('Good savings behavior');
      }
    }
    
    return factors.slice(0, 5);
  };

  const generateBehavioralInsights = (client) => {
    const insights = [];
    const { customerType, financialProfile } = client;
    
    if (customerType === 'farmer') {
      insights.push('Seasonal income pattern detected');
      insights.push('Agricultural risk factors considered');
    }
    
    if (customerType === 'market_vendor') {
      insights.push('Daily cash flow business');
      insights.push('Customer-dependent income model');
    }
    
    if (financialProfile.mobileMoneyUsage?.transactionFrequency === 'daily') {
      insights.push('High digital transaction frequency');
    }
    
    return insights;
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('aiAssessmentHistory');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCustomerTypeIcon = (customerType) => {
    const icons = {
      'farmer': '👨‍🌾',
      'market_vendor': '🏪',
      'taxi_driver': '🚗',
      'artisan': '🛠️',
      'shop_owner': '🏬',
      'gig_worker': '💼',
      'small_business': '📊',
      'other': '👤'
    };
    return icons[customerType] || '👤';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-2xl">
              <span className="text-2xl">🤖</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Enhanced AI Credit Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced risk analysis using comprehensive client data from enhanced registration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Assessment Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Enhanced Client Assessment</h2>
                    <p className="text-blue-100">Using comprehensive informal sector data</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">AI v2.0</span>
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">Enhanced</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Assessment Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Assessment Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setAssessmentType('comprehensive')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        assessmentType === 'comprehensive'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">📊</div>
                      <div className="font-medium">Comprehensive</div>
                      <div className="text-xs text-gray-600">Full data analysis</div>
                    </button>
                    <button
                      onClick={() => setAssessmentType('quick')}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        assessmentType === 'quick'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">⚡</div>
                      <div className="font-medium">Quick Assessment</div>
                      <div className="text-xs text-gray-600">Basic risk check</div>
                    </button>
                  </div>
                </div>

                {/* Client Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Enhanced Client *
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => handleClientSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Choose an enhanced client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} - {getCustomerTypeIcon(client.customerType)} {client.customerType.replace('_', ' ')} 
                        ({client.occupationProfile.primaryOccupation})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Clients registered with enhanced informal sector data
                  </p>
                </div>

                {/* Enhanced Client Details Preview */}
                {clientDetails && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">{getCustomerTypeIcon(clientDetails.customerType)}</span>
                      Enhanced Client Profile
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Customer Type:</span>
                        <p className="font-medium capitalize">{clientDetails.customerType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Primary Occupation:</span>
                        <p className="font-medium">{clientDetails.occupationProfile.primaryOccupation}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Experience:</span>
                        <p className="font-medium">{clientDetails.occupationProfile.yearsInOccupation} years</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Monthly Income:</span>
                        <p className="font-medium">{formatCurrency(clientDetails.financialProfile.averageMonthlyIncome)}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Mobile Money:</span>
                        <p className="font-medium capitalize">
                          {clientDetails.financialProfile.mobileMoneyUsage?.primaryProvider} • 
                          {clientDetails.financialProfile.mobileMoneyUsage?.transactionFrequency} transactions
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 flex items-center">
                      <span className="mr-2">⚠️</span>
                      {error}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handleAIAssessment}
                  disabled={loading || !selectedClient}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      🤖 AI Analyzing Enhanced Data...
                    </div>
                  ) : (
                    `Run ${assessmentType === 'comprehensive' ? 'Comprehensive' : 'Quick'} AI Assessment`
                  )}
                </button>

                {/* Enhanced Results */}
                {result && (
                  <div className={`mt-6 p-6 border-2 rounded-xl transition-all duration-300 ${
                    result.riskLevel === 'Low Risk' 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                      : result.riskLevel === 'Moderate Risk'
                      ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                      : result.riskLevel === 'Medium Risk'
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Enhanced Credit Assessment</h3>
                        <p className="text-sm text-gray-600">
                          For: {result.client.name} • {getCustomerTypeIcon(result.client.customerType)} 
                          {result.client.customerType.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                          AI v2.0
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          result.riskLevel === 'Low Risk' 
                            ? 'bg-green-100 text-green-800' 
                            : result.riskLevel === 'Moderate Risk'
                            ? 'bg-blue-100 text-blue-800'
                            : result.riskLevel === 'Medium Risk'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.riskLevel}
                        </span>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{result.creditScore}</div>
                        <div className="text-xs text-gray-500 font-medium">Credit Score</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              result.creditScore >= 750 ? 'bg-green-500' : 
                              result.creditScore >= 650 ? 'bg-blue-500' : 
                              result.creditScore >= 550 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${((result.creditScore - 300) / 550) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className={`text-2xl font-bold ${
                          result.riskLevel === 'Low Risk' ? 'text-green-600' : 
                          result.riskLevel === 'Moderate Risk' ? 'text-blue-600' : 
                          result.riskLevel === 'Medium Risk' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.recommendation.split(' - ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Decision</div>
                      </div>

                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(result.loanLimit)}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Suggested Limit</div>
                      </div>

                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-orange-600">{result.interestRate}%</div>
                        <div className="text-xs text-gray-500 font-medium">Interest Rate</div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="mb-4 p-3 bg-white rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Score Breakdown:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Customer Type: +{result.breakdown.customerTypeScore}</div>
                        <div>Occupation: +{result.breakdown.occupationScore}</div>
                        <div>Financial: +{result.breakdown.financialScore}</div>
                        <div>Location: +{result.breakdown.locationScore}</div>
                      </div>
                    </div>

                    {/* Behavioral Insights */}
                    {result.behavioralInsights && result.behavioralInsights.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">Behavioral Insights:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.behavioralInsights.map((insight, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {insight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {result.factors && result.factors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Key Risk Factors:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.factors.map((factor, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search History */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Assessments</h3>
                {searchHistory.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {searchHistory.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No assessment history yet
                </p>
              ) : (
                <div className="space-y-3">
                  {searchHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => {
                        handleClientSelect(item.clientId);
                        setResult(item.result);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span>{getCustomerTypeIcon(item.result.client.customerType)}</span>
                          <span className="font-medium text-gray-800 text-sm">
                            {item.clientName}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          item.result.riskLevel === 'Low Risk' 
                            ? 'bg-green-100 text-green-800' 
                            : item.result.riskLevel === 'Moderate Risk'
                            ? 'bg-blue-100 text-blue-800'
                            : item.result.riskLevel === 'Medium Risk'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.result.riskLevel.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(item.timestamp)}
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          Score: {item.result.creditScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced How It Works */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Enhanced AI Assessment</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Comprehensive Data</h4>
                    <p className="text-sm text-gray-600">Uses enhanced client profiles with sector-specific data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Advanced Analysis</h4>
                    <p className="text-sm text-gray-600">Analyzes occupation, financial behavior, and location data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Sector-Specific</h4>
                    <p className="text-sm text-gray-600">Tailored for farmers, vendors, gig workers, and artisans</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/register"
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors text-center block font-medium"
                >
                  Register New Client
                </Link>
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Export Assessment Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIportal;