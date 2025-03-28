import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddPortfolio from './AddPortfolio';
import EditPortfolio from './EditPortfolio';
import './PortfolioManager.css';

const PortfolioManager = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8081/api/portfolios');
      setPortfolios(response.data);
    } catch (err) {
      setError('Failed to fetch portfolios');
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    try {
      await axios.delete(`http://localhost:8081/api/portfolios/${portfolioId}`);
      await fetchPortfolios();
    } catch (err) {
      setError('Failed to delete portfolio');
      console.error('Error deleting portfolio:', err);
    }
  };

  const handlePortfolioAdded = (newPortfolio) => {
    setPortfolios([...portfolios, newPortfolio]);
  };

  const handlePortfolioUpdated = (updatedPortfolio) => {
    setPortfolios(portfolios.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p));
    setEditingPortfolioId(null);
  };

  if (loading) return <div>Loading portfolios...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="portfolio-manager-container">
      <h2>Portfolio Manager</h2>
      <AddPortfolio onPortfolioAdded={handlePortfolioAdded} />
      {portfolios.length === 0 ? (
        <p>No portfolios found</p>
      ) : (
        <div className="portfolios-grid">
          {portfolios.map(portfolio => (
            <div key={portfolio.id} className="portfolio-card">
              <h3>{portfolio.name}</h3>
              <div className="portfolio-actions">
                <button
                  onClick={() => setEditingPortfolioId(portfolio.id)}
                  className="edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePortfolio(portfolio.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingPortfolioId && (
        <EditPortfolio
          portfolioId={editingPortfolioId}
          onPortfolioUpdated={handlePortfolioUpdated}
        />
      )}
    </div>
  );
};

export default PortfolioManager;