// src/components/EnhancedWalletDashboard.jsx
import React, { useState, useEffect } from 'react';
import { walletsAPI } from '../services/apiService';
import { cryptoAPI, cryptoUtils } from '../services/cryptoService';
import CryptoTransfer from './CryptoTransfer';

const EnhancedWalletDashboard = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [fiatBalance, setFiatBalance] = useState(0);
  const [cryptoWallets, setCryptoWallets] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, [userId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // Load fiat balance
      const fiatResponse = await walletsAPI.getBalance(userId);
      setFiatBalance(fiatResponse.balance || 0);
      
      // Load crypto wallets
      const cryptoResponse = await cryptoAPI.getWallets(userId);
      setCryptoWallets(cryptoResponse.data || cryptoResponse);
      
      // Load crypto prices
      const pricesResponse = await cryptoAPI.getPrices();
      setCryptoPrices(pricesResponse.data || pricesResponse);
      
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCryptoValue = () => {
    return cryptoWallets.reduce((total, wallet) => {
      const price = cryptoPrices[wallet.coin]?.usd || 0;
      return total + (parseFloat(wallet.balance) * price);
    }, 0);
  };

  const handleTransferSuccess = () => {
    loadWalletData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading wallet data...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SianWallet</h1>
        <p className="text-gray-600">Manage your fiat and cryptocurrency assets</p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="text-sm text-gray-600 mb-2">Total Fiat Balance</div>
          <div className="text-2xl font-bold text-gray-900">
            ${fiatBalance.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="text-sm text-gray-600 mb-2">Total Crypto Value</div>
          <div className="text-2xl font-bold text-gray-900">
            ${getTotalCryptoValue().toFixed(2)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="text-sm text-gray-600 mb-2">Total Assets</div>
          <div className="text-2xl font-bold text-gray-900">
            ${(fiatBalance + getTotalCryptoValue()).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'crypto', name: 'Cryptocurrency' },
              { id: 'transfer', name: 'Transfer Crypto' },
              { id: 'history', name: 'Transaction History' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Fiat Wallet</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available Balance</span>
                    <span className="text-xl font-bold">${fiatBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Cryptocurrency Wallets</h3>
                <div className="space-y-3">
                  {cryptoWallets.map(wallet => (
                    <div key={wallet._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{wallet.coin}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {cryptoUtils.formatCryptoAmount(wallet.balance, wallet.coin)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${cryptoUtils.convertToFiat(wallet.balance, cryptoPrices[wallet.coin]?.usd || 0).replace('$', '')}
                          </div>
                          <div className="text-sm text-gray-600">
                            1 {wallet.coin} = ${cryptoPrices[wallet.coin]?.usd || '0.00'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Crypto Wallets Tab */}
          {activeTab === 'crypto' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Crypto Wallets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cryptoWallets.map(wallet => (
                  <div key={wallet._id} className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-2xl font-bold">{wallet.coin}</span>
                      <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                        {cryptoUtils.formatCryptoAmount(wallet.balance, wallet.coin)}
                      </span>
                    </div>
                    <div className="text-sm opacity-90">
                      ${cryptoUtils.convertToFiat(wallet.balance, cryptoPrices[wallet.coin]?.usd || 0).replace('$', '')}
                    </div>
                    <div className="mt-4 text-xs opacity-75 font-mono">
                      {wallet.address?.slice(0, 16)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crypto Transfer Tab */}
          {activeTab === 'transfer' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Transfer Cryptocurrency</h3>
              <CryptoTransfer userId={userId} onSuccess={handleTransferSuccess} />
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                Transaction history will be displayed here
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWalletDashboard;