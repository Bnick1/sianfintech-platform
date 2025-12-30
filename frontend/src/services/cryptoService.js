import { apiCall } from './apiService.js';

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

export const cryptoAPI = {
  // Wallet Management
  createWallet: (userId, coin) => apiCall('/crypto/wallets', {
    method: 'POST',
    body: JSON.stringify({ userId, coin })
  }),

  getWallets: (userId) => apiCall(`/crypto/users/${userId}/wallets`),

  getWalletBalance: (walletId) => apiCall(`/crypto/wallets/${walletId}/balance`),

  // Transactions
  sendCrypto: (transferData) => apiCall('/crypto/transfers', {
    method: 'POST',
    body: JSON.stringify(transferData)
  }),

  getTransactions: (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/crypto/users/${userId}/transactions?${queryString}`);
  },

  getTransaction: (txId) => apiCall(`/crypto/transactions/${txId}`),

  // Market Data
  getPrices: (coins = ['BTC', 'ETH']) => {
    const coinParam = coins.join(',');
    return apiCall(`/crypto/prices?coins=${coinParam}`);
  },

  getExchangeRates: () => apiCall('/crypto/prices'),

  // Address Management
  generateAddress: (walletId) => apiCall(`/crypto/wallets/${walletId}/address`, {
    method: 'POST'
  }),

  validateAddress: (address, coin) => 
    apiCall(`/crypto/validate-address?address=${address}&coin=${coin}`),

  // Network Fees
  getNetworkFees: (coin) => apiCall(`/crypto/fees/${coin}`),
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