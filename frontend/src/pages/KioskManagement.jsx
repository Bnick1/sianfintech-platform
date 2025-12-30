// src/pages/KioskManagement.jsx
import React, { useState, useEffect } from 'react';
import { kiosksAPI } from '../services/apiService';
import { monitorKioskPerformance, generateKioskReport } from '../utils/kioskMonitoring';
import { generateMockKiosks } from '../services/mockDataService';

const KioskManagement = () => {
  const [kiosks, setKiosks] = useState([]);
  const [report, setReport] = useState(null);
  const [selectedKiosk, setSelectedKiosk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [agriculturalServices, setAgriculturalServices] = useState({
    farmerRegistrations: 0,
    inputLoans: 0,
    harvestPayments: 0,
    insuranceEnrollments: 0
  });
  const [userRole, setUserRole] = useState('admin'); // Would come from auth context
  const [newMaintenance, setNewMaintenance] = useState({
    type: 'routine',
    description: '',
    scheduledDate: '',
    estimatedDuration: '2'
  });

  useEffect(() => {
    loadKioskData();
    const interval = setInterval(loadKioskData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (kiosks.length > 0) {
      calculateAgriculturalServices();
    }
  }, [kiosks]);

  const loadKioskData = async () => {
    try {
      setLoading(true);
      let kioskData;

      if (useMockData) {
        kioskData = generateMockKiosks();
      } else {
        try {
          kioskData = await kiosksAPI.getKiosks();
        } catch (error) {
          console.warn('Backend unavailable, using mock data:', error);
          setUseMockData(true);
          kioskData = generateMockKiosks();
        }
      }

      setKiosks(kioskData);
      
      // Generate comprehensive report
      const kioskReport = generateKioskReport(kioskData);
      setReport(kioskReport);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load kiosk data:', error);
      // Fallback to mock data
      const mockKiosks = generateMockKiosks();
      setKiosks(mockKiosks);
      setReport(generateKioskReport(mockKiosks));
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateAgriculturalServices = () => {
    const services = kiosks.reduce((acc, kiosk) => ({
      farmerRegistrations: acc.farmerRegistrations + (kiosk.farmerRegistrations || 0),
      inputLoans: acc.inputLoans + (kiosk.agriculturalLoans || 0),
      harvestPayments: acc.harvestPayments + (kiosk.harvestTransactions || 0),
      insuranceEnrollments: acc.insuranceEnrollments + (kiosk.insuranceSales || 0)
    }), { farmerRegistrations: 0, inputLoans: 0, harvestPayments: 0, insuranceEnrollments: 0 });

    setAgriculturalServices(services);
  };

  const handleKioskSelect = async (kiosk) => {
    setSelectedKiosk(kiosk);
    
    // Load detailed kiosk information if available
    if (!useMockData) {
      try {
        const detailedKiosk = await kiosksAPI.getKiosk(kiosk.id);
        const performance = monitorKioskPerformance(detailedKiosk);
        setSelectedKiosk({ ...detailedKiosk, performance });
      } catch (error) {
        console.warn('Could not load detailed kiosk info:', error);
        const performance = monitorKioskPerformance(kiosk);
        setSelectedKiosk({ ...kiosk, performance });
      }
    } else {
      const performance = monitorKioskPerformance(kiosk);
      setSelectedKiosk({ ...kiosk, performance });
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKiosk) return;

    try {
      const maintenanceData = {
        ...newMaintenance,
        kioskId: selectedKiosk.id,
        scheduledBy: 'admin',
        status: 'scheduled'
      };

      if (!useMockData) {
        await kiosksAPI.scheduleMaintenance(selectedKiosk.id, maintenanceData);
      }

      // Update local state
      const updatedKiosks = kiosks.map(k => 
        k.id === selectedKiosk.id 
          ? { ...k, lastMaintenance: new Date().toISOString().split('T')[0] }
          : k
      );

      setKiosks(updatedKiosks);
      setMaintenanceMode(false);
      setNewMaintenance({
        type: 'routine',
        description: '',
        scheduledDate: '',
        estimatedDuration: '2'
      });

      alert('Maintenance scheduled successfully!');
    } catch (error) {
      alert('Failed to schedule maintenance: ' + error.message);
    }
  };

  const updateKioskStatus = async (kioskId, updates) => {
    try {
      if (!useMockData) {
        await kiosksAPI.updateKiosk(kioskId, updates);
      }

      // Update local state
      const updatedKiosks = kiosks.map(k => 
        k.id === kioskId ? { ...k, ...updates } : k
      );

      setKiosks(updatedKiosks);
      
      // Update selected kiosk if it's the one being modified
      if (selectedKiosk && selectedKiosk.id === kioskId) {
        setSelectedKiosk(prev => ({ ...prev, ...updates }));
      }

      return true;
    } catch (error) {
      console.error('Failed to update kiosk:', error);
      return false;
    }
  };

  const initiateAgriculturalService = async (serviceType) => {
    if (!selectedKiosk) return;
    
    try {
      const serviceData = {
        kioskId: selectedKiosk.id,
        serviceType,
        timestamp: new Date().toISOString(),
        agent: 'kiosk_operator'
      };

      if (!useMockData) {
        await kiosksAPI.logService(selectedKiosk.id, serviceData);
      }

      // Update local state
      const serviceField = {
        'farmer_registration': 'farmerRegistrations',
        'input_loan': 'agriculturalLoans',
        'harvest_payment': 'harvestTransactions',
        'insurance': 'insuranceSales'
      }[serviceType];

      if (serviceField) {
        const updatedKiosks = kiosks.map(k => 
          k.id === selectedKiosk.id 
            ? { ...k, [serviceField]: (k[serviceField] || 0) + 1 }
            : k
        );
        setKiosks(updatedKiosks);
      }

      alert(`${serviceType.replace('_', ' ')} initiated successfully!`);
    } catch (error) {
      alert(`Failed to initiate ${serviceType}: ${error.message}`);
    }
  };

  const monitorRuralConnectivity = (kiosk) => {
    const { location, connectivityStatus, lastSync } = kiosk;
    const isRural = location.toLowerCase().includes('rural') || 
                    location.toLowerCase().includes('village') ||
                    location.toLowerCase().includes('remote');

    if (isRural && !connectivityStatus) {
      return {
        alert: true,
        message: 'Rural kiosk offline - limited alternative access points',
        priority: 'high',
        recommendation: 'Dispatch mobile team or check network coverage'
      };
    }

    return { alert: false };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'needs_attention': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectivityStatus = (kiosk) => {
    if (!kiosk.connectivityStatus) return { text: 'Offline', color: 'text-red-600' };
    
    const performance = monitorKioskPerformance(kiosk);
    if (performance.healthStatus === 'healthy') return { text: 'Online', color: 'text-green-600' };
    if (performance.healthStatus === 'warning') return { text: 'Degraded', color: 'text-yellow-600' };
    return { text: 'Needs Attention', color: 'text-red-600' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  if (loading && !lastUpdated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading kiosk data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiosk Management</h1>
            <p className="text-gray-600">
              {useMockData ? 'Development Mode (Mock Data)' : 'Live Kiosk Monitoring'}
              {lastUpdated && (
                <span className="text-xs text-gray-500 ml-2">
                  Updated {formatTimestamp(lastUpdated)}
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={loadKioskData}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
            </button>
            {useMockData && (
              <button 
                onClick={() => setUseMockData(false)}
                className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
              >
                Try Live Data
              </button>
            )}
            {userRole === 'admin' && (
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                Admin Tools
              </button>
            )}
          </div>
        </div>

        {/* Summary Report */}
        {report && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{report.summary.totalKiosks}</p>
              <p className="text-sm text-gray-600">Total Kiosks</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{report.summary.activeKiosks}</p>
              <p className="text-sm text-gray-600">Online</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{report.summary.offlineKiosks}</p>
              <p className="text-sm text-gray-600">Offline</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{report.summary.totalTransactions}</p>
              <p className="text-sm text-gray-600">Today's Transactions</p>
            </div>
            
            {/* Agricultural Service Metrics */}
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{agriculturalServices.farmerRegistrations}</p>
              <p className="text-sm text-gray-600">Farmer Registrations</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{agriculturalServices.inputLoans}</p>
              <p className="text-sm text-gray-600">Input Loans</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{agriculturalServices.harvestPayments}</p>
              <p className="text-sm text-gray-600">Harvest Payments</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{agriculturalServices.insuranceEnrollments}</p>
              <p className="text-sm text-gray-600">Insurance Policies</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Kiosk List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Kiosk Network</h2>
                <span className="text-sm text-gray-500">
                  {kiosks.length} kiosks • {report?.performance?.averagePerformance?.toFixed(1)}% avg performance
                </span>
              </div>
              <div className="divide-y">
                {kiosks.map(kiosk => {
                  const performance = monitorKioskPerformance(kiosk);
                  const connectivity = getConnectivityStatus(kiosk);
                  const ruralStatus = monitorRuralConnectivity(kiosk);
                  
                  return (
                    <div 
                      key={kiosk.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleKioskSelect(kiosk)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            kiosk.connectivityStatus ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{kiosk.name}</h3>
                            <p className="text-sm text-gray-600">
                              {kiosk.location}
                              {ruralStatus.alert && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-1 rounded">Rural</span>}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(performance.healthStatus)}`}>
                              {performance.healthStatus.replace('_', ' ')}
                            </span>
                            <span className={`text-sm font-medium ${connectivity.color}`}>
                              {connectivity.text}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{kiosk.transactionsToday} transactions</span>
                            <span>{formatCurrency(kiosk.cashBalance)}</span>
                            <span>Score: {performance.performanceScore.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {performance.alerts.length > 0 && (
                        <div className="mt-2 flex space-x-2">
                          {performance.alerts.slice(0, 2).map((alert, index) => (
                            <div key={index} className={`text-xs px-2 py-1 rounded ${
                              alert.priority === 'high' 
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                              ⚠️ {alert.message}
                            </div>
                          ))}
                          {performance.alerts.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{performance.alerts.length - 2} more alerts
                            </div>
                          )}
                        </div>
                      )}

                      {/* Agricultural Services Summary */}
                      <div className="mt-2 flex space-x-4 text-xs">
                        {(kiosk.farmerRegistrations > 0) && (
                          <span className="text-green-700">👨‍🌾 {kiosk.farmerRegistrations} farmers</span>
                        )}
                        {(kiosk.agriculturalLoans > 0) && (
                          <span className="text-blue-700">💰 {kiosk.agriculturalLoans} input loans</span>
                        )}
                        {(kiosk.insuranceSales > 0) && (
                          <span className="text-purple-700">🛡️ {kiosk.insuranceSales} insurance</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Kiosk Details & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {selectedKiosk ? (
              <>
                {/* Kiosk Details */}
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Kiosk Details</h2>
                    <button
                      onClick={() => setMaintenanceMode(true)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Schedule Maintenance
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedKiosk.name}</h3>
                      <p className="text-sm text-gray-600">{selectedKiosk.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{selectedKiosk.transactionsToday}</p>
                        <p className="text-xs text-gray-600">Transactions Today</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedKiosk.cashBalance)}</p>
                        <p className="text-xs text-gray-600">Cash Balance</p>
                      </div>
                    </div>

                    {/* Agricultural Services */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Agricultural Services</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="font-semibold text-green-700">{selectedKiosk.farmerRegistrations || 0}</p>
                          <p className="text-xs text-green-600">Farmer Reg</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="font-semibold text-blue-700">{selectedKiosk.agriculturalLoans || 0}</p>
                          <p className="text-xs text-blue-600">Input Loans</p>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <p className="font-semibold text-orange-700">{selectedKiosk.harvestTransactions || 0}</p>
                          <p className="text-xs text-orange-600">Harvest Pay</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <p className="font-semibold text-purple-700">{selectedKiosk.insuranceSales || 0}</p>
                          <p className="text-xs text-purple-600">Insurance</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Performance Score</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedKiosk.performance?.performanceScore >= 80 ? 'bg-green-500' :
                            selectedKiosk.performance?.performanceScore >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{width: `${selectedKiosk.performance?.performanceScore || 0}%`}}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedKiosk.performance?.performanceScore?.toFixed(1)}%
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-medium capitalize">
                          {selectedKiosk.connectivityStatus ? 'Online' : 'Offline'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Maintenance:</span>
                        <p className="font-medium">
                          {formatTimestamp(selectedKiosk.lastMaintenance)}
                        </p>
                      </div>
                    </div>

                    {selectedKiosk.performance?.alerts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Active Alerts</h4>
                        <div className="space-y-2">
                          {selectedKiosk.performance.alerts.map((alert, index) => (
                            <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                              <div className="font-medium text-red-800">{alert.message}</div>
                              <div className="text-red-600 text-xs">Priority: {alert.priority}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedKiosk.performance?.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {selectedKiosk.performance.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => updateKioskStatus(selectedKiosk.id, { connectivityStatus: true })}
                          disabled={selectedKiosk.connectivityStatus}
                          className="w-full bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                          Mark Online
                        </button>
                        <button
                          onClick={() => updateKioskStatus(selectedKiosk.id, { connectivityStatus: false })}
                          disabled={!selectedKiosk.connectivityStatus}
                          className="w-full bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400"
                        >
                          Mark Offline
                        </button>
                        
                        {/* Agricultural Service Actions */}
                        <button
                          onClick={() => initiateAgriculturalService('farmer_registration')}
                          className="w-full bg-green-700 text-white py-2 px-3 rounded text-sm hover:bg-green-800 transition-colors"
                        >
                          Farmer Registration
                        </button>
                        <button
                          onClick={() => initiateAgriculturalService('input_loan')}
                          className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Input Loan Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maintenance Scheduling */}
                {maintenanceMode && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Maintenance</h3>
                    <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type</label>
                        <select
                          value={newMaintenance.type}
                          onChange={(e) => setNewMaintenance(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="routine">Routine Maintenance</option>
                          <option value="repair">Repair</option>
                          <option value="upgrade">Upgrade</option>
                          <option value="emergency">Emergency</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={newMaintenance.description}
                          onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows="3"
                          placeholder="Describe the maintenance required..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                          <input
                            type="date"
                            value={newMaintenance.scheduledDate}
                            onChange={(e) => setNewMaintenance(prev => ({ ...prev, scheduledDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                          <input
                            type="number"
                            value={newMaintenance.estimatedDuration}
                            onChange={(e) => setNewMaintenance(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                            max="24"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setMaintenanceMode(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Schedule
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-4xl mb-4">🏪</div>
                <p className="text-gray-500">Select a kiosk to view details and manage</p>
              </div>
            )}
          </div>
        </div>

        {/* Data Source Indicator */}
        {useMockData && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <div>
                <p className="text-yellow-800 font-medium">Development Mode</p>
                <p className="text-yellow-700 text-sm">
                  Using mock kiosk data. Backend API is unavailable. 
                  <button 
                    onClick={() => setUseMockData(false)}
                    className="ml-1 text-yellow-800 underline hover:no-underline"
                  >
                    Try connecting to live data
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KioskManagement;