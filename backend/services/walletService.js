async getFiatBalance(userId) {
    try {
        const wallet = await this.getOrCreateFiatWallet(userId);
        
        // Calculate total deposits
        const totalDeposits = wallet.transactions
            .filter(t => t.type === 'deposit' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate total trading profit
        const totalTradingProfit = wallet.transactions
            .filter(t => (t.type === 'trading_profit' || t.type === 'trading_loss') && t.status === 'completed')
            .reduce((sum, t) => t.type === 'trading_profit' ? sum + t.amount : sum - t.amount, 0);
        
        // ALL funds are withdrawable (no capital locking)
        const withdrawableBalance = wallet.balance;
        
        return {
            success: true,
            balanceUGX: wallet.balance,
            balanceUSD: wallet.balance / UGX_TO_USD_RATE,
            totalDeposits: totalDeposits,
            totalTradingProfit: totalTradingProfit,
            availableProfit: totalTradingProfit, // For display only
            withdrawableBalance: withdrawableBalance, // ALL funds
            currency: wallet.currency,
            walletId: wallet.walletId,
            status: wallet.status
        };
    } catch (error) {
        console.error('Get fiat balance error:', error);
        return { success: false, error: error.message };
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
        
        // ALL funds are withdrawable
        const withdrawableBalance = wallet.balance;
        
        return {
            success: true,
            data: {
                balance: wallet.balance,
                balanceUSD: wallet.balance / UGX_TO_USD_RATE,
                currency: wallet.currency,
                totalDeposits: totalDeposits,
                totalWithdrawals: totalWithdrawals,
                totalTradingProfit: totalTradingProfit,
                availableProfit: totalTradingProfit, // Trading profits only
                withdrawableBalance: withdrawableBalance, // ALL funds
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
        console.error('❌ Fiat stats error:', error);
        return { success: false, error: error.message };
    }
}
