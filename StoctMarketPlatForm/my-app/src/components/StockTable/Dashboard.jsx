import React, { useState } from "react";
import TrendingCoins from "./TrendingCoins";
import TopCryptos from "./TopCryptos";
import LatestNews from "./LatestNews";
import 'index.css';

const Dashboard = () => {
  const [showTrending, setShowTrending] = useState(true);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        {showTrending && (
          <div className="trending-section">
            <TrendingCoins />
            <button onClick={() => setShowTrending(false)}>Close</button>
          </div>
        )}
      </div>
      <div className="main-content">
        <TopCryptos />
        <LatestNews />
      </div>
    </div>
  );
};

export default Dashboard;