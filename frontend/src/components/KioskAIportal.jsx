import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t, getLocalizedOption } from '../utils/languages';

const KioskAIportal = () => {
  const { language, changeLanguage, languageOptions } = useLanguage();
  const [userData, setUserData] = useState({
    // Enhanced fields matching new registration structure
    customerType: '',
    phoneNumber: '',
    
    // Enhanced occupation profile
    occupationProfile: {
      primaryOccupation: '',
      yearsInOccupation: '',
      sectorSpecific: {
        cropType: '',
        farmSize: '',
        businessAge: '',
        monthlyRevenue: '',
        marketLocation: '',
        gigPlatform: ''
      }
    },
    
    // Enhanced financial profile
    financialProfile: {
      averageMonthlyIncome: '',
      mobileMoneyUsage: {
        primaryProvider: 'mtn',
        averageBalance: '',
        transactionFrequency: 'daily'
      }
    },
    
    // Location context
    locationContext: {
      region: '',
      district: '',
      village: ''
    }
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Your live backend URL
  const API_BASE_URL = 'https://sianfintech-platform-production.up.railway.app';

  // Enhanced customer types matching new registration
  const customerTypeOptions = [
    { value: 'farmer', labelKey: 'farmer', icon: '👨‍🌾', color: 'green' },
    { value: 'market_vendor', labelKey: 'market_vendor', icon: '🏪', color: 'blue' },
    { value: 'taxi_driver', labelKey: 'taxi_driver', icon: '🚗', color: 'orange' },
    { value: 'artisan', labelKey: 'artisan', icon: '🛠️', color: 'purple' },
    { value: 'shop_owner', labelKey: 'shop_owner', icon: '🏬', color: 'red' },
    { value: 'gig_worker', labelKey: 'gig_worker', icon: '💼', color: 'yellow' },
    { value: 'small_business', labelKey: 'small_business', icon: '📊', color: 'indigo' },
    { value: 'other', labelKey: 'other', icon: '👤', color: 'gray' }
  ];

  // Enhanced occupation options
  const occupationOptions = {
    farmer: [
      { value: 'Crop Farmer', labelKey: 'crop_farmer' },
      { value: 'Livestock Farmer', labelKey: 'livestock_farmer' },
      { value: 'Fisherman', labelKey: 'fisherman' },
      { value: 'Poultry Farmer', labelKey: 'poultry_farmer' }
    ],
    market_vendor: [
      { value: 'Food Vendor', labelKey: 'food_vendor' },
      { value: 'Clothing Vendor', labelKey: 'clothing_vendor' },
      { value: 'Electronics Vendor', labelKey: 'electronics_vendor' },
      { value: 'General Merchandise', labelKey: 'general_merchandise' }
    ],
    taxi_driver: [
      { value: 'Boda Boda', labelKey: 'boda_boda' },
      { value: 'Taxi Driver', labelKey: 'taxi_driver' },
      { value: 'Truck Driver', labelKey: 'truck_driver' }
    ],
    artisan: [
      { value: 'Carpenter', labelKey: 'carpenter' },
      { value: 'Mason', labelKey: 'mason' },
      { value: 'Tailor', labelKey: 'tailor' },
      { value: 'Mechanic', labelKey: 'mechanic' }
    ]
  };

  const cropOptions = [
    { value: 'maize', labelKey: 'maize', icon: '🌽' },
    { value: 'coffee', labelKey: 'coffee', icon: '☕' },
    { value: 'banana', labelKey: 'banana', icon: '🍌' },
    { value: 'beans', labelKey: 'beans', icon: '🫘' },
    { value: 'cassava', labelKey: 'cassava', icon: '🥔' },
    { value: 'rice', labelKey: 'rice', icon: '🍚' }
  ];

  const regionOptions = [
    { value: 'central', labelKey: 'central' },
    { value: 'eastern', labelKey: 'eastern' },
    { value: 'western', labelKey: 'western' },
    { value: 'northern', labelKey: 'northern' }
  ];

  const mobileMoneyProviders = [
    { value: 'mtn', labelKey: 'mtn_momo' },
    { value: 'airtel', labelKey: 'airtel_money' },
    { value: 'africell', labelKey: 'africell_money' }
  ];

  const transactionFrequencyOptions = [
    { value: 'daily', labelKey: 'daily' },
    { value: 'weekly', labelKey: 'weekly' },
    { value: 'monthly', labelKey: 'monthly' },
    { value: 'rarely', labelKey: 'rarely' }
  ];

  const incomeRanges = [
    { value: '0-100000', labelKey: 'income_0_100k' },
    { value: '100000-300000', labelKey: 'income_100k_300k' },
    { value: '300000-500000', labelKey: 'income_300k_500k' },
    { value: '500000-1000000', labelKey: 'income_500k_1m' },
    { value: '1000000+', labelKey: 'income_1m_plus' }
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child, subChild] = field.split('.');
      setUserData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subChild ? {
            ...prev[parent][child],
            [subChild]: value
          } : value
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAIAssessment = async () => {
    setLoading(true);
    
    try {
      let response;
      let assessmentData = {
        ...userData,
        assessmentType: userData.customerType === 'farmer' ? 'farmer' : 'regular',
        timestamp: new Date().toISOString()
      };

      // Use enhanced API endpoint
      response = await fetch(`${API_BASE_URL}/api/ai/enhanced-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        const assessmentResult = await response.json();
        setResult(assessmentResult);
      } else {
        throw new Error('API unavailable');
      }
    } catch (error) {
      // Enhanced offline assessment
      const offlineResult = generateEnhancedOfflineAssessment(userData);
      setResult(offlineResult);
    } finally {
      setLoading(false);
      setStep(5);
    }
  };

  const generateEnhancedOfflineAssessment = (userData) => {
    const { customerType, occupationProfile, financialProfile } = userData;
    
    // Enhanced scoring algorithm
    let baseScore = 50;
    let factors = [];
    
    // Customer type scoring
    const customerScores = {
      'farmer': { base: 60, factors: ['Agricultural profile', 'Seasonal income considered'] },
      'market_vendor': { base: 65, factors: ['Daily cash flow', 'Market business'] },
      'taxi_driver': { base: 55, factors: ['Transport sector', 'Mobile income'] },
      'artisan': { base: 62, factors: ['Skilled trade', 'Service business'] },
      'shop_owner': { base: 70, factors: ['Retail business', 'Fixed location'] },
      'default': { base: 50, factors: ['Standard assessment'] }
    };
    
    const customerProfile = customerScores[customerType] || customerScores.default;
    baseScore = customerProfile.base;
    factors = [...customerProfile.factors];
    
    // Occupation experience scoring
    if (occupationProfile.yearsInOccupation) {
      const experience = parseInt(occupationProfile.yearsInOccupation);
      if (experience > 5) {
        baseScore += 15;
        factors.push('Experienced in occupation');
      } else if (experience > 2) {
        baseScore += 8;
        factors.push('Moderate experience');
      }
    }
    
    // Income scoring
    if (financialProfile.averageMonthlyIncome) {
      const incomeRange = financialProfile.averageMonthlyIncome;
      if (incomeRange.includes('500000')) {
        baseScore += 20;
        factors.push('Good income level');
      } else if (incomeRange.includes('300000')) {
        baseScore += 12;
        factors.push('Moderate income');
      }
    }
    
    // Mobile money usage scoring
    if (financialProfile.mobileMoneyUsage?.transactionFrequency === 'daily') {
      baseScore += 10;
      factors.push('Active mobile money user');
    }
    
    // Calculate risk score (inverted for risk percentage)
    const riskScore = Math.max(10, Math.min(90, 100 - baseScore));
    
    // Determine recommendation
    let recommendation, suggestedLimit;
    if (baseScore >= 70) {
      recommendation = 'APPROVE';
      suggestedLimit = calculateLoanLimit(baseScore, customerType);
    } else if (baseScore >= 55) {
      recommendation = 'REVIEW';
      suggestedLimit = calculateLoanLimit(baseScore, customerType) * 0.7;
    } else {
      recommendation = 'REFER';
      suggestedLimit = 0;
    }
    
    return {
      riskScore: Math.round(riskScore),
      recommendation,
      confidence: 75.0,
      suggestedLimit: Math.round(suggestedLimit),
      isOffline: true,
      isEnhanced: true,
      customerType: userData.customerType,
      factors,
      behavioralInsights: generateBehavioralInsights(userData),
      nextSteps: getNextSteps(recommendation, userData.customerType)
    };
  };

  const calculateLoanLimit = (score, customerType) => {
    const baseLimits = {
      'farmer': 1500000,
      'market_vendor': 2000000,
      'taxi_driver': 1200000,
      'artisan': 1400000,
      'shop_owner': 2500000,
      'default': 1000000
    };
    
    const baseLimit = baseLimits[customerType] || baseLimits.default;
    return baseLimit * (score / 70);
  };

  const generateBehavioralInsights = (userData) => {
    const insights = [];
    const { customerType, financialProfile } = userData;
    
    if (customerType === 'farmer') {
      insights.push('Seasonal income pattern');
      insights.push('Agricultural risk factors');
    }
    
    if (financialProfile.mobileMoneyUsage?.transactionFrequency === 'daily') {
      insights.push('High digital transaction frequency');
    }
    
    if (userData.occupationProfile.yearsInOccupation > 3) {
      insights.push('Stable occupation history');
    }
    
    return insights;
  };

  const getNextSteps = (recommendation, customerType) => {
    if (recommendation === 'APPROVE') {
      return ['Visit agent for document verification', 'Bring national ID and proof of income'];
    } else if (recommendation === 'REVIEW') {
      return ['Agent verification required', 'Additional documents needed', 'Credit history check'];
    } else {
      return ['Speak with loan officer', 'Consider smaller loan amount', 'Build credit history'];
    }
  };

  const resetForm = () => {
    setUserData({
      customerType: '',
      phoneNumber: '',
      occupationProfile: {
        primaryOccupation: '',
        yearsInOccupation: '',
        sectorSpecific: {}
      },
      financialProfile: {
        averageMonthlyIncome: '',
        mobileMoneyUsage: {
          primaryProvider: 'mtn',
          averageBalance: '',
          transactionFrequency: 'daily'
        }
      },
      locationContext: {
        region: '',
        district: '',
        village: ''
      }
    });
    setResult(null);
    setStep(1);
  };

  const getCustomerTypeColor = (type) => {
    const typeObj = customerTypeOptions.find(t => t.value === type);
    return typeObj ? typeObj.color : 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowLanguageSelector(!showLanguageSelector)}
          className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-300 hover:bg-gray-50 text-sm flex items-center space-x-2"
        >
          <span>🌍</span>
          <span>{languageOptions.find(lang => lang.code === language)?.native}</span>
        </button>
        
        {showLanguageSelector && (
          <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-40 z-10">
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setShowLanguageSelector(false);
                }}
                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                  language === lang.code ? 'bg-green-50 text-green-700' : ''
                }`}
              >
                {lang.native}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Kiosk Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-2xl mb-6 text-center shadow-lg">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <div className="text-3xl">🤖</div>
          <div className="text-3xl">📊</div>
        </div>
        <h1 className="text-4xl font-bold mb-2">{t('welcome', language)}</h1>
        <p className="text-green-100 text-lg">{t('enhancedCreditAssessment', language)}</p>
        <div className="flex justify-center space-x-2 mt-3">
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">AI v2.0</span>
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Enhanced</span>
        </div>
      </div>

      {/* Step 1: Customer Type Selection */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('selectCustomerType', language)}</h2>
          <p className="text-gray-600 text-center mb-6">{t('selectYourProfile', language)}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {customerTypeOptions.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  handleInputChange('customerType', type.value);
                  setStep(2);
                }}
                className={`p-6 border-3 rounded-xl hover:shadow-lg transition-all duration-200 text-center ${
                  `border-${type.color}-300 bg-${type.color}-50 hover:bg-${type.color}-100`
                }`}
              >
                <div className="text-4xl mb-3">{type.icon}</div>
                <div className="font-semibold text-gray-800 text-sm">
                  {t(type.labelKey, language)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Occupation Details */}
      {step === 2 && userData.customerType && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="text-2xl">
              {customerTypeOptions.find(t => t.value === userData.customerType)?.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('occupationDetails', language)}</h2>
              <p className="text-gray-600">{t('tellUsAboutYourWork', language)}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Primary Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('primaryOccupation', language)} *
              </label>
              <select
                value={userData.occupationProfile.primaryOccupation || ''}
                onChange={(e) => handleInputChange('occupationProfile.primaryOccupation', e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectOccupation', language)}</option>
                {occupationOptions[userData.customerType]?.map(occupation => (
                  <option key={occupation.value} value={occupation.value}>
                    {t(occupation.labelKey, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Years in Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('yearsInOccupation', language)}
              </label>
              <select
                value={userData.occupationProfile.yearsInOccupation || ''}
                onChange={(e) => handleInputChange('occupationProfile.yearsInOccupation', e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectYears', language)}</option>
                <option value="1">1 {t('year', language)}</option>
                <option value="2">2 {t('years', language)}</option>
                <option value="3">3 {t('years', language)}</option>
                <option value="5">5+ {t('years', language)}</option>
              </select>
            </div>

            {/* Sector Specific Fields */}
            {userData.customerType === 'farmer' && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">🌱 {t('farmingDetails', language)}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('mainCrop', language)}
                    </label>
                    <select
                      value={userData.occupationProfile.sectorSpecific.cropType || ''}
                      onChange={(e) => handleInputChange('occupationProfile.sectorSpecific.cropType', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">{t('selectCrop', language)}</option>
                      {cropOptions.map(crop => (
                        <option key={crop.value} value={crop.value}>
                          {crop.icon} {t(crop.labelKey, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('farmSize', language)} (acres)
                    </label>
                    <input
                      type="number"
                      value={userData.occupationProfile.sectorSpecific.farmSize || ''}
                      onChange={(e) => handleInputChange('occupationProfile.sectorSpecific.farmSize', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t('back', language)}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!userData.occupationProfile.primaryOccupation}
                className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {t('continue', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Financial Information */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('financialInformation', language)}</h2>

          <div className="space-y-4">
            {/* Monthly Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('averageMonthlyIncome', language)}
              </label>
              <select
                value={userData.financialProfile.averageMonthlyIncome || ''}
                onChange={(e) => handleInputChange('financialProfile.averageMonthlyIncome', e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectIncomeRange', language)}</option>
                {incomeRanges.map(income => (
                  <option key={income.value} value={income.value}>
                    {t(income.labelKey, language)}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Money Usage */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">📱 {t('mobileMoneyUsage', language)}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('primaryProvider', language)}
                  </label>
                  <select
                    value={userData.financialProfile.mobileMoneyUsage.primaryProvider || 'mtn'}
                    onChange={(e) => handleInputChange('financialProfile.mobileMoneyUsage.primaryProvider', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {mobileMoneyProviders.map(provider => (
                      <option key={provider.value} value={provider.value}>
                        {t(provider.labelKey, language)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('transactionFrequency', language)}
                  </label>
                  <select
                    value={userData.financialProfile.mobileMoneyUsage.transactionFrequency || 'daily'}
                    onChange={(e) => handleInputChange('financialProfile.mobileMoneyUsage.transactionFrequency', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {transactionFrequencyOptions.map(freq => (
                      <option key={freq.value} value={freq.value}>
                        {t(freq.labelKey, language)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phoneNumber', language)} ({t('optional', language)})
              </label>
              <input
                type="tel"
                value={userData.phoneNumber || ''}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="07XXXXXXXX"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t('back', language)}
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!userData.financialProfile.averageMonthlyIncome}
                className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
              >
                {t('continue', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Location Information */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('locationInformation', language)}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('region', language)}
              </label>
              <select
                value={userData.locationContext.region || ''}
                onChange={(e) => handleInputChange('locationContext.region', e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectRegion', language)}</option>
                {regionOptions.map(region => (
                  <option key={region.value} value={region.value}>
                    {t(region.labelKey, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('district', language)}
              </label>
              <input
                type="text"
                value={userData.locationContext.district || ''}
                onChange={(e) => handleInputChange('locationContext.district', e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder={t('enterDistrict', language)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep(3)}
                className="py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t('back', language)}
              </button>
              <button
                onClick={handleAIAssessment}
                disabled={loading}
                className="py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('analyzing', language)}
                  </div>
                ) : (
                  `🤖 ${t('getEnhancedAssessment', language)}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Enhanced Results */}
      {step === 5 && result && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="text-3xl">
                {customerTypeOptions.find(t => t.value === result.customerType)?.icon}
              </div>
              <div className="text-3xl">📊</div>
              <div className="text-3xl">🤖</div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('enhancedResults', language)}
            </h2>
            
            <div className="flex justify-center space-x-2">
              {result.isOffline && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {t('offline', language)}
                </span>
              )}
              {result.isEnhanced && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {t('enhanced', language)}
                </span>
              )}
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                AI v2.0
              </span>
            </div>
          </div>

          {/* Large result display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg text-center ${
              result.riskScore < 40 ? 'bg-green-100 border-green-300' : 
              result.riskScore < 70 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300'
            } border-2`}>
              <div className="text-3xl font-bold">{result.riskScore}%</div>
              <div className="text-sm">{t('riskScore', language)}</div>
            </div>
            
            <div className={`p-4 rounded-lg text-center border-2 ${
              result.recommendation === 'APPROVE' ? 'bg-green-100 border-green-300' : 
              result.recommendation === 'REVIEW' ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300'
            }`}>
              <div className="text-2xl font-bold">
                {t(result.recommendation.toLowerCase(), language)}
              </div>
              <div className="text-sm">{t('recommendation', language)}</div>
            </div>
          </div>

          {/* Suggested Limit */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg mb-4 border border-purple-200">
            <div className="text-center text-2xl font-bold text-purple-700">
              UGX {result.suggestedLimit?.toLocaleString() || '0'}
            </div>
            <div className="text-center text-sm text-gray-600">
              {t('suggestedLimit', language)}
            </div>
          </div>

          {/* Behavioral Insights */}
          {result.behavioralInsights && result.behavioralInsights.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <span className="mr-2">🎯</span>
                {t('behavioralInsights', language)}:
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.behavioralInsights.map((insight, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {insight}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Factors */}
          {result.factors && result.factors.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">{t('keyFactors', language)}:</h3>
              <div className="flex flex-wrap gap-2">
                {result.factors.map((factor, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {result.nextSteps && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">📝 {t('nextSteps', language)}:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                {result.nextSteps.map((step, index) => (
                  <li key={index}>• {step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={resetForm}
              className="py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {t('newAssessment', language)}
            </button>
            <button className="py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700">
              {t('printResults', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskAIportal;