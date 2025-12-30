// src/services/mobileMoneyService.js
import { apiCall } from './apiService';

const MOBILE_MONEY_BASE_URL = 'http://localhost:8082/api/mobile-money';

export const mobileMoneyService = {
  // Initiate mobile money payment
  initiatePayment: async (paymentData) => {
    return apiCall('/mobile-money/initiate', {
      method: 'POST',
      body: paymentData,
    });
  },

  // Check payment status
  checkPaymentStatus: async (transactionId) => {
    return apiCall(`/mobile-money/status/${transactionId}`);
  },

  // Process payment callback from mobile money provider
  processCallback: async (callbackData) => {
    return apiCall('/mobile-money/callback', {
      method: 'POST',
      body: callbackData,
    });
  },

  // Get supported mobile money networks
  getNetworks: async () => {
    return apiCall('/mobile-money/networks');
  },

  // Validate mobile money number
  validateNumber: async (phoneNumber, network) => {
    return apiCall('/mobile-money/validate', {
      method: 'POST',
      body: { phoneNumber, network },
    });
  }
};

export default mobileMoneyService;