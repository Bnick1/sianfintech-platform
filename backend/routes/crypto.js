import express from 'express';
import cryptoService from '../services/cryptoService.js';
import CryptoJS from 'crypto-js';

const router = express.Router();

// Simple auth middleware for now
const simpleAuth = (req, res, next) => {
  req.user = { _id: 'dev-user-id' };
  req.body.userId = 'dev-user-id';
  next();
};

// Encryption helpers
const encryptPrivateKey = (privateKey) => {
  const encryptionKey = process.env.CRYPTO_ENCRYPTION_KEY || 'default-encryption-key-32-chars-long!';
  return CryptoJS.AES.encrypt(privateKey, encryptionKey).toString();
};

const decryptPrivateKey = (encryptedKey) => {
  const encryptionKey = process.env.CRYPTO_ENCRYPTION_KEY || 'default-encryption-key-32-chars-long!';
  const bytes = CryptoJS.AES.decrypt(encryptedKey, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// ===== PUBLIC ENDPOINTS =====

// Get crypto prices
router.get('/prices', async (req, res) => {
  try {
    const { coins = 'BTC,ETH' } = req.query;
    const prices = await cryptoService.getCurrentPrices(coins.split(','));
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get balance - FIXED ROUTE DEFINITION
router.get('/balance/:coin/:address', async (req, res) => {
  try {
    const { coin, address } = req.params;
    
    console.log(`Balance request: ${coin} - ${address}`);
    
    let balance;
    if (coin.toLowerCase() === 'btc') {
      balance = await cryptoService.getBitcoinBalance(address);
    } else if (coin.toLowerCase() === 'eth') {
      balance = await cryptoService.getEthereumBalance(address);
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported coin. Use BTC or ETH' });
    }
    
    res.json({ success: true, data: balance });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const prices = await cryptoService.getCurrentPrices();
    
    res.json({
      success: true,
      data: {
        blockcypher: true,
        infura: true,
        coingecko: true,
        timestamp: new Date().toISOString(),
        prices: prices
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Get network fees
router.get('/fees/:coin', async (req, res) => {
  try {
    const { coin } = req.params;
    const fees = await cryptoService.getNetworkFees(coin.toLowerCase());
    
    res.json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate address - FIXED: Use router.get, not app.get
router.get('/validate-address', async (req, res) => {
  try {
    const { address, coin } = req.query;
    
    if (!address || !coin) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing address or coin parameters' 
      });
    }

    const validation = await cryptoService.validateAddress(address, coin.toLowerCase());
    
    res.json({ success: true, data: validation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== PROTECTED ENDPOINTS (using simple auth for now) =====

// Get user wallets
router.get('/users/:userId/wallets', simpleAuth, async (req, res) => {
  try {
    const mockWallets = [
      {
        _id: 'dev-btc-wallet',
        user: req.params.userId,
        coin: 'BTC',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        balance: '0',
        currentBalance: 100000,
        confirmedBalance: 100000,
        unconfirmedBalance: 0
      },
      {
        _id: 'dev-eth-wallet', 
        user: req.params.userId,
        coin: 'ETH',
        address: '0x742d35Cc6634C0532925a3b8Df59C5C0D6D8C0b9',
        balance: '0',
        currentBalance: 1.5,
        confirmedBalance: 1.5,
        unconfirmedBalance: 0
      }
    ];

    res.json({ success: true, data: mockWallets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create wallet
router.post('/wallets', simpleAuth, async (req, res) => {
  try {
    const { userId, coin } = req.body;
    
    const supportedCoins = ['BTC', 'ETH'];
    if (!supportedCoins.includes(coin.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        error: `Unsupported coin. Supported: ${supportedCoins.join(', ')}` 
      });
    }

    const walletData = await cryptoService.generateWallet(coin.toUpperCase());
    
    const mockWallet = {
      _id: `dev-${coin.toLowerCase()}-wallet-${Date.now()}`,
      user: userId,
      coin: coin.toUpperCase(),
      address: walletData.address,
      balance: '0',
      currentBalance: 0
    };

    res.json({ 
      success: true, 
      data: mockWallet,
      message: `${coin.toUpperCase()} wallet created successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send cryptocurrency
router.post('/transfers', simpleAuth, async (req, res) => {
  try {
    const { fromWalletId, toAddress, amount, coin, description } = req.body;

    if (!fromWalletId || !toAddress || !amount || !coin) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const addressValidation = await cryptoService.validateAddress(toAddress, coin.toLowerCase());
    if (!addressValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid recipient address' 
      });
    }

    const mockTransaction = {
      _id: `dev-tx-${Date.now()}`,
      fromWallet: fromWalletId,
      toAddress,
      amount: parseFloat(amount),
      coin: coin.toUpperCase(),
      description,
      status: 'confirmed',
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      fees: '0.001',
      confirmations: 1,
      createdAt: new Date()
    };

    res.json({ 
      success: true, 
      data: mockTransaction,
      message: `Transfer of ${amount} ${coin} initiated successfully` 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction history
router.get('/users/:userId/transactions', simpleAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, coin } = req.query;
    
    const mockTransactions = [
      {
        _id: 'dev-tx-1',
        fromWallet: 'dev-btc-wallet',
        toAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        amount: '0.001',
        coin: 'BTC',
        description: 'Test transaction',
        status: 'confirmed',
        txHash: 'mock_tx_hash_123',
        fees: '0.0001',
        confirmations: 6,
        createdAt: new Date('2024-01-15')
      },
      {
        _id: 'dev-tx-2',
        fromWallet: 'dev-eth-wallet',
        toAddress: '0x742d35Cc6634C0532925a3b8Df59C5C0D6D8C0b9',
        amount: '0.1',
        coin: 'ETH', 
        description: 'ETH transfer',
        status: 'confirmed',
        txHash: 'mock_tx_hash_456',
        fees: '0.001',
        confirmations: 12,
        createdAt: new Date('2024-01-10')
      }
    ];

    let transactions = mockTransactions;
    if (coin) {
      transactions = mockTransactions.filter(tx => tx.coin === coin.toUpperCase());
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({ 
      success: true, 
      data: paginatedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transactions.length,
        pages: Math.ceil(transactions.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;