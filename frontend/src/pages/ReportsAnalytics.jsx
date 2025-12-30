// src/pages/ReportsAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { reportsAPI, dashboardAPI, loansAPI, investmentsAPI, kiosksAPI } from '../services/apiService';
import { generateMockDashboardData, generateMockKiosks } from '../services/mockDataService';

const ReportsAnalytics = () => {
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('30days');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  const reportTypes = [
    { id: 'financial', name: 'Financial Performance', icon: '💰' },
    { id: 'clients', name: 'Client Analytics', icon: '👥' },
    { id: 'loans', name: 'Loan Portfolio', icon: '📊' },
    { id: 'investments', name: 'Investment Performance', icon: '📈' },
    { id: 'kiosks', name: 'Kiosk Operations', icon: '🏪' },
    { id: 'risk', name: 'Risk Assessment', icon: '🛡️' }
  ];

  const dateRanges = [
    { id: '7days', name: 'Last 7 Days' },
    { id: '30days', name: 'Last 30 Days' },
    { id: '90days', name: 'Last 90 Days' },
    { id: 'ytd', name: 'Year to Date' },
    { id: 'custom', name: 'Custom Range' }
  ];

  useEffect(() => {
    loadReportData();
  }, [reportType, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      let data;

      if (useMockData) {
        data = await generateMockReportData(reportType, dateRange);
      } else {
        try {
          data = await fetchReportData(reportType, dateRange);
        } catch (error) {
          console.warn('Backend unavailable, using mock data:', error);
          setUseMockData(true);
          data = await generateMockReportData(reportType, dateRange);
        }
      }

      setReportData(data);
    } catch (error) {
      console.error('Failed to load report data:', error);
      const mockData = await generateMockReportData(reportType, dateRange);
      setReportData(mockData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (type, range) => {
    switch (type) {
      case 'financial':
        return await dashboardAPI.getStats();
      case 'clients':
        return await reportsAPI.generate({ type: 'clients', range });
      case 'loans':
        return await loansAPI.getLoans();
      case 'investments':
        return await investmentsAPI.getInvestments();
      case 'kiosks':
        return await kiosksAPI.getKiosks();
      case 'risk':
        return await reportsAPI.generate({ type: 'risk', range });
      default:
        return await dashboardAPI.getStats();
    }
  };

  const generateMockReportData = async (type, range) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const baseData = generateMockDashboardData();
    const mockKiosks = generateMockKiosks();

    switch (type) {
      case 'financial':
        return {
          totalRevenue: baseData.investments * 0.15,
          totalExpenses: baseData.activeLoans * 0.08,
          netProfit: baseData.investments * 0.15 - baseData.activeLoans * 0.08,
          growthRate: 18.5,
          keyMetrics: {
            revenueGrowth: '22.3%',
            expenseRatio: '34.2%',
            profitMargin: '65.8%',
            roi: '28.7%'
          }
        };

      case 'clients':
        return {
          totalClients: baseData.totalClients,
          newClients: Math.floor(baseData.totalClients * 0.12),
          activeClients: Math.floor(baseData.totalClients * 0.85),
          clientGrowth: '12.8%',
          demographics: {
            urban: 65,
            rural: 35,
            male: 58,
            female: 42
          },
          topLocations: [
            { location: 'Kampala', clients: 450 },
            { location: 'Gulu', clients: 230 },
            { location: 'Mbale', clients: 180 },
            { location: 'Mbarara', clients: 165 },
            { location: 'Lira', clients: 120 }
          ]
        };

      case 'loans':
        return {
          totalPortfolio: baseData.activeLoans,
          activeLoans: 89,
          approvedLoans: 124,
          defaultRate: '2.3%',
          averageLoanSize: 750000,
          loanDistribution: [
            { range: '0-500K', count: 45 },
            { range: '500K-1M', count: 32 },
            { range: '1M-2M', count: 18 },
            { range: '2M+', count: 9 }
          ],
          performance: {
            repaymentRate: '97.7%',
            averageInterest: '18.5%',
            riskDistribution: {
              low: 45,
              medium: 38,
              high: 17
            }
          }
        };

      case 'investments':
        return {
          totalInvestments: baseData.investments,
          activeInvestments: 67,
          averageReturn: '15.8%',
          topPerformers: [
            { type: 'Government Bonds', return: '14.2%' },
            { type: 'Fixed Deposits', return: '12.8%' },
            { type: 'Stocks', return: '22.5%' },
            { type: 'Real Estate', return: '18.3%' }
          ],
          allocation: {
            fixed_deposit: 35,
            government_bonds: 25,
            stocks: 20,
            real_estate: 15,
            mutual_funds: 5
          }
        };

      case 'kiosks':
        const totalTransactions = mockKiosks.reduce((sum, k) => sum + k.transactionsToday, 0);
        const totalCash = mockKiosks.reduce((sum, k) => sum + k.cashBalance, 0);
        
        return {
          totalKiosks: mockKiosks.length,
          activeKiosks: mockKiosks.filter(k => k.connectivityStatus).length,
          totalTransactions,
          averageTransactions: Math.round(totalTransactions / mockKiosks.length),
          cashEfficiency: Math.round((totalCash / totalTransactions) * 100) / 100,
          performance: {
            uptime: '96.7%',
            utilization: '78.3%',
            satisfaction: '4.2/5.0'
          },
          topPerforming: mockKiosks.slice(0, 3).map(k => ({
            name: k.name,
            transactions: k.transactionsToday,
            performance: Math.min(k.transactionsToday / 50 * 100, 100)
          }))
        };

      case 'risk':
        return {
          overallRisk: 'Medium',
          creditRisk: 'Low',
          marketRisk: 'Medium',
          operationalRisk: 'Low',
          keyIndicators: {
            defaultRate: '2.3%',
            portfolioHealth: '87.5%',
            capitalAdequacy: '94.2%',
            liquidityRatio: '78.9%'
          },
          alerts: [
            { type: 'warning', message: 'Monitor high-risk loan portfolio segment' },
            { type: 'info', message: 'Diversification strategy effective' },
            { type: 'success', message: 'Capital reserves above target' }
          ]
        };

      default:
        return baseData;
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const reportPayload = {
        type: reportType,
        dateRange: dateRange,
        format: 'pdf',
        includeCharts: true
      };

      if (!useMockData) {
        const report = await reportsAPI.generate(reportPayload);
        alert(`Report generated successfully! Download ready.`);
      } else {
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('Mock report generated successfully! (Backend unavailable)');
      }
    } catch (error) {
      alert('Failed to generate report: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportData = (format) => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sianfintech-${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading report data...</p>
          </div>
        </div>
      );
    }

    if (!reportData) return null;

    switch (reportType) {
      case 'financial':
        return <FinancialReport data={reportData} />;
      case 'clients':
        return <ClientReport data={reportData} />;
      case 'loans':
        return <LoanReport data={reportData} />;
      case 'investments':
        return <InvestmentReport data={reportData} />;
      case 'kiosks':
        return <KioskReport data={reportData} />;
      case 'risk':
        return <RiskReport data={reportData} />;
      default:
        return <FinancialReport data={reportData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">
              {useMockData ? 'Development Mode (Mock Data)' : 'Live Analytics Dashboard'}
            </p>
          </div>
          {useMockData && (
            <button 
              onClick={() => setUseMockData(false)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
            >
              Try Live Data
            </button>
          )}
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
              <div className="grid grid-cols-2 gap-2">
                {reportTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      reportType === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
              <div className="space-y-2">
                {dateRanges.map(range => (
                  <button
                    key={range.id}
                    onClick={() => setDateRange(range.id)}
                    className={`w-full px-4 py-2 rounded-lg border text-left transition-colors ${
                      dateRange === range.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {range.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Actions</label>
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Report...
                  </>
                ) : (
                  '📄 Generate PDF Report'
                )}
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExportData('json')}
                  className="bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  📊 Export JSON
                </button>
                <button
                  onClick={() => handleExportData('csv')}
                  className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  📋 Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {renderReportContent()}
        </div>

        {/* Data Source Indicator */}
        {useMockData && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <div>
                <p className="text-yellow-800 font-medium">Development Mode</p>
                <p className="text-yellow-700 text-sm">
                  Using mock report data. Backend API is unavailable. 
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

// Report Components
const FinancialReport = ({ data }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Performance Report</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-600">Total Revenue</p>
        <p className="text-2xl font-bold text-gray-900">UGX {data.totalRevenue?.toLocaleString()}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-sm text-red-600">Total Expenses</p>
        <p className="text-2xl font-bold text-gray-900">UGX {data.totalExpenses?.toLocaleString()}</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-600">Net Profit</p>
        <p className="text-2xl font-bold text-gray-900">UGX {data.netProfit?.toLocaleString()}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-600">Growth Rate</p>
        <p className="text-2xl font-bold text-gray-900">{data.growthRate}%</p>
      </div>
    </div>
    
    {data.keyMetrics && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.keyMetrics).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const ClientReport = ({ data }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Analytics Report</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-600">Total Clients</p>
        <p className="text-2xl font-bold text-gray-900">{data.totalClients?.toLocaleString()}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-600">New Clients</p>
        <p className="text-2xl font-bold text-gray-900">{data.newClients?.toLocaleString()}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-600">Growth Rate</p>
        <p className="text-2xl font-bold text-gray-900">{data.clientGrowth}</p>
      </div>
    </div>

    {data.demographics && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demographics</h3>
          <div className="space-y-3">
            {Object.entries(data.demographics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{key}:</span>
                <span className="font-semibold">{value}%</span>
              </div>
            ))}
          </div>
        </div>

        {data.topLocations && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
            <div className="space-y-2">
              {data.topLocations.map((location, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{location.location}</span>
                  <span className="font-semibold">{location.clients} clients</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

const LoanReport = ({ data }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Loan Portfolio Report</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-600">Total Portfolio</p>
        <p className="text-2xl font-bold text-gray-900">UGX {data.totalPortfolio?.toLocaleString()}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-600">Active Loans</p>
        <p className="text-2xl font-bold text-gray-900">{data.activeLoans}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-sm text-red-600">Default Rate</p>
        <p className="text-2xl font-bold text-gray-900">{data.defaultRate}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-600">Avg Loan Size</p>
        <p className="text-2xl font-bold text-gray-900">UGX {data.averageLoanSize?.toLocaleString()}</p>
      </div>
    </div>

    {data.performance && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data.performance).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const InvestmentReport = ({ data }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Performance Report</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-600">Total Investments</p>
        <p className="text-2xl font-bold text-gray-900">UGX {data.totalInvestments?.toLocaleString()}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-600">Active Investments</p>
        <p className="text-2xl font-bold text-gray-900">{data.activeInvestments}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-600">Average Return</p>
        <p className="text-2xl font-bold text-gray-900">{data.averageReturn}</p>
      </div>
    </div>

    {data.topPerformers && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Investments</h3>
          <div className="space-y-3">
            {data.topPerformers.map((investment, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">{investment.type}</span>
                <span className="font-semibold text-green-600">{investment.return}</span>
              </div>
            ))}
          </div>
        </div>

        {data.allocation && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
            <div className="space-y-2">
              {Object.entries(data.allocation).map(([asset, percentage]) => (
                <div key={asset} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{asset.replace('_', ' ')}</span>
                  <span className="font-semibold">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

const KioskReport = ({ data }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Kiosk Operations Report</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-600">Total Kiosks</p>
        <p className="text-2xl font-bold text-gray-900">{data.totalKiosks}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-600">Active Kiosks</p>
        <p className="text-2xl font-bold text-gray-900">{data.activeKiosks}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-600">Total Transactions</p>
        <p className="text-2xl font-bold text-gray-900">{data.totalTransactions?.toLocaleString()}</p>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg">
        <p className="text-sm text-orange-600">Avg Transactions</p>
        <p className="text-2xl font-bold text-gray-900">{data.averageTransactions}</p>
      </div>
    </div>

    {data.performance && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            {Object.entries(data.performance).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{key}:</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {data.topPerforming && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Kiosks</h3>
            <div className="space-y-2">
              {data.topPerforming.map((kiosk, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{kiosk.name}</span>
                  <div className="text-right">
                    <span className="font-semibold">{kiosk.transactions} tx</span>
                    <span className="text-sm text-gray-500 ml-2">({kiosk.performance.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

const RiskReport = ({ data }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Assessment Report</h2>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-600">Overall Risk</p>
        <p className="text-2xl font-bold text-gray-900">{data.overallRisk}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-600">Credit Risk</p>
        <p className="text-2xl font-bold text-gray-900">{data.creditRisk}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-600">Market Risk</p>
        <p className="text-2xl font-bold text-gray-900">{data.marketRisk}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-600">Operational Risk</p>
        <p className="text-2xl font-bold text-gray-900">{data.operationalRisk}</p>
      </div>
    </div>

    {data.keyIndicators && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Risk Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.keyIndicators).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.alerts && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Alerts</h3>
        <div className="space-y-2">
          {data.alerts.map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              alert.type === 'success' ? 'bg-green-50 border-green-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default ReportsAnalytics;