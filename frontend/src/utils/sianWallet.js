// src/utils/sianWallet.js
export class SianWallet {
  constructor(userId) {
    this.userId = userId;
    this.balance = 0;
    this.transactions = [];
  }

  async credit(amount, source, description) {
    this.balance += amount;
    const transaction = {
      id: 'TXN' + Date.now(),
      type: 'credit',
      amount,
      source,
      description,
      timestamp: new Date().toISOString(),
      balance: this.balance
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async debit(amount, purpose, description) {
    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }
    
    this.balance -= amount;
    const transaction = {
      id: 'TXN' + Date.now(),
      type: 'debit', 
      amount,
      purpose,
      description,
      timestamp: new Date().toISOString(),
      balance: this.balance
    };
    this.transactions.push(transaction);
    return transaction;
  }

  getBalance() {
    return this.balance;
  }

  getTransactionHistory() {
    return this.transactions;
  }
}