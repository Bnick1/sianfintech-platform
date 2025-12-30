// src/utils/kioskMonitoring.js
export const monitorKioskPerformance = (kioskData) => {
  const {
    transactionsToday = 0,
    cashBalance = 0,
    connectivityStatus = true,
    lastMaintenance,
    errorLogs = [],
    status = 'active'
  } = kioskData;

  const performanceScore = calculatePerformanceScore(transactionsToday, errorLogs, cashBalance);
  const healthStatus = assessHealthStatus(cashBalance, connectivityStatus, lastMaintenance, status);
  const alerts = generateAlerts(kioskData);

  return {
    performanceScore,
    healthStatus,
    alerts,
    recommendations: generateRecommendations(performanceScore, healthStatus, kioskData),
    lastUpdated: new Date().toISOString()
  };
};

const calculatePerformanceScore = (transactions, errors, cashBalance) => {
  // Base score from transactions (max 50 transactions = 100%)
  const transactionScore = Math.min(transactions / 50 * 100, 100);
  
  // Cash balance score (optimal: 500,000 - 1,000,000 UGX)
  let cashScore = 100;
  if (cashBalance < 100000) cashScore = 30;
  else if (cashBalance < 300000) cashScore = 60;
  else if (cashBalance < 500000) cashScore = 80;
  else if (cashBalance > 2000000) cashScore = 90; // Too much cash can be risky
  
  // Error penalty
  const errorPenalty = errors.length * 8;
  
  // Weighted average
  const finalScore = (transactionScore * 0.6) + (cashScore * 0.4) - errorPenalty;
  
  return Math.max(0, Math.min(100, finalScore));
};

const assessHealthStatus = (cashBalance, connectivity, lastMaintenance, status) => {
  if (status === 'maintenance') return 'maintenance';
  if (!connectivity) return 'offline';
  
  const daysSinceMaintenance = lastMaintenance 
    ? (new Date() - new Date(lastMaintenance)) / (1000 * 60 * 60 * 24)
    : 999; // Never maintained

  if (cashBalance < 100000 || daysSinceMaintenance > 30) {
    return 'needs_attention';
  } else if (cashBalance < 300000 || daysSinceMaintenance > 14) {
    return 'warning';
  }
  return 'healthy';
};

const generateAlerts = (kioskData) => {
  const alerts = [];
  
  if (kioskData.cashBalance < 100000) {
    alerts.push({
      type: 'critical',
      message: 'Low cash balance - needs replenishment',
      priority: 'high'
    });
  }
  
  if (!kioskData.connectivityStatus) {
    alerts.push({
      type: 'critical', 
      message: 'Kiosk offline - check connectivity',
      priority: 'high'
    });
  }
  
  const daysSinceMaintenance = kioskData.lastMaintenance 
    ? (new Date() - new Date(kioskData.lastMaintenance)) / (1000 * 60 * 60 * 24)
    : 999;
    
  if (daysSinceMaintenance > 21) {
    alerts.push({
      type: 'warning',
      message: 'Maintenance due soon',
      priority: 'medium'
    });
  }
  
  if (kioskData.errorLogs.length > 5) {
    alerts.push({
      type: 'warning',
      message: 'Multiple errors detected',
      priority: 'medium'
    });
  }

  // Cash overflow alert
  if (kioskData.cashBalance > 2000000) {
    alerts.push({
      type: 'warning',
      message: 'High cash balance - consider collection',
      priority: 'medium'
    });
  }
  
  return alerts;
};

const generateRecommendations = (performanceScore, healthStatus, kioskData) => {
  const recommendations = [];
  
  if (performanceScore < 60) {
    recommendations.push("Consider relocating kiosk to higher traffic area");
    recommendations.push("Run promotional campaigns to increase usage");
  }
  
  if (healthStatus === 'needs_attention') {
    recommendations.push("Schedule immediate maintenance visit");
    recommendations.push("Replenish cash inventory");
  }
  
  if (healthStatus === 'warning') {
    recommendations.push("Plan maintenance within next week");
    recommendations.push("Monitor cash levels closely");
  }
  
  if (performanceScore >= 80) {
    recommendations.push("Consider expanding services at this location");
    recommendations.push("High performance - eligible for feature upgrades");
  }

  if (kioskData.cashBalance > 2000000) {
    recommendations.push("Schedule cash collection to reduce risk");
  }

  if (kioskData.transactionsToday < 10) {
    recommendations.push("Low transaction volume - review location effectiveness");
  }
  
  return recommendations;
};

export const generateKioskReport = (kiosksData) => {
  const totalKiosks = kiosksData.length;
  const activeKiosks = kiosksData.filter(k => k.connectivityStatus).length;
  const healthyKiosks = kiosksData.filter(k => 
    monitorKioskPerformance(k).healthStatus === 'healthy'
  ).length;
  
  const totalTransactions = kiosksData.reduce((sum, k) => sum + k.transactionsToday, 0);
  const totalCash = kiosksData.reduce((sum, k) => sum + k.cashBalance, 0);
  const averagePerformance = kiosksData.reduce((sum, k) => 
    sum + monitorKioskPerformance(k).performanceScore, 0) / totalKiosks;

  // Generate alerts summary
  const allAlerts = kiosksData.flatMap(k => monitorKioskPerformance(k).alerts);
  const criticalAlerts = allAlerts.filter(alert => alert.priority === 'high');
  const warningAlerts = allAlerts.filter(alert => alert.priority === 'medium');

  return {
    summary: {
      totalKiosks,
      activeKiosks,
      offlineKiosks: totalKiosks - activeKiosks,
      healthyKiosks,
      needsAttentionKiosks: totalKiosks - healthyKiosks,
      totalTransactions,
      totalCash,
      averageCash: totalCash / totalKiosks
    },
    performance: {
      averagePerformance: Math.round(averagePerformance * 10) / 10,
      topPerformer: Math.max(...kiosksData.map(k => 
        monitorKioskPerformance(k).performanceScore)),
      lowestPerformer: Math.min(...kiosksData.map(k => 
        monitorKioskPerformance(k).performanceScore))
    },
    alerts: {
      total: allAlerts.length,
      critical: criticalAlerts.length,
      warnings: warningAlerts.length,
      list: allAlerts.slice(0, 10) // Top 10 alerts
    },
    recommendations: kiosksData.flatMap(k => 
      monitorKioskPerformance(k).recommendations
    ).slice(0, 5) // Top 5 recommendations
  };
};

// Utility function to format kiosk data for display
export const formatKioskData = (kiosk) => {
  const performance = monitorKioskPerformance(kiosk);
  
  return {
    ...kiosk,
    performance,
    displayStatus: getDisplayStatus(kiosk, performance),
    needsAttention: performance.healthStatus === 'needs_attention',
    isHealthy: performance.healthStatus === 'healthy'
  };
};

const getDisplayStatus = (kiosk, performance) => {
  if (!kiosk.connectivityStatus) return 'Offline';
  if (kiosk.status === 'maintenance') return 'Maintenance';
  if (performance.healthStatus === 'needs_attention') return 'Needs Attention';
  if (performance.healthStatus === 'warning') return 'Warning';
  return 'Healthy';
};