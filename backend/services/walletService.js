import mongoose from 'mongoose';
import User from '../models/User.js';
import CryptoWallet from '../models/CryptoWallet.js';
import CryptoTransaction from '../models/CryptoTransaction.js';
import CryptoPurchase from '../models/CryptoPurchase.js';
import Wallet from '../models/Wallet.js';

const UGX_TO_USD_RATE = 3700;
const MIN_DEPOSIT_UGX = 100000;
const MIN_WITHDRAWAL_UGX = 50000;
const SIAN_WITHDRAWAL_FEE = 0.05;

class WalletService {
  
  // ============ CRYPTO METHODS ============
  
  async creditCryptoWallet(userId, cryptoAmount, cryptoCurrency, purchaseRef) {
    try {
      console.log(`?? Crediting wallet: User=${userId}, Amount=${cryptoAmount}, Currency=${cryptoCurrency}`);
      
      let wallet = await CryptoWallet.findOne({ user: userId, coin: cryptoCurrency });
      
      if (!wallet) {
        const address = '0x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        wallet = new CryptoWallet({
          user: userId,
          coin: cryptoCurrency,
          address: address,
          privateKey: 'simulated-' + Math.random().toString(36).substring(2, 15),
          publicKey: 'simulated-' + Math.random().toString(36).substring(2, 15),
          balance: '0'
        });
        
        await wallet.save();
        console.log(`? New simulated wallet created for ${cryptoCurrency}: ${wallet.address}`);
      }
      
      const currentBalance = parseFloat(wallet.balance) || 0;
      const newBalance = currentBalance + cryptoAmount;
      wallet.balance = newBalance.toString();
      await wallet.save();
      
      const transaction = new CryptoTransaction({
        fromWallet: wallet._id,
        toAddress: wallet.address,
        amount: cryptoAmount.toString(),
        coin: cryptoCurrency,
        description: `Crypto purchase via Mobile Money (Ref: ${purchaseRef})`,
        status: 'confirmed'
      });
      
      await transaction.save();
      
