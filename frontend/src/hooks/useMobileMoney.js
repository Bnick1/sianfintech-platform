// src/hooks/useMobileMoney.js
import { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/apiService';

export const useMobileMoney = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const initiatePayment = async (paymentData) => {
    setLoading(true);
    setPaymentStatus(null);

    try {
      let response;
      if (paymentData.provider === 'mtn') {
        response = await paymentsAPI.mobileMoneyMTN(paymentData);
      } else {
        response = await paymentsAPI.mobileMoneyAirtel(paymentData);
      }

      setPaymentStatus({
        status: 'pending',
        transactionId: response.transactionId,
        providerReference: response.providerReference,
        message: 'Payment initiated successfully'
      });

      return response;
    } catch (error) {
      setPaymentStatus({
        status: 'failed',
        message: error.message,
        error: error.response?.data
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (transactionId) => {
    try {
      const status = await paymentsAPI.getStatus(transactionId);
      setPaymentStatus(prev => ({ ...prev, ...status }));
      return status;
    } catch (error) {
      throw error;
    }
  };

  const verifyPayment = async (transactionId) => {
    try {
      const verification = await paymentsAPI.verify(transactionId);
      setPaymentStatus(prev => ({ ...prev, ...verification }));
      return verification;
    } catch (error) {
      throw error;
    }
  };

  return {
    paymentStatus,
    loading,
    initiatePayment,
    checkPaymentStatus,
    verifyPayment,
    setPaymentStatus
  };
};