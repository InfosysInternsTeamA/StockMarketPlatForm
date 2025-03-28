import React, { useState } from "react";
import portfolioService from "../../services/portfolioService";
import "./AddPortfolio.css";

const AddPortfolio = ({ onPortfolioAdded }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const handleAddPortfolio = async () => {
    if (!name.trim()) {
      setError("Portfolio name cannot be empty");
      return;
    }

    try {
      const newPortfolio = await portfolioService.createPortfolio({ name });
      onPortfolioAdded(newPortfolio);
      setName("");
      setError(null);
    } catch (err) {
      setError("Failed to add portfolio");
      console.error("Error adding portfolio:", err);
    }
  };

  return (
    <div className="add-portfolio-container">
      <h2>Add New Portfolio</h2>
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
      <button onClick={handleAddPortfolio} className="add-portfolio-btn">
        Add Portfolio
      </button>
    </div>
  );
};

export default AddPortfolio;
