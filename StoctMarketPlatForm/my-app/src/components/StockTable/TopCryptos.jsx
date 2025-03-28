import React, { useState, useEffect } from "react";
import axios from "axios";

const TopCryptos = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopCryptos = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/coingecko/top-cryptos");
        setCryptos(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top cryptos:", error);
        setLoading(false);
      }
    };
    fetchTopCryptos();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="top-cryptos">
      <h2>Top Cryptocurrencies by Market Cap ⭐</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>NAME</th>
              <th>PRICE</th>
              <th>24h%</th>
              <th>7d%</th>
              <th>MARKET CAP</th>
              <th>VOLUME</th>
              <th>SUPPLY</th>
            </tr>
          </thead>
          <tbody>
            {cryptos.map((crypto, index) => (
              <tr key={crypto.id}>
                <td>{index + 1}</td>
                <td>
                  <img src={crypto.image} alt={crypto.name} className="coin-icon" />
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </td>
                <td>${crypto.current_price?.toLocaleString() || 'N/A'}</td>
                <td className={crypto.price_change_percentage_24h >= 0 ? "positive" : "negative"}>
                  {crypto.price_change_percentage_24h?.toFixed(2) || 'N/A'}%
                </td>
                <td className={crypto.price_change_percentage_7d_in_currency >= 0 ? "positive" : "negative"}>
                  {crypto.price_change_percentage_7d_in_currency?.toFixed(2) || 'N/A'}%
                </td>
                <td>${crypto.market_cap?.toLocaleString() || 'N/A'}</td>
                <td>${crypto.total_volume?.toLocaleString() || 'N/A'}</td>
                <td>
                  {crypto.circulating_supply?.toLocaleString() || 'N/A'} {crypto.symbol.toUpperCase()}
                  {crypto.total_supply && (
                    <div className="progress-bar">
                      <div
                        style={{
                          width: `${(crypto.circulating_supply / crypto.total_supply) * 100}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopCryptos;
