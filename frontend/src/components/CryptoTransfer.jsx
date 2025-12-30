// src/components/CryptoTransfer.jsx
import React, { useState, useEffect } from 'react';
import { cryptoAPI, cryptoUtils } from '../services/cryptoService';
import { paymentsAPI } from '../services/apiService';

const CryptoTransfer = ({ userId, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    fromWallet: '',
    toAddress: '',
    amount: '',
    coin: 'BTC',
    description: '',
    priority: 'medium' // low, medium, high
  });

  // Transaction preview
  const [preview, setPreview] = useState({
    networkFee: 0,
    totalAmount: 0,
    fiatValue: 0
  });

  useEffect(() => {
    loadWallets();
    loadPrices();
  }, [userId]);

  const loadWallets = async () => {
    try {
      const response = await cryptoAPI.getWallets(userId);
      setWallets(response.data || response);
    } catch (err) {
      setError('Failed to load wallets: ' + err.message);
    }
  };

  const loadPrices = async () => {
    try {
      const response = await cryptoAPI.getPrices();
      setPrices(response.data || response);
    } catch (err) {
      console.error('Failed to load prices:', err);
    }
  };

  const validateAddress = async () => {
    try {
      setLoading(true);
      const response = await cryptoAPI.validateAddress(formData.toAddress, formData.coin);
      
      if (!response.valid) {
        setError('Invalid wallet address for selected cryptocurrency');
        return false;
      }
      
      return true;
    } catch (err) {
      setError('Address validation failed: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const calculateFees = async () => {
    try {
      const fees = await cryptoAPI.getNetworkFees(formData.coin);
      const networkFee = cryptoUtils.calculateNetworkFee(
        fees.gasPrice, 
        fees.gasLimit, 
        formData.coin
      );

      const totalAmount = parseFloat(formData.amount) + networkFee;
      const fiatValue = cryptoUtils.convertToFiat(
        formData.amount, 
        prices[formData.coin]?.usd || 0
      );

      setPreview({
        networkFee,
        totalAmount,
        fiatValue
      });
    } catch (err) {
      console.error('Failed to calculate fees:', err);
    }
  };

  const handleAddressValidation = async () => {
    const isValid = await validateAddress();
    if (isValid) {
      setStep(2);
      await calculateFees();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const transferData = {
        ...formData,
        userId,
        networkFee: preview.networkFee,
        totalAmount: preview.totalAmount
      };

      const response = await cryptoAPI.sendCrypto(transferData);
      
      if (response.success) {
        onSuccess?.(response.data);
        setStep(3); // Success step
      } else {
        setError(response.error || 'Transfer failed');
      }
    } catch (err) {
      setError('Transfer failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Transfer Successful!</h3>
        <p className="text-gray-600 mb-4">
          Your crypto transfer has been initiated and is being processed on the blockchain.
        </p>
        <button
          onClick={() => {
            setStep(1);
            setFormData({
              fromWallet: '',
              toAddress: '',
              amount: '',
              coin: 'BTC',
              description: '',
              priority: 'medium'
            });
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Make Another Transfer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Crypto Transfer</h2>
        <div className="flex space-x-2">
          {[1, 2].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-3 h-3 rounded-full ${
                step >= stepNumber ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Wallet
              </label>
              <select
                value={formData.fromWallet}
                onChange={(e) => setFormData({ ...formData, fromWallet: e.target.value, coin: e.target.options[e.target.selectedIndex].getAttribute('data-coin') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a wallet</option>
                {wallets.map(wallet => (
                  <option 
                    key={wallet._id} 
                    value={wallet._id}
                    data-coin={wallet.coin}
                  >
                    {wallet.coin} - Balance: {cryptoUtils.formatCryptoAmount(wallet.balance, wallet.coin)} {wallet.coin}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={formData.toAddress}
                onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
                placeholder={`Enter ${formData.coin} wallet address`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {formData.coin}
                </span>
              </div>
              {formData.amount && prices[formData.coin] && (
                <p className="text-sm text-gray-500 mt-1">
                  ≈ {cryptoUtils.convertToFiat(formData.amount, prices[formData.coin].usd)}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddressValidation}
              disabled={!formData.fromWallet || !formData.toAddress || !formData.amount}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              Continue to Review
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Transfer Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">
                    {wallets.find(w => w._id === formData.fromWallet)?.coin} Wallet
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-mono text-xs">{formData.toAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {formData.amount} {formData.coin}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network Fee:</span>
                  <span className="font-medium">
                    {cryptoUtils.formatCryptoAmount(preview.networkFee, formData.coin)} {formData.coin}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold">
                    {cryptoUtils.formatCryptoAmount(preview.totalAmount, formData.coin)} {formData.coin}
                  </span>
                </div>
                {preview.fiatValue && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value:</span>
                    <span className="text-gray-600">{preview.fiatValue}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low (Slower, Lower Fee)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="high">High (Faster, Higher Fee)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a note for this transfer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CryptoTransfer;