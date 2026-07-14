import axios from 'axios';
import CryptoJS from 'crypto-js';

class BlockchainService {
  constructor() {
    this.blockcypherToken = process.env.BLOCKCYPHER_API_KEY || 'demo-key';
    this.infuraKey = process.env.INFURA_API_KEY || 'demo-key';
    
    // Don't initialize ethers in constructor - lazy load
    this._ethProvider = null;
    
    // USDT Contract addresses
    this.USDT_CONTRACTS = {
      erc20: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      trc20: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
    };
  }

  // Lazy load ethers
  async getEthProvider() {
    if (!this._ethProvider) {
      const { ethers } = await import('ethers');
      this._ethProvider = new ethers.InfuraProvider('mainnet', this.infuraKey);
    }
    return this._ethProvider;
  }

  // ===== PRICE FEEDS =====
  async getCurrentPrices(coins = ['BTC', 'ETH', 'USDT']) {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: {
            ids: 'bitcoin,ethereum,tether',
            vs_currencies: 'usd,ugx,kes,tzs'
          },
          timeout: 5000
        }
      );

      const usdToUgx = 3800;
      const usdToKes = 130;
      const usdToTzs = 2500;

      return {
        BTC: {
          USD: response.data.bitcoin?.usd || 65000,
          UGX: response.data.bitcoin?.ugx || (response.data.bitcoin?.usd * usdToUgx),
          KES: response.data.bitcoin?.kes || (response.data.bitcoin?.usd * usdToKes),
          TZS: response.data.bitcoin?.tzs || (response.data.bitcoin?.usd * usdToTzs)
        },
        ETH: {
          USD: response.data.ethereum?.usd || 3500,
          UGX: response.data.ethereum?.ugx || (response.data.ethereum?.usd * usdToUgx),
          KES: response.data.ethereum?.kes || (response.data.ethereum?.usd * usdToKes),
          TZS: response.data.ethereum?.tzs || (response.data.ethereum?.usd * usdToTzs)
        },
        USDT: {
          USD: 1,
          UGX: response.data.tether?.ugx || usdToUgx,
          KES: response.data.tether?.kes || usdToKes,
          TZS: response.data.tether?.tzs || usdToTzs
        }
      };
    } catch (error) {
      console.error('Price fetch error:', error);
      return {
        BTC: { USD: 65000, UGX: 247000000, KES: 8450000, TZS: 162500000 },
        ETH: { USD: 3500, UGX: 13300000, KES: 455000, TZS: 8750000 },
        USDT: { USD: 1, UGX: 3800, KES: 130, TZS: 2500 }
      };
    }
  }

  // ===== WALLET GENERATION - SIMPLIFIED =====
  async generateWallet(coin) {
    coin = coin.toUpperCase();
    
    // For serverless, return simulated wallets
    const address = '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const privateKey = '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const publicKey = '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    return {
      address,
      privateKey,
      publicKey,
      coin,
      simulated: true
    };
  }

  // ===== ENCRYPTION =====
  encryptPrivateKey(privateKey) {
    const key = process.env.CRYPTO_ENCRYPTION_KEY || 'default-encryption-key-32-chars-long!';
    return CryptoJS.AES.encrypt(privateKey, key).toString();
  }

  decryptPrivateKey(encryptedKey) {
    const key = process.env.CRYPTO_ENCRYPTION_KEY || 'default-encryption-key-32-chars-long!';
    const bytes = CryptoJS.AES.decrypt(encryptedKey, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // ===== ADDRESS VALIDATION =====
  async validateAddress(address, coin) {
    coin = coin.toLowerCase();
    
    const validators = {
      btc: (addr) => /^[13][a-km-zA-HJ-NP-Z0-9]{25,34}$/.test(addr) || /^bc1[a-z0-9]{39,59}$/.test(addr),
      eth: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr),
      trx: (addr) => /^T[a-zA-Z0-9]{33}$/.test(addr)
    };
    
    const isValid = validators[coin] ? validators[coin](address) : false;
    
    return {
      valid: isValid,
      coin,
      address,
      network: coin === 'btc' ? 'bitcoin' : coin === 'eth' ? 'ethereum' : 'tron'
    };
  }

  // ===== SIMULATED BALANCE CHECKS =====
  async getBitcoinBalance(address) {
    return { address, balance: 0, unconfirmed: 0, total: 0, simulated: true };
  }

  async getEthereumBalance(address) {
    return { address, balance: '0', simulated: true };
  }

  async getUSDTBalance(address, network = 'trc20') {
    return { address, balance: '0', network, simulated: true };
  }

  // ===== NETWORK FEES =====
  async getNetworkFees(coin) {
    return {
      fee: '0.001',
      unit: 'network',
      simulated: true
    };
  }
}

const blockchainService = new BlockchainService();
export default blockchainService;