import React, { useState } from 'react';

const LoanApplication = () => {
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    termMonths: '6',
    purpose: 'business_expansion',
    occupation: '',
    businessType: '',
    location: '',
    existingLoans: 'no'
  });

  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAIAssessment = async () => {
    if (!formData.occupation || !formData.amount) {
      alert('Please fill occupation and amount first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8082/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupation: formData.occupation,
          businessType: formData.businessType,
          location: formData.location,
          monthlyVolume: formData.amount * 3
        })
      });
      
      const data = await response.json();
      setAiResult(data);
    } catch (error) {
      console.error('AI Assessment error:', error);
      alert('AI Assessment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8082/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          amount: parseInt(formData.amount),
          termMonths: parseInt(formData.termMonths),
          purpose: formData.purpose
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setSubmitted(true);
        alert('✅ Loan application submitted successfully!');
      } else {
        alert('❌ Loan application failed: ' + data.message);
      }
    } catch (error) {
      alert('❌ Loan application failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-4">Loan Application Submitted!</h1>
        <p className="text-gray-600 mb-6">Your loan application has been received and is under review.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Apply for Another Loan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-2">Loan Application</h1>
      <p className="text-gray-600 text-center mb-8">AI-powered loan assessment</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Loan Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Loan Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">User ID *</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Paste User ID from registration"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Loan Amount (UGX) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="50000"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Occupation *</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="market_vendor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Type</label>
                  <input
                    type="text"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="retail"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="kampala"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Loan Term (Months) *</label>
                  <select
                    name="termMonths"
                    value={formData.termMonths}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Loan Purpose *</label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="business_expansion">Business Expansion</option>
                    <option value="inventory">Inventory</option>
                    <option value="equipment">Equipment</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleAIAssessment}
                  disabled={loading || !formData.occupation || !formData.amount}
                  className="bg-gray-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                  {loading ? 'Assessing...' : '🤖 AI Assessment'}
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400 ml-auto"
                >
                  {loading ? 'Submitting...' : 'Apply for Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* AI Results */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">AI Assessment</h3>
            
            {aiResult ? (
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{aiResult.prediction.riskScore}%</div>
                  <div className="text-sm text-blue-700">Risk Score</div>
                </div>

                <div>
                  <div className="font-medium">Recommendation:</div>
                  <div className="text-green-600 font-semibold">{aiResult.prediction.recommendation}</div>
                </div>

                <div>
                  <div className="font-medium">Max Loan:</div>
                  <div className="font-semibold">UGX {aiResult.prediction.maxLoanAmount?.toLocaleString()}</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-3xl mb-2">🤖</div>
                <p>Complete AI assessment to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;