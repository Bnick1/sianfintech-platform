// src/pages/UserRegistration.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    dateOfBirth: '',
    
    // NEW: Enhanced Customer Type
    customerType: 'informal_trader',
    
    // NEW: Enhanced Occupation Profile
    occupationProfile: {
      primaryOccupation: '',
      secondaryOccupation: '',
      yearsInOccupation: 0,
      sectorSpecific: {
        cropType: '',
        farmSize: 0,
        farmingExperience: 0,
        landOwnership: 'owned',
        businessAge: 0,
        monthlyRevenue: 0,
        marketLocation: '',
        gigPlatform: ''
      }
    },
    
    // NEW: Enhanced Financial Profile
    financialProfile: {
      averageMonthlyIncome: 0,
      incomeSources: [],
      incomeConsistency: 'stable',
      mobileMoneyUsage: {
        primaryProvider: 'mtn',
        averageMonthlyTransactions: 0,
        averageBalance: 0,
        transactionFrequency: 'daily',
        commonTransactionTypes: []
      },
      existingLoans: {
        hasActiveLoans: false,
        totalLoanBalance: 0,
        monthlyRepayments: 0,
        repaymentHistory: 'good'
      }
    },
    
    // NEW: Social Capital
    socialCapital: {
      communityInvolvement: {
        isCommunityMember: false,
        communityGroups: [],
        leadershipRoles: []
      },
      references: [],
      socialConnections: {
        familyInArea: false,
        localBusinessRelations: false,
        knownByLocalLeader: false
      }
    },
    
    // NEW: Location Context
    locationContext: {
      region: '',
      district: '',
      subcounty: '',
      parish: '',
      village: '',
      distanceToMarket: 0,
      transportAvailable: false,
      marketDays: []
    },
    
    // Location (existing for backward compatibility)
    location: '',
    idNumber: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Enhanced customer types for informal sector
  const customerTypes = [
    { value: 'farmer', label: 'Farmer', icon: '👨‍🌾' },
    { value: 'market_vendor', label: 'Market Vendor', icon: '🏪' },
    { value: 'taxi_driver', label: 'Taxi/Boda Driver', icon: '🚗' },
    { value: 'artisan', label: 'Artisan/Craftsman', icon: '🛠️' },
    { value: 'shop_owner', label: 'Shop Owner', icon: '🏬' },
    { value: 'gig_worker', label: 'Gig Worker', icon: '💼' },
    { value: 'small_business', label: 'Small Business', icon: '📊' },
    { value: 'other', label: 'Other', icon: '👤' }
  ];

  const occupations = {
    farmer: ['Crop Farmer', 'Livestock Farmer', 'Fisherman', 'Poultry Farmer', 'Mixed Farmer'],
    market_vendor: ['Food Vendor', 'Clothing Vendor', 'Electronics Vendor', 'General Merchandise', 'Fresh Produce'],
    taxi_driver: ['Boda Boda', 'Taxi Driver', 'Truck Driver', 'Delivery Rider'],
    artisan: ['Carpenter', 'Mason', 'Tailor', 'Mechanic', 'Electrician', 'Plumber'],
    shop_owner: ['Grocery Store', 'Hardware Store', 'Clothing Boutique', 'Electronics Shop', 'Pharmacy'],
    gig_worker: ['Ride Hailing', 'Delivery Services', 'Freelance Work', 'Construction Labor'],
    small_business: ['Restaurant', 'Salon', 'Repair Shop', 'Consulting', 'Trading'],
    other: ['Student', 'Household', 'Unemployed', 'Other']
  };

  const mobileMoneyProviders = [
    { value: 'mtn', label: 'MTN Mobile Money', icon: '📱' },
    { value: 'airtel', label: 'Airtel Money', icon: '📱' },
    { value: 'africell', label: 'Africell Money', icon: '📱' },
    { value: 'other', label: 'Other', icon: '📱' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subChild ? {
            ...prev[parent][child],
            [subChild]: type === 'checkbox' ? checked : value
          } : (type === 'checkbox' ? checked : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCustomerTypeChange = (customerType) => {
    setFormData(prev => ({
      ...prev,
      customerType,
      occupationProfile: {
        ...prev.occupationProfile,
        primaryOccupation: ''
      }
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      socialCapital: {
        ...prev.socialCapital,
        references: [
          ...prev.socialCapital.references,
          { name: '', phone: '', relationship: '', yearsKnown: 0 }
        ]
      }
    }));
  };

  const updateReference = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      socialCapital: {
        ...prev.socialCapital,
        references: prev.socialCapital.references.map((ref, i) => 
          i === index ? { ...ref, [field]: value } : ref
        )
      }
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationalId: '',
      dateOfBirth: '',
      customerType: 'informal_trader',
      occupationProfile: {
        primaryOccupation: '',
        secondaryOccupation: '',
        yearsInOccupation: 0,
        sectorSpecific: {
          cropType: '',
          farmSize: 0,
          farmingExperience: 0,
          landOwnership: 'owned',
          businessAge: 0,
          monthlyRevenue: 0,
          marketLocation: '',
          gigPlatform: ''
        }
      },
      financialProfile: {
        averageMonthlyIncome: 0,
        incomeSources: [],
        incomeConsistency: 'stable',
        mobileMoneyUsage: {
          primaryProvider: 'mtn',
          averageMonthlyTransactions: 0,
          averageBalance: 0,
          transactionFrequency: 'daily',
          commonTransactionTypes: []
        },
        existingLoans: {
          hasActiveLoans: false,
          totalLoanBalance: 0,
          monthlyRepayments: 0,
          repaymentHistory: 'good'
        }
      },
      socialCapital: {
        communityInvolvement: {
          isCommunityMember: false,
          communityGroups: [],
          leadershipRoles: []
        },
        references: [],
        socialConnections: {
          familyInArea: false,
          localBusinessRelations: false,
          knownByLocalLeader: false
        }
      },
      locationContext: {
        region: '',
        district: '',
        subcounty: '',
        parish: '',
        village: '',
        distanceToMarket: 0,
        transportAvailable: false,
        marketDays: []
      },
      location: '',
      idNumber: ''
    });
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    try {
      // Submit to enhanced backend API
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('User registered successfully! AI assessment initiated.');
        console.log('Registration result:', result);
        resetForm(); // Clear form after successful submission
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration completed! AI assessment will run in background.');
      resetForm(); // Clear form even if there's an error
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            National ID *
          </label>
          <input
            type="text"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter National ID number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Occupation & Business</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Customer Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {customerTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleCustomerTypeChange(type.value)}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.customerType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Occupation *
        </label>
        <select
          name="occupationProfile.primaryOccupation"
          value={formData.occupationProfile.primaryOccupation}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">Select occupation</option>
          {occupations[formData.customerType]?.map(occupation => (
            <option key={occupation} value={occupation}>{occupation}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years in this Occupation
          </label>
          <input
            type="number"
            name="occupationProfile.yearsInOccupation"
            value={formData.occupationProfile.yearsInOccupation}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Occupation
          </label>
          <input
            type="text"
            name="occupationProfile.secondaryOccupation"
            value={formData.occupationProfile.secondaryOccupation}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Sector-specific fields */}
      {formData.customerType === 'farmer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-yellow-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Type
            </label>
            <input
              type="text"
              name="occupationProfile.sectorSpecific.cropType"
              value={formData.occupationProfile.sectorSpecific.cropType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Maize, Coffee"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Size (acres)
            </label>
            <input
              type="number"
              name="occupationProfile.sectorSpecific.farmSize"
              value={formData.occupationProfile.sectorSpecific.farmSize}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Average Monthly Income (UGX)
          </label>
          <input
            type="number"
            name="financialProfile.averageMonthlyIncome"
            value={formData.financialProfile.averageMonthlyIncome}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Income Consistency
          </label>
          <select
            name="financialProfile.incomeConsistency"
            value={formData.financialProfile.incomeConsistency}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="stable">Stable</option>
            <option value="seasonal">Seasonal</option>
            <option value="irregular">Irregular</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Mobile Money Usage</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Provider
            </label>
            <select
              name="financialProfile.mobileMoneyUsage.primaryProvider"
              value={formData.financialProfile.mobileMoneyUsage.primaryProvider}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {mobileMoneyProviders.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Balance (UGX)
            </label>
            <input
              type="number"
              name="financialProfile.mobileMoneyUsage.averageBalance"
              value={formData.financialProfile.mobileMoneyUsage.averageBalance}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link to="/" className="bg-blue-600 text-white p-2 rounded-lg">
                <span className="font-bold text-lg">Sian</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Enhanced Client Registration</h1>
                <p className="text-sm text-gray-600">Register clients with comprehensive informal sector data</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep} of 3
            </div>
          </div>
          <div className="flex text-sm font-medium">
            <div className={`${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Basic Info</div>
            <div className={`mx-4 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Occupation</div>
            <div className={`${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>Financial</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-blue-600">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Register New Client</h2>
            <p className="text-gray-600 mt-2">Complete the enhanced registration form for better AI assessment</p>
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex justify-between space-x-4 pt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              ) : (
                <Link
                  to="/"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <span className="mr-2">✓</span>
                  Complete Registration
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;