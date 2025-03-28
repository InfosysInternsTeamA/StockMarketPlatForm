import React, { useEffect, useState, memo } from "react";
import axios from "axios";
import "./StockDashboard.css";
import AIBot from "./AIBot";

// Cache durations in milliseconds
const STOCK_CACHE_TIME = 900000; // 15 minutes
const CRYPTO_CACHE_TIME = 600000; // 10 minutes

// Helper functions for localStorage caching
const cacheData = (key, data) => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

const getCachedData = (key, maxAge) => {
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < maxAge) return data;
  }
  return null;
};

// Memoized Stock Row component
const StockRow = memo(({ stock, index }) => (
  <tr>
    <td>{index + 1}</td>
    <td>{stock.symbol}</td>
    <td>{stock.price?.toFixed(2) ?? "N/A"} {stock.currency}</td>
    <td className={stock.percentChange24h >= 0 ? "positive" : "negative"}>
      {stock.percentChange24h?.toFixed(2) ?? "N/A"}%
    </td>
    <td>{stock.marketCap?.toLocaleString() ?? "N/A"}</td>
    <td>{stock.volume?.toLocaleString() ?? "N/A"}</td>
    <td>{stock.previousClose?.toFixed(2) ?? "N/A"}</td>
    <td>{stock.open?.toFixed(2) ?? "N/A"}</td>
    <td className="range">
      {stock.dayLow?.toFixed(2) ?? "N/A"} - {stock.dayHigh?.toFixed(2) ?? "N/A"}
    </td>
    <td className="range">
      {stock.yearLow?.toFixed(2) ?? "N/A"} - {stock.yearHigh?.toFixed(2) ?? "N/A"}
    </td>
    <td>{stock.avgVolume?.toLocaleString() ?? "N/A"}</td>
    <td>{stock.beta?.toFixed(2) ?? "N/A"}</td>
    <td>{stock.peRatio?.toFixed(2) ?? "N/A"}</td>
    <td>{stock.eps?.toFixed(2) ?? "N/A"}</td>
    <td>{stock.dividendYield?.toFixed(2) ?? "N/A"}%</td>
  </tr>
));

// Memoized Crypto Row component
const CryptoRow = memo(({ crypto, index }) => (
  <tr>
    <td>{index + 1}</td>
    <td>
      <div className="coin-badge">
        <img src={crypto.image} alt={crypto.name} className="coin-icon" />
        <span>
          {crypto.name} <span className="symbol">({crypto.symbol.toUpperCase()})</span>
        </span>
      </div>
    </td>
    <td>${crypto.current_price?.toLocaleString() ?? "N/A"}</td>
    <td className={crypto.price_change_percentage_24h >= 0 ? "positive" : "negative"}>
      {crypto.price_change_percentage_24h?.toFixed(2) ?? "N/A"}%
    </td>
    <td className={crypto.price_change_percentage_7d_in_currency >= 0 ? "positive" : "negative"}>
      {crypto.price_change_percentage_7d_in_currency?.toFixed(2) ?? "N/A"}%
    </td>
    <td>${crypto.market_cap?.toLocaleString() ?? "N/A"}</td>
    <td>${crypto.total_volume?.toLocaleString() ?? "N/A"}</td>
    <td>
      <div className="supply-info">
        {crypto.circulating_supply?.toLocaleString() ?? "N/A"} {crypto.symbol.toUpperCase()}
        {crypto.total_supply && (
          <div className="progress-bar">
            <div style={{ width: (crypto.circulating_supply / crypto.total_supply * 100) + "%" }}></div>
          </div>
        )}
      </div>
    </td>
  </tr>
));

const StockDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [trending, setTrending] = useState([]);
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("crypto");
  const [selectedMarket, setSelectedMarket] = useState("NSE");

  // Market symbols for NSE and BSE
  const marketSymbols = {
    NSE: [
      "RELIANCE.NS",
      "TCS.NS",
      "HDFCBANK.NS",
      "ICICIBANK.NS",
      "INFY.NS",
      "HDFC.NS",
      "KOTAKBANK.NS",
      "SBIN.NS",
      "BAJFINANCE.NS",
      "LT.NS",
      "MARUTI.NS",
      "TITAN.NS",
      "ASIANPAINT.NS",
      "HINDUNILVR.NS",
      "ITC.NS",
      "NESTLEIND.NS",
      "AXISBANK.NS",
      "TATAMOTORS.NS",
      "ULTRACEMCO.NS",
      "SUNPHARMA.NS",
      "WIPRO.NS",
      "ONGC.NS",
      "NTPC.NS",
      "POWERGRID.NS",
      "BHARTIARTL.NS",
    ].join(","),
    BSE: [
      "RELIANCE.BO",
      "TCS.BO",
      "HDFCBANK.BO",
      "ICICIBANK.BO",
      "INFY.BO",
      "HDFC.BO",
      "KOTAKBANK.BO",
      "SBIN.BO",
      "BAJFINANCE.BO",
      "LT.BO",
      "MARUTI.BO",
      "TITAN.BO",
      "ASIANPAINT.BO",
      "HINDUNILVR.BO",
      "ITC.BO",
      "NESTLEIND.BO",
      "AXISBANK.BO",
      "TATAMOTORS.BO",
      "ULTRACEMCO.BO",
      "SUNPHARMA.BO",
      "WIPRO.BO",
      "ONGC.BO",
      "NTPC.BO",
      "POWERGRID.BO",
      "BHARTIARTL.BO",
    ].join(","),
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const symbols = marketSymbols[selectedMarket];
        console.log("Fetching data for market:", selectedMarket, "with symbols:", symbols);

        // Check cache for all data
        const cachedStocks = getCachedData(`stocks_${selectedMarket}`, STOCK_CACHE_TIME);
        const cachedCryptos = getCachedData("cryptos", CRYPTO_CACHE_TIME);
        const cachedTrending = getCachedData("trending", CRYPTO_CACHE_TIME);

        // If all data is cached and fresh, use it with validation
        if (cachedStocks && cachedCryptos && cachedTrending) {
          console.log("Using cached data for all");
          setStocks(Array.isArray(cachedStocks) ? cachedStocks : []);
          setCryptos(Array.isArray(cachedCryptos) ? cachedCryptos : []);
          setTrending(Array.isArray(cachedTrending) ? cachedTrending.filter(coin => coin?.item) : []);
          setLoading(false);
          return;
        }

        // Fetch only what's not cached or expired
        const requests = [];
        if (!cachedStocks) {
          console.log("Fetching fresh stocks data");
          requests.push(axios.get(`http://localhost:5001/api/yfinance/stocks?symbols=${symbols}`));
        }
        if (!cachedTrending) {
          console.log("Fetching fresh trending data");
          requests.push(axios.get("http://localhost:5001/api/coingecko/trending"));
        }
        if (!cachedCryptos) {
          console.log("Fetching fresh cryptos data");
          requests.push(axios.get("http://localhost:5001/api/coingecko/top-cryptos"));
        }

        const responses = await Promise.all(requests);
        let stocksResponse, trendingResponse, cryptosResponse;
        if (!cachedStocks) stocksResponse = responses.shift();
        if (!cachedTrending) trendingResponse = responses.shift();
        if (!cachedCryptos) cryptosResponse = responses.shift();

        // Update state and cache with fresh data
        if (stocksResponse) {
          console.log("Stocks response data:", stocksResponse.data);
          const stocksData = Array.isArray(stocksResponse.data) ? stocksResponse.data : [];
          setStocks(stocksData);
          cacheData(`stocks_${selectedMarket}`, stocksData);
        } else if (cachedStocks) {
          setStocks(Array.isArray(cachedStocks) ? cachedStocks : []);
        }

        if (trendingResponse) {
          console.log("Trending response data:", trendingResponse.data);
          const trendingData = Array.isArray(trendingResponse.data)
            ? trendingResponse.data.filter(coin => coin?.item).slice(0, 6)
            : [];
          setTrending(trendingData);
          cacheData("trending", trendingData);
        } else if (cachedTrending) {
          setTrending(Array.isArray(cachedTrending) ? cachedTrending.filter(coin => coin?.item) : []);
        }

        if (cryptosResponse) {
          console.log("Cryptos response data:", cryptosResponse.data);
          const cryptosData = Array.isArray(cryptosResponse.data) ? cryptosResponse.data : [];
          setCryptos(cryptosData);
          cacheData("cryptos", cryptosData);
        } else if (cachedCryptos) {
          setCryptos(Array.isArray(cachedCryptos) ? cachedCryptos : []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err.message, err.response?.data);
        setError("Failed to fetch data: " + (err.message || "Unknown error"));
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMarket]);

  // Skeleton rows for loading state
  const renderSkeletonRows = (count) => {
    return Array.from({ length: count }).map((_, index) => (
      <tr key={index}>
        <td colSpan="15"><div className="skeleton-row"></div></td>
      </tr>
    ));
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h1 className="dashboard-title">Financial Markets Dashboard</h1>
        <div className="main-content">
          <div className="data-navigation">
            <button className={`nav-tab ${activeTab === "crypto" ? "active" : ""}`} onClick={() => setActiveTab("crypto")}>
              Cryptocurrencies
            </button>
            <button className={`nav-tab ${activeTab === "stocks" ? "active" : ""}`} onClick={() => setActiveTab("stocks")}>
              Stock Markets
            </button>
          </div>
          {activeTab === "stocks" && (
            <div className="market-selector">
              <select value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)}>
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
          )}
          <div className="content-wrapper">
            <div className="main-section">
              {activeTab === "crypto" ? (
                <div className="section crypto-section">
                  <h2>Top Cryptocurrencies by Market Cap</h2>
                  <div className="table-container">
                    <table className="data-table crypto-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Coin</th>
                          <th>Price</th>
                          <th>24h</th>
                          <th>7d</th>
                          <th>Market Cap</th>
                          <th>Volume</th>
                          <th>Supply</th>
                        </tr>
                      </thead>
                      <tbody>{renderSkeletonRows(10)}</tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="section stock-section">
                  <h2>Stock Market Data ({selectedMarket})</h2>
                  <div className="table-container">
                    <table className="data-table stock-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Symbol</th>
                          <th>Price</th>
                          <th>24h%</th>
                          <th>Market Cap</th>
                          <th>Volume</th>
                          <th>Prev Close</th>
                          <th>Open</th>
                          <th>Day Range</th>
                          <th>52W Range</th>
                          <th>Avg Vol</th>
                          <th>Beta</th>
                          <th>P/E</th>
                          <th>EPS</th>
                          <th>Div Yield</th>
                        </tr>
                      </thead>
                      <tbody>{renderSkeletonRows(10)}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <AIBot />
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Financial Markets Dashboard</h1>
      <div className="dashboard-container">
        <div className="sidebar">
          <div className="section trending-section">
            <h2>🔥 Top Trending Coins</h2>
            <ul className="trending-grid">
              {Array.isArray(trending) && trending.map((coin) => {
                if (!coin?.item) {
                  console.warn("Trending coin item is undefined:", coin);
                  return null; // Skip rendering invalid coins
                }
                return (
                  <li key={coin.item.id} className="trending-card">
                    <div className="coin-header">
                      <img src={coin.item.small} alt={coin.item.name} className="coin-icon-large" />
                      <div>
                        <span className="coin-name">{coin.item.name}</span>
                        <span className="coin-symbol">({coin.item.symbol.toUpperCase()})</span>
                      </div>
                    </div>
                    <p className="coin-market-cap">Market Cap Rank: #{coin.item.market_cap_rank}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="main-content">
          <div className="data-navigation">
            <button className={`nav-tab ${activeTab === "crypto" ? "active" : ""}`} onClick={() => setActiveTab("crypto")}>
              Cryptocurrencies
            </button>
            <button className={`nav-tab ${activeTab === "stocks" ? "active" : ""}`} onClick={() => setActiveTab("stocks")}>
              Stock Markets
            </button>
          </div>
          {activeTab === "stocks" && (
            <div className="market-selector">
              <select value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)}>
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
          )}
          <div className="content-wrapper">
            <div className="main-section">
              {activeTab === "crypto" ? (
                <div className="section crypto-section">
                  <h2>Top Cryptocurrencies by Market Cap</h2>
                  <div className="table-container">
                    <table className="data-table crypto-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Coin</th>
                          <th>Price</th>
                          <th>24h</th>
                          <th>7d</th>
                          <th>Market Cap</th>
                          <th>Volume</th>
                          <th>Supply</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(cryptos) && cryptos.map((crypto, index) => (
                          <CryptoRow key={crypto.id} crypto={crypto} index={index} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="section stock-section">
                  <h2>Stock Market Data ({selectedMarket})</h2>
                  <div className="table-container">
                    <table className="data-table stock-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Symbol</th>
                          <th>Price</th>
                          <th>24h%</th>
                          <th>Market Cap</th>
                          <th>Volume</th>
                          <th>Prev Close</th>
                          <th>Open</th>
                          <th>Day Range</th>
                          <th>52W Range</th>
                          <th>Avg Vol</th>
                          <th>Beta</th>
                          <th>P/E</th>
                          <th>EPS</th>
                          <th>Div Yield</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(stocks) && stocks.length > 0 ? (
                          stocks.map((stock, index) => (
                            <StockRow key={stock.symbol} stock={stock} index={index} />
                          ))
                        ) : (
                          <tr>
                            <td colSpan="15">No stock data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <AIBot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;