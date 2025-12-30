import axios from 'axios';

const CRYPTO_CONFIG = {
  SUPPORTED_COINS: {
    BTC: { name: 'Bitcoin', decimals: 8, network: 'bitcoin' },
    ETH: { name: 'Ethereum', decimals: 18, network: 'ethereum' },
    USDT: { name: 'Tether', decimals: 6, network: 'ethereum' },
    BNB: { name: 'Binance Coin', decimals: 18, network: 'binance' },
    ADA: { name: 'Cardano', decimals: 6, network: 'cardano' },
    XRP: { name: 'Ripple', decimals: 6, network: 'ripple' },
  },
  NETWORKS: {
    bitcoin: { explorer: 'https://blockstream.info/tx/' },
    ethereum: { explorer: 'https://etherscan.io/tx/' },
    binance: { explorer: 'https://bscscan.com/tx/' },
    cardano: { explorer: 'https://cardanoscan.io/transaction/' },
    ripple: { explorer: 'https://xrpscan.com/tx/' },
  }
};

// Simple API call function for crypto service
const cryptoApiCall = async (endpoint, options = {}) => {
  try {
    const baseURL = 'http://localhost:8082/api';
    const url = `${baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Crypto API Call failed:', error);
    throw error;
  }
};

export const cryptoAPI = {
  // Wallet Management
  createWallet: (userId, coin) => cryptoApiCall('/crypto/wallets', {
    method: 'POST',
    body: JSON.stringify({ userId, coin })
  }),

  getWallets: (userId) => cryptoApiCall(`/crypto/users/${userId}/wallets`),

  getWalletBalance: (walletId) => cryptoApiCall(`/crypto/wallets/${walletId}/balance`),

  // Transactions
  sendCrypto: (transferData) => cryptoApiCall('/crypto/transfers', {
    method: 'POST',
    body: JSON.stringify(transferData)
  }),

  getTransactions: (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return cryptoApiCall(`/crypto/users/${userId}/transactions?${queryString}`);
  },

  getTransaction: (txId) => cryptoApiCall(`/crypto/transactions/${txId}`),

  // Market Data
  getPrices: (coins = ['BTC', 'ETH']) => {
    const coinParam = coins.join(',');
    return cryptoApiCall(`/crypto/prices?coins=${coinParam}`);
  },

  getExchangeRates: () => cryptoApiCall('/crypto/prices'),

  // Address Management
  generateAddress: (walletId) => cryptoApiCall(`/crypto/wallets/${walletId}/address`, {
    method: 'POST'
  }),

  validateAddress: (address, coin) => 
    cryptoApiCall(`/crypto/validate-address?address=${address}&coin=${coin}`),

  // Network Fees
  getNetworkFees: (coin) => cryptoApiCall(`/crypto/fees/${coin}`),
};

export const cryptoUtils = {
  formatCryptoAmount(amount, coin) {
    const decimals = CRYPTO_CONFIG.SUPPORTED_COINS[coin]?.decimals || 8;
    return parseFloat(amount).toFixed(decimals);
  },

  convertToFiat(cryptoAmount, cryptoPrice, currency = 'USD') {
    const amount = parseFloat(cryptoAmount) * parseFloat(cryptoPrice);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  calculateNetworkFee(gasPrice, gasLimit, coin) {
    if (coin === 'BTC') {
      return (gasPrice * gasLimit) / 1e8; // Convert satoshis to BTC
    } else if (['ETH', 'USDT'].includes(coin)) {
      return (gasPrice * gasLimit) / 1e18; // Convert wei to ETH
    }
    return gasPrice;
  },

  getExplorerUrl(txHash, coin) {
    const network = CRYPTO_CONFIG.SUPPORTED_COINS[coin]?.network;
    const explorer = CRYPTO_CONFIG.NETWORKS[network]?.explorer;
    return explorer ? `${explorer}${txHash}` : null;
  }
};

export default cryptoAPI;