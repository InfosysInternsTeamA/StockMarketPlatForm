import React, { useState } from 'react';
import portfolioService from '../../services/portfolioService';
import './AddAssetForm.css';

const AddAssetForm = ({ portfolioId, onAssetAdded }) => {
  const [newAsset, setNewAsset] = useState({ symbol: '', quantity: '', purchasePrice: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  const handleAddAsset = async () => {
    if (!portfolioId) {
      setError('No portfolio selected');
      return;
    }

    if (!newAsset.symbol || !newAsset.quantity || !newAsset.purchasePrice) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransactionStatus(null);

    try {
      const assetToAdd = {
        symbol: newAsset.symbol.trim().toUpperCase(),
        holdings: parseFloat(newAsset.quantity), // Map to backend field
        avgBuy: parseFloat(newAsset.purchasePrice), // Map to backend field
      };

      if (isNaN(assetToAdd.holdings) || isNaN(assetToAdd.avgBuy)) {
        throw new Error('Invalid quantity or price');
      }

      // Add the asset to the portfolio
      const updatedPortfolio = await portfolioService.addAsset(portfolioId, assetToAdd);

      if (!updatedPortfolio || !updatedPortfolio.id) {
        throw new Error('Failed to update portfolio');
      }

      // Record the transaction (optional, kept as-is for now)
      const transaction = {
        type: 'BUY',
        symbol: assetToAdd.symbol,
        quantity: assetToAdd.holdings, // Align with backend naming if transaction uses same model
        price: assetToAdd.avgBuy, // Align with backend naming
        date: new Date().toISOString(),
      };

      try {
        await portfolioService.recordTransaction(updatedPortfolio.id, transaction);
        setTransactionStatus('Transaction recorded successfully');
      } catch (transactionErr) {
        setTransactionStatus('Asset added but failed to record transaction');
        console.error('Error recording transaction:', transactionErr);
      }

      onAssetAdded(updatedPortfolio.assets);
      setNewAsset({ symbol: '', quantity: '', purchasePrice: '' });
    } catch (err) {
      setError('Failed to add asset: ' + err.message);
      console.error('Error adding asset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-asset-form-container">
      <h3>Add New Asset</h3>
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-message">Processing...</div>}
      {transactionStatus && <div className="status-message">{transactionStatus}</div>}
      <div className="form-group">
        <label htmlFor="asset-symbol">Symbol</label>
        <input
          type="text"
          id="asset-symbol"
          value={newAsset.symbol}
          onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="asset-quantity">Quantity</label>
        <input
          type="number"
          id="asset-quantity"
          value={newAsset.quantity}
          onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label htmlFor="asset-purchase-price">Purchase Price</label>
        <input
          type="number"
          id="asset-purchase-price"
          value={newAsset.purchasePrice}
          onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: e.target.value })}
        />
      </div>
      <button onClick={handleAddAsset} className="add-asset-btn" disabled={isLoading}>
        Add Asset
      </button>
    </div>
  );
};

export default AddAssetForm;
