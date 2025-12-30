// src/services/mockDataService.js
// Mock data generator for development
export const generateMockDashboardData = () => {
  const baseClients = 1247;
  const baseLoans = 856000000;
  const baseInvestments = 1200000000;
  const baseKiosks = 48;

  // Add some random variation to simulate real data
  const randomVariation = (base, maxVariation) => 
    base + Math.floor(Math.random() * maxVariation);

  return {
    totalClients: randomVariation(baseClients, 15),
    activeLoans: randomVariation(baseLoans, 5000000),
    investments: randomVariation(baseInvestments, 10000000),
    activeKiosks: randomVariation(baseKiosks, 3),
    clientGrowth: 12.5 + (Math.random() * 2 - 1),
    loanApprovalRate: 78.3 + (Math.random() * 3 - 1.5),
    investmentReturns: 15.2 + (Math.random() * 2 - 1),
    kioskUptime: 96.7 + (Math.random() * 1 - 0.5),
  };
};

export const generateMockRecentActivity = () => {
  const activities = [
    {
      message: "New client registered - Jane Doe",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      type: "success",
      userId: "USR" + Date.now().toString().slice(-6)
    },
    {
      message: "Loan application approved - REF-00123",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      type: "success",
      loanId: "LN" + Date.now().toString().slice(-6)
    },
    {
      message: "Kiosk #47 needs maintenance",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      type: "warning",
      kioskId: "K047"
    },
    {
      message: "Investment portfolio updated",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      type: "info",
      amount: 2500000
    },
    {
      message: "AI assessment completed for client #8921",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      type: "info",
      creditScore: 720
    },
    {
      message: "New kiosk activated in Gulu Market",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: "success",
      location: "Gulu"
    }
  ];

  return activities;
};

export const generateMockSystemStatus = () => ({
  api: { 
    status: 'operational', 
    performance: 95 + Math.floor(Math.random() * 5),
    responseTime: '45ms'
  },
  database: { 
    status: 'healthy', 
    performance: 88 + Math.floor(Math.random() * 10),
    connections: 24
  },
  ai: { 
    status: 'online', 
    performance: 76 + Math.floor(Math.random() * 20),
    queue: 3
  },
  payments: { 
    status: 'operational', 
    performance: 92 + Math.floor(Math.random() * 8),
    lastSync: new Date().toISOString()
  }
});

export const generateMockKiosks = () => [
  {
    id: 1,
    name: 'Kampala Central',
    location: 'Kampala CBD',
    transactionsToday: 42 + Math.floor(Math.random() * 10),
    cashBalance: 750000 + Math.floor(Math.random() * 100000),
    connectivityStatus: true,
    lastMaintenance: '2024-01-10',
    errorLogs: [],
    status: 'active'
  },
  {
    id: 2,
    name: 'Gulu Market',
    location: 'Gulu City',
    transactionsToday: 28 + Math.floor(Math.random() * 8),
    cashBalance: 450000 + Math.floor(Math.random() * 80000),
    connectivityStatus: true,
    lastMaintenance: '2024-01-05',
    errorLogs: ['Printer jam', 'Network timeout'],
    status: 'active'
  },
  {
    id: 3,
    name: 'Mbale Plaza',
    location: 'Mbale Town',
    transactionsToday: 15 + Math.floor(Math.random() * 5),
    cashBalance: 85000 + Math.floor(Math.random() * 20000),
    connectivityStatus: false,
    lastMaintenance: '2023-12-20',
    errorLogs: ['Offline since 2 hours'],
    status: 'maintenance'
  },
  {
    id: 4,
    name: 'Mbarara Complex',
    location: 'Mbarara City',
    transactionsToday: 35 + Math.floor(Math.random() * 7),
    cashBalance: 620000 + Math.floor(Math.random() * 90000),
    connectivityStatus: true,
    lastMaintenance: '2024-01-08',
    errorLogs: [],
    status: 'active'
  }
];