// backend/services/blockcypherService.js
const axios = require('axios');

class BlockCypherService {
  constructor() {
    this.apiKey = process.env.BLOCKCYPHER_API_KEY || '49a07cdf56fe42e084594b348919aa30';
    this.baseURLs = {
      btc: {
        main: 'https://api.blockcypher.com/v1/btc/main',
        test: 'https://api.blockcypher.com/v1/btc/test3'
      },
      eth: {
        main: 'https://api.blockcypher.com/v1/eth/main',
        test: 'https://api.blockcypher.com/v1/eth/test'
      }
    };
    this.network = process.env.NODE_ENV === 'production' ? 'main' : 'test';
  }

  async makeRequest(endpoint, coin = 'btc', method = 'GET', data = null) {
    try {
      const url = `${this.baseURLs[coin][this.network]}${endpoint}?token=${this.apiKey}`;
      const config = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        data: data ? JSON.stringify(data) : null,
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('BlockCypher API Error:', error.response?.data || error.message);
      throw new Error(`BlockCypher API failed: ${error.response?.data?.error || error.message}`);
    }
  }

  // Generate new wallet
  async generateWallet(coin = 'btc') {
    try {
      const wallet = await this.makeRequest('/addrs', coin, 'POST');
      return {
        address: wallet.address,
        private: wallet.private,
        public: wallet.public,
        wif: wallet.wif
      };
    } catch (error) {
      throw new Error(`Failed to generate wallet: ${error.message}`);
    }
  }

  // Get wallet balance
  async getBalance(address, coin = 'btc') {
    try {
      const data = await this.makeRequest(`/addrs/${address}/balance`, coin);
      return {
        address: data.address,
        balance: data.balance,
        total_received: data.total_received,
        total_sent: data.total_sent,
        unconfirmed_balance: data.unconfirmed_balance,
        final_balance: data.final_balance
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  // Create transaction
  async createTransaction(fromAddress, toAddress, amount, privateKey, coin = 'btc') {
    try {
      const txData = {
        inputs: [{ addresses: [fromAddress] }],
        outputs: [{ addresses: [toAddress], value: amount }]
      };

      // Create transaction skeleton
      const txSkeleton = await this.makeRequest('/txs/new', coin, 'POST', txData);
      
      // Sign the transaction (simplified - in production use proper signing)
      const signedTx = await this.signTransaction(txSkeleton, privateKey, coin);
      
      // Send the transaction
      const finalTx = await this.makeRequest('/txs/send', coin, 'POST', signedTx);
      
      return {
        txHash: finalTx.tx.hash,
        fees: finalTx.tx.fees,
        received: finalTx.tx.received,
        confirmations: 0
      };
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  // Sign transaction (simplified - use proper crypto libraries in production)
  async signTransaction(txSkeleton, privateKey, coin) {
    // In a real implementation, use bitcoinjs-lib or ethers.js for proper signing
    // This is a simplified version for demonstration
    return {
      ...txSkeleton,
      signatures: ['simulated_signature_for_demo'],
      pubkeys: ['simulated_pubkey_for_demo']
    };
  }

  // Get transaction details
  async getTransaction(txHash, coin = 'btc') {
    try {
      return await this.makeRequest(`/txs/${txHash}`, coin);
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  // Generate deposit address
  async generateDepositAddress(walletId, coin = 'btc') {
    try {
      const newAddress = await this.makeRequest('/addrs', coin, 'POST');
      return {
        address: newAddress.address,
        walletId,
        coin,
        created_at: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to generate deposit address: ${error.message}`);
    }
  }

  // Get current price
  async getCurrentPrice(coin = 'btc') {
    try {
      // BlockCypher doesn't have price API, so we'll use a fallback
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`);
      return response.data.bitcoin.usd;
    } catch (error) {
      // Fallback price
      return 45000; // Default BTC price in USD
    }
  }
}

module.exports = new BlockCypherService();