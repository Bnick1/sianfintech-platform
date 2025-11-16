import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t, getLocalizedOption } from '../utils/languages';

const KioskAIportal = () => {
  const { language, changeLanguage, languageOptions } = useLanguage();
  const [userData, setUserData] = useState({
    occupation: '',
    phoneNumber: '',
    location: '',
    businessType: '',
    monthlyIncome: '',
    cropType: '',
    landSize: '',
    region: '',
    season: '',
    previousYield: '',
    marketAccess: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [assessmentType, setAssessmentType] = useState('');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Options with translation keys
  const occupationOptions = [
    { value: 'market_vendor', labelKey: 'market_vendor', icon: '🛒' },
    { value: 'farmer', labelKey: 'farmer', icon: '👨‍🌾' },
    { value: 'teacher', labelKey: 'teacher', icon: '👨‍🏫' },
    { value: 'driver', labelKey: 'driver', icon: '🚗' },
    { value: 'shop_keeper', labelKey: 'shop_keeper', icon: '🏪' },
    { value: 'fisherman', labelKey: 'fisherman', icon: '🎣' },
    { value: 'other', labelKey: 'other', icon: '🔧' }
  ];

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

  const seasonOptions = [
    { value: 'dry', labelKey: 'dry' },
    { value: 'rainy', labelKey: 'rainy' }
  ];

  const yieldOptions = [
    { value: 'excellent', labelKey: 'excellent' },
    { value: 'good', labelKey: 'good' },
    { value: 'fair', labelKey: 'fair' },
    { value: 'poor', labelKey: 'poor' },
    { value: 'unknown', labelKey: 'unknown' }
  ];

  const marketAccessOptions = [
    { value: 'excellent', labelKey: 'near_market' },
    { value: 'good', labelKey: 'good_access' },
    { value: 'fair', labelKey: 'limited_access' },
    { value: 'poor', labelKey: 'remote' }
  ];

  const incomeOptions = [
    { value: '0-100000', label: '0 - 100,000 UGX' },
    { value: '100000-300000', label: '100,000 - 300,000 UGX' },
    { value: '300000-500000', label: '300,000 - 500,000 UGX' },
    { value: '500000+', label: '500,000+ UGX' }
  ];

  const handleAIAssessment = async () => {
    setLoading(true);
    
    try {
      let response;
      let assessmentData;

      if (assessmentType === 'farmer') {
        assessmentData = {
          cropType: userData.cropType,
          landSize: parseInt(userData.landSize) || 1,
          region: userData.region,
          season: userData.season,
          previousYield: userData.previousYield,
          marketAccess: userData.marketAccess,
          phoneNumber: userData.phoneNumber,
          assessmentType: 'farmer'
        };

        response = await fetch('http://localhost:8082/api/ai/farmer-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessmentData)
        });
      } else {
        assessmentData = {
          occupation: userData.occupation,
          phoneNumber: userData.phoneNumber,
          monthlyIncome: userData.monthlyIncome,
          assessmentType: 'regular'
        };

        response = await fetch('http://localhost:8082/api/ai/credit-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assessmentData)
        });
      }

      if (response.ok) {
        const assessmentResult = await response.json();
        setResult(assessmentResult);
      } else {
        throw new Error('API unavailable');
      }
    } catch (error) {
      const offlineResult = generateOfflineAssessment(userData, assessmentType);
      setResult(offlineResult);
    } finally {
      setLoading(false);
      setStep(5);
    }
  };

  const generateOfflineAssessment = (userData, type) => {
    if (type === 'farmer') {
      const cropScores = {
        'maize': { risk: 45, limit: 1500000 },
        'coffee': { risk: 35, limit: 2000000 },
        'banana': { risk: 30, limit: 1800000 },
        'beans': { risk: 40, limit: 1200000 },
        'cassava': { risk: 25, limit: 1600000 },
        'default': { risk: 50, limit: 1000000 }
      };
      
      const profile = cropScores[userData.cropType] || cropScores.default;
      
      return {
        riskScore: profile.risk,
        recommendation: profile.risk < 40 ? 'APPROVE' : 'REVIEW',
        confidence: 70.0,
        suggestedLimit: profile.limit,
        isOffline: true,
        isFarmer: true,
        factors: ['Basic offline assessment', 'Agent verification required'],
        cropAdvisory: [t('visit_agent_advice', language)],
        insuranceRecommendation: 'RECOMMENDED'
      };
    } else {
      const baseScores = {
        'market_vendor': { risk: 35, limit: 2500000 },
        'farmer': { risk: 55, limit: 1500000 },
        'teacher': { risk: 25, limit: 3500000 },
        'default': { risk: 50, limit: 1000000 }
      };
      
      const profile = baseScores[userData.occupation] || baseScores.default;
      
      return {
        riskScore: profile.risk,
        recommendation: profile.risk < 40 ? 'APPROVE' : 'REVIEW',
        confidence: 75.0,
        suggestedLimit: profile.limit,
        isOffline: true,
        factors: ['Basic offline assessment', 'Agent verification required']
      };
    }
  };

  const resetForm = () => {
    setUserData({
      occupation: '',
      phoneNumber: '',
      location: '',
      businessType: '',
      monthlyIncome: '',
      cropType: '',
      landSize: '',
      region: '',
      season: '',
      previousYield: '',
      marketAccess: ''
    });
    setResult(null);
    setStep(1);
    setAssessmentType('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Language Selector Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowLanguageSelector(!showLanguageSelector)}
          className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-300 hover:bg-gray-50 text-sm"
        >
          🌍 {languageOptions.find(lang => lang.code === language)?.native}
        </button>
        
        {showLanguageSelector && (
          <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-40">
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

      {/* Kiosk Header */}
      <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center">
        <h1 className="text-3xl font-bold">{t('welcome', language)}</h1>
        <p className="text-green-100">{t('creditAssessment', language)}</p>
      </div>

      {/* Step 1: Occupation Selection */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('selectOccupation', language)}</h2>
          <div className="grid grid-cols-2 gap-4">
            {occupationOptions.map((occupation) => (
              <button
                key={occupation.value}
                onClick={() => {
                  const newData = {...userData, occupation: occupation.value};
                  setUserData(newData);
                  
                  if (occupation.value === 'farmer') {
                    setAssessmentType('farmer');
                    setStep(3);
                  } else {
                    setAssessmentType('regular');
                    setStep(2);
                  }
                }}
                className="p-6 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all duration-200 text-center"
              >
                <div className="text-4xl mb-2">{occupation.icon}</div>
                <div className="font-semibold text-gray-800">
                  {t(occupation.labelKey, language)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Contact Info (Regular Assessment) */}
      {step === 2 && assessmentType === 'regular' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('contactInfo', language)}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phoneNumber', language)}
              </label>
              <input
                type="tel"
                value={userData.phoneNumber}
                onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="07XXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('monthlyIncome', language)}
              </label>
              <select
                value={userData.monthlyIncome}
                onChange={(e) => setUserData({...userData, monthlyIncome: e.target.value})}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectRange', language)}</option>
                {incomeOptions.map(income => (
                  <option key={income.value} value={income.value}>
                    {income.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t('back', language)}
              </button>
              <button
                onClick={handleAIAssessment}
                disabled={!userData.phoneNumber}
                className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {t('getAssessment', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Farmer Crop Selection */}
      {step === 3 && assessmentType === 'farmer' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('cropInfo', language)}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('mainCrop', language)}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {cropOptions.map((crop) => (
                  <button
                    key={crop.value}
                    onClick={() => setUserData({...userData, cropType: crop.value})}
                    className={`p-4 border-2 rounded-lg text-center ${
                      userData.cropType === crop.value 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{crop.icon}</div>
                    <div className="text-sm font-medium">
                      {t(crop.labelKey, language)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('landSize', language)}
              </label>
              <input
                type="number"
                value={userData.landSize}
                onChange={(e) => setUserData({...userData, landSize: e.target.value})}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder={t('enterAcres', language)}
                min="1"
                max="100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t('back', language)}
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!userData.cropType || !userData.landSize}
                className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
              >
                {t('continue', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Farmer Additional Details */}
      {step === 4 && assessmentType === 'farmer' && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('farmDetails', language)}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('region', language)}
                </label>
                <select
                  value={userData.region}
                  onChange={(e) => setUserData({...userData, region: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  {t('season', language)}
                </label>
                <select
                  value={userData.season}
                  onChange={(e) => setUserData({...userData, season: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t('selectSeason', language)}</option>
                  {seasonOptions.map(season => (
                    <option key={season.value} value={season.value}>
                      {t(season.labelKey, language)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('previousYield', language)}
              </label>
              <select
                value={userData.previousYield}
                onChange={(e) => setUserData({...userData, previousYield: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectYield', language)}</option>
                {yieldOptions.map(yieldOpt => (
                  <option key={yieldOpt.value} value={yieldOpt.value}>
                    {t(yieldOpt.labelKey, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('marketAccess', language)}
              </label>
              <select
                value={userData.marketAccess}
                onChange={(e) => setUserData({...userData, marketAccess: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">{t('selectMarket', language)}</option>
                {marketAccessOptions.map(access => (
                  <option key={access.value} value={access.value}>
                    {t(access.labelKey, language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phoneNumber', language)} ({t('optional', language)})
              </label>
              <input
                type="tel"
                value={userData.phoneNumber}
                onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="07XXXXXXXX"
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
                className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? t('analyzing', language) : t('getAssessment', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Results Screen */}
      {step === 5 && result && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {result.isFarmer ? t('farmerResults', language) : t('results', language)}
            </h2>
            <div className="flex justify-center space-x-2 mt-2">
              {result.isOffline && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  {t('offline', language)}
                </span>
              )}
              {result.isFarmer && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {t('farmer', language)}
                </span>
              )}
            </div>
          </div>

          {/* Large result display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg text-center ${
              result.riskScore < 40 ? 'bg-green-100' : 
              result.riskScore < 70 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <div className="text-3xl font-bold">{result.riskScore}%</div>
              <div className="text-sm">{t('riskScore', language)}</div>
            </div>
            
            <div className={`p-4 rounded-lg text-center ${
              result.recommendation === 'APPROVE' ? 'bg-green-100' : 
              result.recommendation === 'REVIEW' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <div className="text-2xl font-bold">
                {t(result.recommendation.toLowerCase(), language)}
              </div>
              <div className="text-sm">{t('recommendation', language)}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="text-center text-xl font-bold text-purple-700">
              UGX {result.suggestedLimit?.toLocaleString() || '0'}
            </div>
            <div className="text-center text-sm text-gray-600">
              {t('suggestedLimit', language)}
            </div>
          </div>

          {/* Key Factors */}
          {result.factors && result.factors.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">{t('keyFactors', language)}:</h3>
              <div className="flex flex-wrap gap-2">
                {result.factors.map((factor, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Farmer-specific advisory */}
          {result.isFarmer && result.cropAdvisory && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                🌱 {t('farmingAdvice', language)}:
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                {result.cropAdvisory.map((advice, index) => (
                  <li key={index}>• {advice}</li>
                ))}
              </ul>
              {result.insuranceRecommendation && (
                <div className="mt-2 text-sm">
                  <strong>{t('insurance', language)}:</strong> {t(result.insuranceRecommendation.toLowerCase(), language)}
                </div>
              )}
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
            <button className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
              {t('print', language)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskAIportal;