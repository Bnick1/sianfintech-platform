import React, { useState, useEffect } from 'react';

const AIportal = () => {
  const [occupation, setOccupation] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Common occupations for suggestions
  const commonOccupations = [
    'market_vendor', 'farmer', 'tailor', 'teacher', 'driver', 
    'nurse', 'shop_keeper', 'mechanic', 'carpenter', 'electrician',
    'fisherman', 'business_owner', 'accountant', 'software_developer',
    'construction_worker', 'restaurant_owner', 'hotel_staff', 'security_guard'
  ];

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('aiAssessmentHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save to search history
  const saveToHistory = (occupation, result) => {
    const newEntry = {
      occupation,
      result,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    const updatedHistory = [newEntry, ...searchHistory.slice(0, 4)]; // Keep last 5
    setSearchHistory(updatedHistory);
    localStorage.setItem('aiAssessmentHistory', JSON.stringify(updatedHistory));
  };

  const handleAIAssessment = async () => {
    if (!occupation.trim()) {
      setError('Please enter an occupation');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Try real API first, fallback to mock data
      const response = await fetch('http://localhost:8082/api/ai/credit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ occupation: occupation.trim().toLowerCase() }),
      });

      let assessmentResult;
      
      if (response.ok) {
        assessmentResult = await response.json();
        assessmentResult.isMock = false;
      } else {
        // Fallback to mock data if API not available
        throw new Error('API not available, using demo data');
      }

      setResult(assessmentResult);
      saveToHistory(occupation, assessmentResult);
      
    } catch (error) {
      console.log('Using mock data:', error.message);
      
      // Enhanced mock data with occupation-based logic
      const mockResults = generateMockAssessment(occupation);
      mockResults.isMock = true;
      
      setResult(mockResults);
      saveToHistory(occupation, mockResults);
      setError('Demo data shown - API integration in progress');
    } finally {
      setLoading(false);
    }
  };

  // Smart mock data generation based on occupation
  const generateMockAssessment = (occupation) => {
    const occupationLower = occupation.toLowerCase();
    
    // Base scores based on occupation type
    let baseRisk = 50;
    let baseLimit = 1000000;
    
    if (occupationLower.includes('vendor') || occupationLower.includes('market')) {
      baseRisk = 35;
      baseLimit = 2500000;
    } else if (occupationLower.includes('farmer') || occupationLower.includes('fisher')) {
      baseRisk = 45;
      baseLimit = 1500000;
    } else if (occupationLower.includes('teacher') || occupationLower.includes('nurse')) {
      baseRisk = 25;
      baseLimit = 3500000;
    } else if (occupationLower.includes('developer') || occupationLower.includes('accountant')) {
      baseRisk = 20;
      baseLimit = 5000000;
    } else if (occupationLower.includes('driver') || occupationLower.includes('security')) {
      baseRisk = 55;
      baseLimit = 800000;
    }

    // Add some randomness but keep it realistic
    const riskScore = Math.max(5, Math.min(95, baseRisk + (Math.random() * 30 - 15)));
    const confidence = 85 + (Math.random() * 10);
    const suggestedLimit = baseLimit + Math.floor(Math.random() * 2000000);

    // Determine recommendation based on risk
    let recommendation;
    if (riskScore < 30) {
      recommendation = 'APPROVE';
    } else if (riskScore < 60) {
      recommendation = 'REVIEW';
    } else {
      recommendation = 'DECLINE';
    }

    return {
      riskScore: Math.round(riskScore),
      recommendation,
      confidence: confidence.toFixed(1),
      suggestedLimit,
      factors: generateFactors(occupationLower, riskScore)
    };
  };

  const generateFactors = (occupation, riskScore) => {
    const factors = [];
    
    if (occupation.includes('vendor') || occupation.includes('market')) {
      factors.push('Stable daily income');
      factors.push('Regular customer base');
      factors.push('Low operational costs');
    } else if (occupation.includes('farmer')) {
      factors.push('Seasonal income pattern');
      factors.push('Asset-backed potential');
      factors.push('Market price dependent');
    } else if (occupation.includes('teacher')) {
      factors.push('Stable employment');
      factors.push('Regular salary');
      factors.push('Government employment');
    }
    
    if (riskScore < 40) {
      factors.push('High repayment capacity');
      factors.push('Low default history');
    } else if (riskScore > 70) {
      factors.push('Income variability concern');
      factors.push('Higher risk profile');
    }
    
    return factors.slice(0, 3); // Return top 3 factors
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleAIAssessment();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('aiAssessmentHistory');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI Credit Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced machine learning analysis for accurate credit risk evaluation and loan recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Assessment Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                <h2 className="text-2xl font-bold text-white">Credit Assessment</h2>
                <p className="text-blue-100">Get instant AI-powered credit evaluation</p>
              </div>

              <div className="p-6">
                {/* Occupation Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Occupation
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => {
                        setOccupation(e.target.value);
                        setError(null);
                      }}
                      onKeyPress={handleKeyPress}
                      list="occupations"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter occupation (e.g., market_vendor, farmer, teacher)"
                    />
                    <datalist id="occupations">
                      {commonOccupations.map(occupation => (
                        <option key={occupation} value={occupation} />
                      ))}
                    </datalist>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Common: market_vendor, farmer, teacher, shop_keeper, driver
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 flex items-center">
                      <span className="mr-2">⚠️</span>
                      {error}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handleAIAssessment}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      🤖 AI Analyzing...
                    </div>
                  ) : (
                    'Start AI Assessment'
                  )}
                </button>

                {/* Results */}
                {result && (
                  <div className={`mt-6 p-6 border-2 rounded-xl transition-all duration-300 ${
                    result.recommendation === 'APPROVE' 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                      : result.recommendation === 'REVIEW' 
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Assessment Result</h3>
                      <div className="flex items-center space-x-2">
                        {result.isMock && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            Demo Data
                          </span>
                        )}
                        {!result.isMock && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            Real Data
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          result.recommendation === 'APPROVE' 
                            ? 'bg-green-100 text-green-800' 
                            : result.recommendation === 'REVIEW' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.recommendation}
                        </span>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{result.riskScore}%</div>
                        <div className="text-xs text-gray-500 font-medium">Risk Score</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              result.riskScore < 30 ? 'bg-green-500' : 
                              result.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${result.riskScore}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className={`text-2xl font-bold ${
                          result.recommendation === 'APPROVE' ? 'text-green-600' : 
                          result.recommendation === 'REVIEW' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {result.recommendation}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Decision</div>
                      </div>

                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{result.confidence}%</div>
                        <div className="text-xs text-gray-500 font-medium">Confidence</div>
                      </div>

                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600">
                          UGX {result.suggestedLimit.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Limit</div>
                      </div>
                    </div>

                    {/* Key Factors */}
                    {result.factors && result.factors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Key Factors:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.factors.map((factor, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Breakdown (from real API) */}
                    {result.breakdown && !result.isMock && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-2">Score Breakdown:</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">Occupation</div>
                            <div className="text-blue-600 font-bold">{result.breakdown.occupationRisk}%</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">History</div>
                            <div className="text-green-600 font-bold">{result.breakdown.historicalPerformance}%</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-medium">Economic</div>
                            <div className="text-purple-600 font-bold">{result.breakdown.economicFactor}%</div>
                          </div>
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
                        setOccupation(item.occupation);
                        setResult(item.result);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-800 text-sm">
                          {item.occupation}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          item.result.recommendation === 'APPROVE' 
                            ? 'bg-green-100 text-green-800' 
                            : item.result.recommendation === 'REVIEW' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.result.recommendation}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(item.timestamp)}
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          {item.result.riskScore}% risk
                        </span>
                      </div>
                      {item.result.isMock && (
                        <span className="text-xs text-yellow-600 mt-1">Demo</span>
                      )}
                      {!item.result.isMock && (
                        <span className="text-xs text-green-600 mt-1">Real</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Data Analysis</h4>
                    <p className="text-sm text-gray-600">Analyzes occupation patterns and financial behavior</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Machine Learning</h4>
                    <p className="text-sm text-gray-600">Uses trained models to predict credit risk</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Smart Scoring</h4>
                    <p className="text-sm text-gray-600">Provides accurate risk assessment and recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIportal;