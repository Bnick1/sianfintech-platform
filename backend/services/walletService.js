import mongoose from 'mongoose';
// ... rest of imports

class WalletService {
  
  async getOrCreateFiatWallet(userId) {
    try {
      // Handle string userId - convert to ObjectId if valid
      let userIdObj = userId;
      
      // If userId is a string like 'default', create a new ObjectId
      if (typeof userId === 'string' && userId.length < 24) {
        // Use a fixed ObjectId for 'default' user
        const defaultUserId = new mongoose.Types.ObjectId('000000000000000000000001');
        userIdObj = defaultUserId;
      } else if (typeof userId === 'string' && userId.length === 24) {
        // It's already a valid ObjectId string
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
  
  // ... rest of methods
}