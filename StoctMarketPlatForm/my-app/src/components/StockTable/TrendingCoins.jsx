import React, { useState, useEffect } from "react";
import axios from "axios";

const TrendingCoins = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/coingecko/trending");
        setTrending(response.data.slice(0, 6));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trending coins:", error);
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="trending-coins">
      <h2>TOP TRENDING COINS 🔥</h2>
      <ul>
        {trending.map((coin) => (
          <li key={coin.item.id}>
            <img src={coin.item.small} alt={coin.item.name} className="coin-icon" />
            <span>{coin.item.name}</span>
            <span className="rank">#{coin.item.market_cap_rank}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingCoins;
