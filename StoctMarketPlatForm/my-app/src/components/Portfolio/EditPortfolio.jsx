import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolioService';
import './EditPortfolio.css';

const EditPortfolio = ({ portfolioId, onPortfolioUpdated }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [name, setName] = useState('');
  const [assets, setAssets] = useState([]);
  const [newAsset, setNewAsset] = useState({ symbol: '', quantity: 0, purchasePrice: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const fetchedPortfolio = await portfolioService.getPortfolioById(portfolioId);
        setPortfolio(fetchedPortfolio);
        setName(fetchedPortfolio.name);
        setAssets(fetchedPortfolio.assets || []);
      } catch (err) {
        setError('Failed to fetch portfolio');
        console.error('Error fetching portfolio:', err);
      }
    };
    fetchPortfolio();
  }, [portfolioId]);

  const handleUpdatePortfolio = async () => {
    try {
      const updatedPortfolio = await portfolioService.updatePortfolio({ ...portfolio, name });
      onPortfolioUpdated(updatedPortfolio);
      setError(null);
    } catch (err) {
      setError('Failed to update portfolio');
      console.error('Error updating portfolio:', err);
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.symbol || isNaN(newAsset.quantity) || isNaN(newAsset.purchasePrice)) {
      setError('Please provide a valid symbol, quantity, and purchase price');
      return;
    }
    try {
      const assetToAdd = {
        symbol: newAsset.symbol.trim().toUpperCase(),
        holdings: parseFloat(newAsset.quantity), // Map to backend field
        avgBuy: parseFloat(newAsset.purchasePrice), // Map to backend field
      };
      const updatedPortfolio = await portfolioService.addAsset(portfolioId, assetToAdd);
      setAssets(updatedPortfolio.assets || []);
      setNewAsset({ symbol: '', quantity: 0, purchasePrice: 0 });
      setError(null);
      onPortfolioUpdated(updatedPortfolio);
    } catch (err) {
      setError('Failed to add asset');
      console.error('Error adding asset:', err);
    }
  };

  const handleRemoveAsset = async (symbol) => {
    try {
      const updatedPortfolio = await portfolioService.removeAsset(portfolioId, symbol);
      setAssets(updatedPortfolio.assets || []);
      setError(null);
      onPortfolioUpdated(updatedPortfolio);
    } catch (err) {
      setError('Failed to remove asset');
      console.error('Error removing asset:', err);
    }
  };

  if (!portfolio) return <div>Loading...</div>;

  return (
    <div className="edit-portfolio-container">
      <h2>Edit Portfolio</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="portfolio-name">Portfolio Name</label>
        <input
          type="text"
          id="portfolio-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="assets-section">
        <h3>Assets</h3>
        <table className="assets-table">
          <thead>
            <tr>
              <th>#</th>
              <th>NAME</th>
              <th>PRICE</th>
              <th>24H%</th>
              <th>HOLDINGS</th>
              <th>AVG BUY PRICE</th>
              <th>PROFIT/LOSS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{asset.symbol}</td>
                <td>{asset.price ? `₹${asset.price.toFixed(2)}` : 'N/A'}</td>
                <td>{asset.change24h ? `${asset.change24h.toFixed(2)}%` : 'N/A'}</td>
                <td>{asset.holdings ? asset.holdings.toFixed(2) : 'N/A'}</td>
                <td>{asset.avgBuy ? `₹${asset.avgBuy.toFixed(2)}` : 'N/A'}</td>
                <td>TBD</td> {/* Add profit/loss calculation if needed */}
                <td>
                  <button
                    onClick={() => handleRemoveAsset(asset.symbol)}
                    className="remove-asset-btn"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="new-asset-form">
          <input
            type="text"
            placeholder="Symbol"
            value={newAsset.symbol}
            onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newAsset.quantity}
            onChange={(e) => setNewAsset({ ...newAsset, quantity: parseFloat(e.target.value) || 0 })}
          />
          <input
            type="number"
            placeholder="Purchase Price"
            value={newAsset.purchasePrice}
            onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: parseFloat(e.target.value) || 0 })}
          />
          <button onClick={handleAddAsset} className="add-asset-btn">Add Asset</button>
        </div>
      </div>
      <button onClick={handleUpdatePortfolio} className="update-portfolio-btn">
        Update Portfolio
      </button>
    </div>
  );
};

export default EditPortfolio;