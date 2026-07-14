const UGX_TO_USD_RATE = 3700;
const MIN_DEPOSIT_UGX = 100000;
const MIN_WITHDRAWAL_UGX = 50000;
const WITHDRAWAL_FEE = 0.05; // 5% on ALL withdrawals
const DEPOSIT_FEE = 0.00; // No deposit fee (optional)

// Update deposit validation
async depositFiat(userId, amountUGX, method, metadata = {}) {
    try {
        const wallet = await this.getOrCreateFiatWallet(userId);
        
        // Validate deposit - minimum UGX 100,000
        if (amountUGX < MIN_DEPOSIT_UGX) {
            throw new Error(`Minimum deposit is UGX ${MIN_DEPOSIT_UGX.toLocaleString()}`);
        }
        
        // No deposit fee
        const netAmountUGX = amountUGX;
        
        // Create transaction
        const transaction = {
            transactionId: `DEP${Date.now()}${Math.random().toString(36).substr(2, 4)}`,
            type: 'deposit',
            amount: amountUGX,
            fee: 0,
            netAmount: netAmountUGX,
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
        
        // Update wallet
        wallet.transactions.push(transaction);
        wallet.balance = transaction.balanceAfter;
        
        // Track initial capital (first deposit sets it, but doesn't lock)
        if (!wallet.initialCapital || wallet.initialCapital === 0) {
            wallet.initialCapital = amountUGX;
        }
        
        wallet.totalDeposits = (wallet.totalDeposits || 0) + amountUGX;
        await wallet.save();
        
        console.log(`💰 Fiat Deposit: UGX ${amountUGX.toLocaleString()} to wallet ${wallet.walletId}`);
        console.log(`   New Balance: UGX ${wallet.balance.toLocaleString()}`);
        
        return {
            success: true,
            transaction: transaction,
            newBalance: wallet.balance,
            balanceUSD: wallet.balance / UGX_TO_USD_RATE,
            initialCapital: wallet.initialCapital,
            availableProfit: wallet.balance - wallet.initialCapital
        };
    } catch (error) {
        console.error('❌ Fiat deposit error:', error);
        throw error;
    }
}
