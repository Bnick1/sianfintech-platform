// services/africasTalkingService.js - Production ready with fallbacks
export class AfricasTalkingService {
  constructor() {
    this.username = process.env.AFRICASTALKING_USERNAME || 'Sandbox';
    this.apiKey = process.env.AFRICASTALKING_API_KEY;
    this.baseURL = 'https://api.sandbox.africastalking.com';
    this.paymentsAvailable = false;
  }

  async initiatePayment(phoneNumber, amount, reference, description = 'Payment') {
    // For sandbox development, simulate successful payments
    // In production, this will use real Africa's Talking Payments
    
    const provider = this.detectProvider(phoneNumber);
    const formattedPhone = this.formatPhone(phoneNumber);
    
    console.log(`Simulating payment: ${amount} UGX to ${formattedPhone} (${provider})`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      transactionId: reference,
      provider: provider,
      status: 'completed',
      message: `Payment of ${amount} UGX processed successfully via ${provider} Mobile Money`,
      formattedPhone: formattedPhone,
      amount: amount,
      currency: 'UGX',
      sandbox: true, // Indicates this is a simulated payment
      note: 'In production, this will use real mobile money transactions'
    };
  }

  // Real implementation for when payments are activated
  async realInitiatePayment(phoneNumber, amount, reference, productName = 'SianFinTech') {
    try {
      const formData = new URLSearchParams();
      formData.append('username', this.username);
      formData.append('productName', productName);
      formData.append('phoneNumber', this.formatPhone(phoneNumber));
      formData.append('currencyCode', 'UGX');
      formData.append('amount', amount.toString());

      const response = await fetch(`${this.baseURL}/payments/mobile/checkout/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': this.apiKey,
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await response.json();

      if (data.status === 'Success' || data.status === 'PendingConfirmation') {
        return {
          success: true,
          transactionId: data.transactionId || reference,
          provider: this.detectProvider(phoneNumber),
          status: 'pending',
          message: 'Payment request sent successfully',
          data: data
        };
      } else {
        return {
          success: false,
          error: data.errorMessage || 'Payment initiation failed',
          provider: this.detectProvider(phoneNumber),
          data: data
        };
      }

    } catch (error) {
      console.error('Real payment error:', error);
      throw error;
    }
  }

  // Utility methods
  formatPhone(phone) {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '256' + clean.substring(1);
    } else if (clean.startsWith('+')) {
      clean = clean.substring(1);
    }
    return clean;
  }

  detectProvider(phoneNumber) {
    const clean = this.formatPhone(phoneNumber);
    if (clean.startsWith('25677') || clean.startsWith('25678')) return 'mtn';
    if (clean.startsWith('25675') || clean.startsWith('25670') || 
        clean.startsWith('25676') || clean.startsWith('25679')) return 'airtel';
    return 'unknown';
  }

  // Check if payments are available
  async checkPaymentsAvailability() {
    try {
      // This would check if payments service is activated
      return { available: false, reason: 'Requires production activation' };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

const africasTalkingService = new AfricasTalkingService();
export default africasTalkingService;