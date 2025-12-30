// services/mobileMoneyService.js
export class MobileMoneyService {
  async initiateMTNPayment(phone, amount, reference) {
    // MTN Mobile Money API integration
    const response = await axios.post('https://api.mtn.com/v1/payments', {
      subscriberId: phone,
      amount: amount,
      transactionRef: reference
    });
    return response.data;
  }
  
  async initiateAirtelPayment(phone, amount, reference) {
    // Airtel Money API integration
    const response = await axios.post('https://api.airtel.com/payments', {
      msisdn: phone,
      amount: amount,
      reference: reference
    });
    return response.data;
  }
}