      return {
        success: true,
        walletAddress: wallet.address,
        transactionId: transaction._id,
        newBalance,
        cryptoAmount,
        cryptoCurrency
      };
      
    } catch (error) {
      console.error('Credit crypto wallet error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getCryptoBalance(userId, currency = 'USDT') {
    try {
      const wallet = await CryptoWallet.findOne({ user: userId, coin: currency });
      
      return {
        success: true,
        currency,
        balance: wallet ? parseFloat(wallet.balance) : 0,
        address: wallet ? wallet.address : null,
        hasWallet: !!wallet
      };
    } catch (error) {
      console.error('Get crypto balance error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async getAllCryptoWallets(userId) {
    try {
      const wallets = await CryptoWallet.find({ user: userId });
      
      return {
        success: true,
        wallets: wallets.map(w => ({
          id: w._id,
          coin: w.coin,
          address: w.address,
          balance: parseFloat(w.balance),
          createdAt: w.createdAt
        }))
      };
    } catch (error) {
      console.error('Get all crypto wallets error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ============ FIAT WALLET METHODS ============
  
  async getOrCreateFiatWallet(userId) {
    try {
      // Handle string userId
      let userIdObj = userId;
      
      if (typeof userId === 'string' && userId.length < 24) {
        // Try to find user by email or create a default user
        let user = await User.findOne({ email: userId + '@sian.com' });
        if (!user) {
          // Use a default ObjectId for testing
          userIdObj = new mongoose.Types.ObjectId('000000000000000000000001');
        } else {
          userIdObj = user._id;
        }
      } else if (typeof userId === 'string' && userId.length === 24) {
        userIdObj = new mongoose.Types.ObjectId(userId);
      }
      
      let wallet = await Wallet.findOne({ userId: userIdObj });
      
      if (!wallet) {
        wallet = new Wallet({
          userId: userIdObj,
          walletId: `WAL${Date.now()}${Math.random().toString(36).substr(2, 6)}`,
          balance: 0,
          initialCapital: 0,
          currency: 'UGX',
          type: 'personal',
          status: 'active',
          totalFeesCollected: 0,
          totalTradingProfit: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          transactions: []
        });
        await wallet.save();
        console.log(`?? New fiat wallet created for user ${userId}: ${wallet.walletId}`);
      }
      
      return wallet;
    } catch (error) {
      console.error('Get/create fiat wallet error:', error);
      throw error;
    }
  }
  
  async getFiatBalance(userId) {
    try {
      const wallet = await this.getOrCreateFiatWallet(userId);
      
      return {
        success: true,
        balanceUGX: wallet.balance,
        balanceUSD: wallet.balance / UGX_TO_USD_RATE,
        initialCapital: wallet.initialCapital || 0,
        availableProfit: (wallet.balance - (wallet.initialCapital || 0)),
        currency: wallet.currency,
        walletId: wallet.walletId,
        status: wallet.status
      };
    } catch (error) {
      console.error('Get fiat balance error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async depositFiat(userId, amountUGX, method, metadata = {}) {
    try {
      const wallet = await this.getOrCreateFiatWallet(userId);
      
      if (amountUGX < MIN_DEPOSIT_UGX) {
        throw new Error(`Minimum deposit is UGX ${MIN_DEPOSIT_UGX.toLocaleString()}`);
      }
      
      const transaction = {
        transactionId: `DEP${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
        type: 'deposit',
        amount: amountUGX,
        currency: 'UGX',
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amountUGX,
        description: `Deposit via ${method}`,
        reference: metadata.reference || `DEP-${Date.now()}`,
        status: 'completed',
        metadata: {
          method,
          phone: metadata.phone || '',
          ...metadata
        }
      };
      
      wallet.transactions.push(transaction);
      wallet.balance = transaction.balanceAfter;
      
      if (!wallet.initialCapital || wallet.initialCapital === 0) {
        wallet.initialCapital = amountUGX;
      }
      
      wallet.totalDeposits = (wallet.totalDeposits || 0) + amountUGX;
      await wallet.save();
      
      console.log(`?? Fiat Deposit: UGX ${amountUGX.toLocaleString()} to wallet ${wallet.walletId}`);
      
      return {
        success: true,
        transaction: transaction,
        newBalance: wallet.balance,
        balanceUSD: wallet.balance / UGX_TO_USD_RATE,
        initialCapital: wallet.initialCapital,
        availableProfit: wallet.balance - wallet.initialCapital
      };
    } catch (error) {
      console.error('? Fiat deposit error:', error);
      throw error;
    }
  }
  
  async withdrawFiat(userId, amountUGX, method, metadata = {}) {
    try {
      const wallet = await this.getOrCreateFiatWallet(userId);
      
      if (amountUGX < MIN_WITHDRAWAL_UGX) {
        throw new Error(`Minimum withdrawal is UGX ${MIN_WITHDRAWAL_UGX.toLocaleString()}`);
      }
      
      const initialCapitalUGX = wallet.initialCapital || 0;
      const profitUGX = wallet.balance - initialCapitalUGX;
      
      if (profitUGX <= 0) {
        throw new Error('No profits available to withdraw. Capital is locked.');
      }
      
      if (amountUGX > profitUGX) {
        throw new Error(`Available profit: UGX ${profitUGX.toLocaleString()}`);
      }
      
      const feeUGX = amountUGX * SIAN_WITHDRAWAL_FEE;
      const netAmountUGX = amountUGX - feeUGX;
      
      const transaction = {
        transactionId: `WIT${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
        type: 'withdrawal',
        amount: amountUGX,
        fee: feeUGX,
        netAmount: netAmountUGX,
        currency: 'UGX',
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amountUGX,
        description: `Withdrawal via ${method} (Profit only - ${SIAN_WITHDRAWAL_FEE * 100}% fee applied)`,
        reference: metadata.reference || `WIT-${Date.now()}`,
        status: 'completed',
        metadata: {
          method,
          phone: metadata.phone || '',
          fee: feeUGX,
          feePercent: SIAN_WITHDRAWAL_FEE * 100,
          profitWithdrawn: amountUGX,
          ...metadata
        }
      };
      
      wallet.transactions.push(transaction);
      wallet.balance = transaction.balanceAfter;
      wallet.totalWithdrawals = (wallet.totalWithdrawals || 0) + amountUGX;
      wallet.totalFeesCollected = (wallet.totalFeesCollected || 0) + feeUGX;
      await wallet.save();
      
      console.log(`?? Fiat Withdrawal: UGX ${amountUGX.toLocaleString()} from wallet ${wallet.walletId}`);
      
      return {
        success: true,
        transaction: transaction,
        fee: feeUGX,
        feePercent: SIAN_WITHDRAWAL_FEE * 100,
        netAmount: netAmountUGX,
        newBalance: wallet.balance,
        balanceUSD: wallet.balance / UGX_TO_USD_RATE,
        initialCapital: wallet.initialCapital,
        availableProfit: wallet.balance - wallet.initialCapital,
        totalFeesCollected: wallet.totalFeesCollected
      };
    } catch (error) {
      console.error('? Fiat withdrawal error:', error);
      throw error;
    }
  }
  
  async processTradeProfit(userId, profitUSD, tradeData) {
    try {
      const wallet = await this.getOrCreateFiatWallet(userId);
      const profitUGX = profitUSD * UGX_TO_USD_RATE;
      
      if (Math.abs(profitUGX) < 1) {
        return { success: true, message: 'Profit too small to record' };
      }
      
      const isProfit = profitUGX > 0;
      
      const transaction = {
        transactionId: `TRD${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
        type: isProfit ? 'trading_profit' : 'trading_loss',
        amount: Math.abs(profitUGX),
        currency: 'UGX',
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + profitUGX,
        description: isProfit ? `Trading Profit: ${tradeData.symbol || 'BTC/USDT'}` : `Trading Loss: ${tradeData.symbol || 'BTC/USDT'}`,
        reference: tradeData.tradeId || `TXN-${Date.now()}`,
        status: 'completed',
        metadata: {
          profitUSD,
          profitUGX,
          symbol: tradeData.symbol || 'BTC/USDT',
          entryPrice: tradeData.entryPrice,
          exitPrice: tradeData.exitPrice,
          size: tradeData.size,
          tradeType: tradeData.action || 'SELL',
          ...tradeData
        }
      };
      
      wallet.transactions.push(transaction);
      wallet.balance = transaction.balanceAfter;
      wallet.totalTradingProfit = (wallet.totalTradingProfit || 0) + profitUGX;
      await wallet.save();
      
      return {
        success: true,
        transaction: transaction,
        newBalance: wallet.balance,
        balanceUSD: wallet.balance / UGX_TO_USD_RATE,
        profitUGX,
        isProfit,
        totalTradingProfit: wallet.totalTradingProfit,
        availableProfit: wallet.balance - (wallet.initialCapital || 0)
      };
    } catch (error) {
      console.error('? Trade profit processing error:', error);
      throw error;
    }
  }
  
  async getFiatStats(userId) {
    try {
      const wallet = await this.getOrCreateFiatWallet(userId);
      
      const today = new Date();
      const todayTransactions = wallet.transactions.filter(t => 
        new Date(t.createdAt).toDateString() === today.toDateString() &&
        t.status === 'completed'
      );
      
      const dailyDeposits = todayTransactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dailyWithdrawals = todayTransactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dailyTradingProfit = todayTransactions
        .filter(t => t.type === 'trading_profit' || t.type === 'trading_loss')
        .reduce((sum, t) => t.type === 'trading_profit' ? sum + t.amount : sum - t.amount, 0);
      
      const totalDeposits = wallet.transactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalWithdrawals = wallet.transactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalTradingProfit = wallet.transactions
        .filter(t => (t.type === 'trading_profit' || t.type === 'trading_loss') && t.status === 'completed')
        .reduce((sum, t) => t.type === 'trading_profit' ? sum + t.amount : sum - t.amount, 0);
      
      const initialCapital = wallet.initialCapital || 0;
      const currentProfit = wallet.balance - initialCapital;
      
      return {
        success: true,
        data: {
          balance: wallet.balance,
          balanceUSD: wallet.balance / UGX_TO_USD_RATE,
          currency: wallet.currency,
          initialCapital: initialCapital,
          availableProfit: currentProfit,
          totalDeposits,
          totalWithdrawals,
          totalTradingProfit,
          totalFeesCollected: wallet.totalFeesCollected || 0,
          dailyDeposits,
          dailyWithdrawals,
          dailyTradingProfit,
          transactionCount: wallet.transactions.length,
          walletId: wallet.walletId,
          status: wallet.status,
          type: wallet.type,
          limits: wallet.limits,
          createdAt: wallet.createdAt,
          updatedAt: wallet.updatedAt
        }
      };
    } catch (error) {
      console.error('? Fiat stats error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ============ COMPATIBILITY METHODS ============
  
  async creditWallet(userId, cryptoAmount, cryptoCurrency, purchaseRef) {
    return this.creditCryptoWallet(userId, cryptoAmount, cryptoCurrency, purchaseRef);
  }
  
  async deposit(userId, amountUGX, method, metadata = {}) {
    return this.depositFiat(userId, amountUGX, method, metadata);
  }
  
  async withdraw(userId, amountUGX, method, metadata = {}) {
    return this.withdrawFiat(userId, amountUGX, method, metadata);
  }
  
  async processTrade(userId, profitUSD, tradeData) {
    return this.processTradeProfit(userId, profitUSD, tradeData);
  }
  
  async getTotalBalance(userId) {
    try {
      const fiat = await this.getFiatBalance(userId);
      const crypto = await this.getAllCryptoWallets(userId);
      
      const cryptoValueUSD = crypto.wallets.reduce((sum, w) => {
        let usdValue = 0;
        if (w.coin === 'USDT') usdValue = w.balance;
        else if (w.coin === 'BTC') usdValue = w.balance * 50000;
        else if (w.coin === 'ETH') usdValue = w.balance * 3000;
        return sum + usdValue;
      }, 0);
      
      return {
        success: true,
        data: {
          fiat: fiat,
          crypto: crypto,
          totalUSD: (fiat.success ? fiat.balanceUSD : 0) + cryptoValueUSD,
          totalUGX: ((fiat.success ? fiat.balanceUSD : 0) + cryptoValueUSD) * UGX_TO_USD_RATE
        }
      };
    } catch (error) {
      console.error('Get total balance error:', error);
      return { success: false, error: error.message };
    }
  }
}

const walletService = new WalletService();
export default walletService;