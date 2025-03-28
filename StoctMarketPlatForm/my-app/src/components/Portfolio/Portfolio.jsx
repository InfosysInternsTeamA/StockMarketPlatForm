import React, { useEffect, useState } from "react";
import portfolioService from "../../services/portfolioService";
import AddPortfolio from "./AddPortfolio";
import EditPortfolio from "./EditPortfolio";
import "./Portfolio.css";

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const data = await portfolioService.getUserPortfolios("userId"); // Replace with actual user ID
        setPortfolios(data);
      } catch (err) {
        setError("Failed to fetch portfolios");
        console.error("Error fetching portfolios:", err);
      }
    };

    fetchPortfolios();
  }, []);

  const handlePortfolioAdded = (newPortfolio) => {
    setPortfolios([...portfolios, newPortfolio]);
  };

  const handlePortfolioUpdated = (updatedPortfolio) => {
    if (!updatedPortfolio || !updatedPortfolio.id) return;

    setPortfolios(
      portfolios.map((portfolio) =>
        portfolio?.id === updatedPortfolio.id ? updatedPortfolio : portfolio
      )
    );
    setSelectedPortfolio(updatedPortfolio);
  };

  const handleSelectPortfolio = (portfolio) => {
    if (portfolio && portfolio.id) {
      setSelectedPortfolio(portfolio);
    }
  };

  return (
    <div className="portfolio-container">
      <h2>Your Portfolios</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="portfolio-list">
        {portfolios.map(
          (portfolio) =>
            portfolio && (
              <div
                key={portfolio?.id || "temp-key"}
                className={`portfolio-item ${
                  selectedPortfolio?.id === portfolio?.id ? "selected" : ""
                }`}
                onClick={() => handleSelectPortfolio(portfolio)}
              >
                {portfolio?.name || "Unnamed Portfolio"}
              </div>
            )
        )}
      </div>
      <AddPortfolio onPortfolioAdded={handlePortfolioAdded} />
      {selectedPortfolio && (
        <EditPortfolio
          portfolioId={selectedPortfolio.id}
          onPortfolioUpdated={handlePortfolioUpdated}
        />
      )}
    </div>
  );
};

export default Portfolio;
