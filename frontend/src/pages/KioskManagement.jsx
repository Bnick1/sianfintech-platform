import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { kioskService } from '../services/api';

const KioskManagement = () => {
  const [formData, setFormData] = useState({
    kioskId: '',
    location: '',
    operatorName: '',
    region: 'central'
  });

  const [selectedKiosk, setSelectedKiosk] = useState(null);

  const registerMutation = useMutation({
    mutationFn: kioskService.register,
    onSuccess: (data) => {
      alert('✅ Kiosk registered successfully!');
      setFormData({ kioskId: '', location: '', operatorName: '', region: 'central' });
    },
    onError: (error) => {
      alert('❌ Kiosk registration failed: ' + error.response?.data?.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const sampleKiosks = [
    { id: 'KSK001', location: 'Mbarara Central Market', operator: 'Sarah K.', status: 'active', transactions: 147, lastActive: '2 hours ago' },
    { id: 'KSK002', location: 'Kampala Nakasero Market', operator: 'David M.', status: 'active', transactions: 203, lastActive: '30 minutes ago' },
    { id: 'KSK003', location: 'Jinja Main Market', operator: 'Grace L.', status: 'maintenance', transactions: 89, lastActive: '5 hours ago' },
    { id: 'KSK004', location: 'Gulu Town Market', operator: 'John O.', status: 'active', transactions: 124, lastActive: '1 hour ago' },
    { id: 'KSK005', location: 'Masaka Central', operator: 'Maria N.', status: 'offline', transactions: 67, lastActive: '1 day ago' },
    { id: 'KSK006', location: 'Mbale Market', operator: 'Peter K.', status: 'active', transactions: 156, lastActive: '45 minutes ago' },
  ];

  const regions = [
    { id: 'central', name: 'Central Region', kiosks: 12, active: 10 },
    { id: 'western', name: 'Western Region', kiosks: 8, active: 7 },
    { id: 'eastern', name: 'Eastern Region', kiosks: 6, active: 5 },
    { id: 'northern', name: 'Northern Region', kiosks: 4, active: 3 },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiosk Management</h1>
        <p className="text-gray-600">Manage field operations and agent network across Uganda</p>
      </div>

      {/* Regional Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {regions.map(region => (
          <div key={region.id} className="card text-center">
            <h3 className="font-semibold text-gray-900 mb-2">{region.name}</h3>
            <div className="flex justify-center space-x-6 text-sm">
              <div>
                <div className="text-2xl font-bold text-primary-600">{region.kiosks}</div>
                <div className="text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-600">{region.active}</div>
                <div className="text-gray-500">Active</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kiosk Registration */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Register New Kiosk</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kiosk ID *</label>
                <input
                  type="text"
                  name="kioskId"
                  value={formData.kioskId}
                  onChange={(e) => setFormData(prev => ({...prev, kioskId: e.target.value}))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="KSK007"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter location address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operator Name *</label>
                <input
                  type="text"
                  name="operatorName"
                  value={formData.operatorName}
                  onChange={(e) => setFormData(prev => ({...prev, operatorName: e.target.value}))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter operator full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region *</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({...prev, region: e.target.value}))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="central">Central Region</option>
                  <option value="western">Western Region</option>
                  <option value="eastern">Eastern Region</option>
                  <option value="northern">Northern Region</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={registerMutation.isPending}
                className="btn-primary w-full disabled:opacity-50"
              >
                {registerMutation.isPending ? 'Registering...' : 'Register Kiosk'}
              </button>
            </form>
          </div>
        </div>

        {/* Kiosk List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Active Kiosks</h3>
              <div className="text-sm text-gray-500">30 kiosks total</div>
            </div>

            <div className="space-y-4">
              {sampleKiosks.map(kiosk => (
                <div key={kiosk.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      kiosk.status === 'active' ? 'bg-success-500' :
                      kiosk.status === 'maintenance' ? 'bg-warning-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <div className="font-semibold text-gray-900">{kiosk.id}</div>
                      <div className="text-sm text-gray-500">{kiosk.location}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{kiosk.operator}</div>
                    <div className="text-sm text-gray-500">{kiosk.transactions} transactions</div>
                    <div className="text-xs text-gray-400">Last active: {kiosk.lastActive}</div>
                  </div>

                  <button
                    onClick={() => setSelectedKiosk(kiosk.id)}
                    className="btn-secondary text-sm"
                  >
                    Check Status
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status Check */}
          {selectedKiosk && (
            <div className="card mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Status for {selectedKiosk}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-success-50 rounded-lg">
                    <div className="text-2xl font-bold text-success-600">Active</div>
                    <div className="text-sm text-success-700">Kiosk Status</div>
                  </div>
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">24/7</div>
                    <div className="text-sm text-primary-700">Availability</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Last transaction: 45 minutes ago</li>
                    <li>✓ Network connection: Stable</li>
                    <li>✓ Cash balance: UGX 2,450,000</li>
                    <li>✓ Printer status: Online</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KioskManagement;