import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

// Temporary investment service - replace with actual API when ready
const investmentService = {
  create: async (investmentData) => {
    const response = await fetch('/api/investments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(investmentData)
    });
    
    if (!response.ok) {
      throw new Error('Investment creation failed');
    }
    
    return response.json();
  }
};

const InvestmentPlatform = () => {
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    productType: 'SianVendorGrowth',
    duration: 6
  });

  const mutation = useMutation({
    mutationFn: investmentService.create,
    onSuccess: (data) => {
      alert('✅ Investment created successfully!');
      setFormData({ userId: '', amount: '', productType: 'SianVendorGrowth', duration: 6 });
    },
    onError: (error) => {
      alert('❌ Investment creation failed: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const investmentProducts = [
    { 
      id: 'SianVendorGrowth', 
      name: 'Vendor Growth Fund', 
      min: 20000, 
      return: '11.2%', 
      icon: '🛒',
      description: 'For market vendors and retail businesses',
      risk: 'Medium',
      term: '3-24 months'
    },
    { 
      id: 'SianAgriFund', 
      name: 'Green Agriculture Fund', 
      min: 50000, 
      return: '9.5%', 
      icon: '🌱',
      description: 'Sustainable farming and agribusiness',
      risk: 'Low',
      term: '6-36 months'
    },
    { 
      id: 'SianArtisanFund', 
      name: 'Artisan Development Fund', 
      min: 30000, 
      return: '12.8%', 
      icon: '👕',
      description: 'Tailors, welders, carpenters, skilled trades',
      risk: 'Medium',
      term: '3-18 months'
    },
    { 
      id: 'SianTransportFund', 
      name: 'Transport Operators Fund', 
      min: 50000, 
      return: '10.5%', 
      icon: '🏍️',
      description: 'Boda-boda, taxi, and transport sector',
      risk: 'High',
      term: '6-24 months'
    },
    { 
      id: 'SianYouthVenture', 
      name: 'Youth Venture Fund', 
      min: 10000, 
      return: '8.5%', 
      icon: '🚀',
      description: 'Youth entrepreneurs (18-35 years)',
      risk: 'High',
      term: '3-12 months'
    },
    { 
      id: 'SianSaccoBoost', 
      name: 'SACCO Strengthening Fund', 
      min: 100000, 
      return: '7.8%', 
      icon: '👥',
      description: 'Group-based investments for SACCOs',
      risk: 'Low',
      term: '12-48 months'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Platform</h1>
        <p className="text-gray-600">AI-driven investment opportunities for wealth creation across Uganda</p>
      </div>

      {/* Investment Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {investmentProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{product.icon}</div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.risk === 'Low' ? 'bg-green-100 text-green-800' :
                product.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {product.risk} Risk
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Min Investment:</span>
                <span className="font-semibold">UGX {product.min.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg Return:</span>
                <span className="font-semibold text-green-600">{product.return}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Term:</span>
                <span className="font-semibold">{product.term}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Investment Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Create Investment</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({...prev, userId: e.target.value}))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID from registration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Investment Product *</label>
              <select
                name="productType"
                value={formData.productType}
                onChange={(e) => setFormData(prev => ({...prev, productType: e.target.value}))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {investmentProducts.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (UGX) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                  min="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Months) *</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({...prev, duration: parseInt(e.target.value)}))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                  <option value={24}>24 Months</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {mutation.isPending ? 'Creating Investment...' : 'Create Investment'}
            </button>
          </form>

          {mutation.isSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">
                ✅ Investment created successfully! Client can track growth in their portfolio.
              </p>
            </div>
          )}
        </div>

        {/* Performance Dashboard */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="font-semibold text-green-900">Average Returns</div>
                  <div className="text-sm text-green-700">Across all investment products</div>
                </div>
                <div className="text-2xl font-bold text-green-600">10.8%</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold text-blue-900">Active Investments</div>
                  <div className="text-sm text-blue-700">Total portfolio value</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">UGX 1.2B</div>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <div>
                  <div className="font-semibold text-yellow-900">Investors Served</div>
                  <div className="text-sm text-yellow-700">Active investment accounts</div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">1,847</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Funds</h3>
            <div className="space-y-3">
              {investmentProducts.slice(0, 3).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{product.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.return} return</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    index === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {index === 0 ? 'Best' : 'Good'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPlatform;