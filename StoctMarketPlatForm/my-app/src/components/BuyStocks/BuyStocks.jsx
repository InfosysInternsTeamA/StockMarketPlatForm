import axios from "axios";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import "./BuyStocks.css";

Chart.register(...registerables);

// Sample company data with Upstox and Zerodha trading URLs
const UPSTOX_NIFTY_50 = [
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank Ltd.", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/KOTAKBANK/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "ITC.NS", name: "ITC Ltd.", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/ITC/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd.", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/RELIANCE/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd.", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/HDFCBANK/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "INFY.NS", name: "Infosys Ltd.", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/INFY/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "TCS.NS", name: "Tata Consultancy Services Ltd.", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/TCS/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever Ltd.", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/HINDUNILVR/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd.", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/ICICIBANK/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/SBIN/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "LT.NS", name: "Larsen & Toubro Ltd.", exchange: "NSE", upstoxUrl: "https://pro.upstox.com/stocks/LT/NSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null }
];

const BSE_COMPANIES = [
  { symbol: "KOTAKBANK.BO", name: "Kotak Mahindra Bank Ltd.", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/KOTAKBANK/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "ITC.BO", name: "ITC Ltd.", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/ITC/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "RELIANCE.BO", name: "Reliance Industries Ltd.", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/RELIANCE/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "HDFCBANK.BO", name: "HDFC Bank Ltd.", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/HDFCBANK/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "INFY.BO", name: "Infosys Ltd.", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/INFY/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "TCS.BO", name: "Tata Consultancy Services Ltd.", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/TCS/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "HINDUNILVR.BO", name: "Hindustan Unilever Ltd.", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/HINDUNILVR/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "ICICIBANK.BO", name: "ICICI Bank Ltd.", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/ICICIBANK/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "SBIN.BO", name: "State Bank of India", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/SBIN/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null },
  { symbol: "LT.BO", name: "Larsen & Toubro Ltd.", exchange: "BSE", upstoxUrl: "https://pro.upstox.com/stocks/LT/BSE", zerodhaUrl: "https://kite.zerodha.com/dashboard", price: null }
];

// Debounce utility to prevent rapid state updates
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const BuyStocks = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exchange, setExchange] = useState("NSE"); // Default to NSE
  const [selectedCompany, setSelectedCompany] = useState(null); // Track selected company
  const [chartSymbol, setChartSymbol] = useState(""); // Symbol for chart (index or company)
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const navigate = useNavigate();
  const [tradingAccount, setTradingAccount] = useState("upstox"); // Default to Upstox
  const [notification, setNotification] = useState(null);

  const yahooSymbols = { NSE: "^NSEI", BSE: "^BSESN" };

  // Initialize chartSymbol with default exchange on mount
  useEffect(() => {
    setChartSymbol(yahooSymbols[exchange]);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Update chartSymbol when exchange or selectedCompany changes
  useEffect(() => {
    if (selectedCompany) {
      setChartSymbol(selectedCompany.symbol);
    } else {
      setChartSymbol(yahooSymbols[exchange]);
    }
  }, [selectedCompany, exchange]);

  // Fetch stock data for company prices
  const fetchStockData = useCallback(async (symbols) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/yfinance/stocks?symbols=${symbols.join(",")}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return [];
    }
  }, []);

  // Define updateChart before fetchChartData to prevent initialization error
  const updateChart = useCallback((labels, prices) => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      const chartLabel = selectedCompany ? selectedCompany.name : `${exchange} Index`;

      if (chartInstance.current) {
        // Update existing chart
        chartInstance.current.data.labels = labels;
        chartInstance.current.data.datasets[0].data = prices;
        chartInstance.current.data.datasets[0].label = chartLabel;
        chartInstance.current.update();
      } else {
        // Create new chart instance
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: chartLabel,
                data: prices,
                borderColor: "#4bc0c0",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.1,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: false } },
          },
        });
      }
    }
  }, [selectedCompany, exchange]);

  // Fetch chart data with caching
  const fetchChartData = useCallback(async () => {
    const cacheKey = `chartData-${chartSymbol}`;
    const cachedChartData = localStorage.getItem(cacheKey);
    if (cachedChartData) {
      const { labels, prices } = JSON.parse(cachedChartData);
      setChartData({ labels, prices });
      updateChart(labels, prices);
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/yfinance/chart/${chartSymbol}`
      );
      const result = response.data?.chart?.result?.[0];
      const timestamps = result.timestamp;
      const prices = result.indicators.quote[0].close;
      const labels = timestamps.map((ts) => new Date(ts * 1000).toLocaleDateString());

      setChartData({ labels, prices });
      updateChart(labels, prices);
      localStorage.setItem(cacheKey, JSON.stringify({ labels, prices }));
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  }, [chartSymbol, updateChart]);

  // Update stock prices with caching and handle missing data
  const updatePrices = useCallback(async () => {
    const cacheKey = `stocks-${exchange}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      setCompanies(JSON.parse(cachedData));
    }

    setLoading(true);
    const companiesToFetch = exchange === "NSE" ? UPSTOX_NIFTY_50 : BSE_COMPANIES;
    const symbols = companiesToFetch.map((c) => c.symbol);
    const batchData = await fetchStockData(symbols);

    const updatedCompanies = companiesToFetch.map((company) => {
      const data = batchData.find((d) => d?.symbol === company.symbol);
      if (!data || data.error) return { ...company, price: null, change: null, changePercent: null };

      const price = data.price;
      const previousClose = data.previousClose;

      if (price == null || previousClose == null) {
        return { ...company, price: null, change: null, changePercent: null };
      }

      const change = price - previousClose;
      const changePercent = (change / previousClose) * 100;

      return { ...company, price, change, changePercent };
    });

    setCompanies(updatedCompanies);
    localStorage.setItem(cacheKey, JSON.stringify(updatedCompanies));
    setLoading(false);
  }, [exchange, fetchStockData]);

  // Handler functions
  const handleBuyStock = (company) => {
    const url =
      tradingAccount === "upstox"
        ? company.upstoxUrl
        : company.zerodhaUrl;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleExchangeChange = (event) => {
    setExchange(event.target.value);
    setCompanies([]);
  };

  const handleTradingAccountChange = (account) => {
    setTradingAccount(account);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Fetch prices when exchange changes
  useEffect(() => {
    updatePrices();
  }, [exchange, updatePrices]);

  // Fetch chart data when chartSymbol changes
  useEffect(() => {
    fetchChartData();
  }, [chartSymbol, fetchChartData]);

  // Handle exchange change and reset selected company
  const handleExchangeChangeDebounced = debounce((value) => {
    setExchange(value);
    setSelectedCompany(null); // Reset selected company
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  }, 300);

  // Main render
  return (
    <div className="trading-platform-container">
      <div className="platform-header">
        <h2>Equity Trading Platform</h2>
        <div className="exchange-selector">
          <label htmlFor="exchange">Exchange:</label>
          <select
            id="exchange"
            value={exchange}
            onChange={(e) => handleExchangeChangeDebounced(e.target.value)}
          >
            <option value="NSE">NSE (India)</option>
            <option value="BSE">BSE (India)</option>
          </select>
        </div>
        <div className="trading-account-selector">
          <label htmlFor="tradingAccount">Trading Account:</label>
          <select
            id="tradingAccount"
            value={tradingAccount}
            onChange={(e) => handleTradingAccountChange(e.target.value)}
          >
            <option value="upstox">Upstox</option>
            <option value="zerodha">Zerodha</option>
          </select>
        </div>
      </div>

      <div className="instrument-grid">
        <div className="market-overview">
          <h3>{exchange} Components</h3>
          {loading && !companies.length && !chartData ? (
            <div>Loading stocks and chart...</div>
          ) : (
            <div className="instrument-list">
              {companies.map((company) => (
                <div
                  key={company.symbol}
                  className={`instrument-card ${
                    selectedCompany && selectedCompany.symbol === company.symbol ? "selected" : ""
                  }`}
                  onClick={() => setSelectedCompany(company)}
                >
                  <div className="instrument-info">
                    <div className="instrument-symbol">{company.symbol}</div>
                    <div className="instrument-name">{company.name}</div>
                  </div>
                  <div className="instrument-details">
                    <div className="instrument-price">
                      ₹{company.price != null ? company.price.toFixed(2) : "N/A"}
                    </div>
                    <div
                      className={`price-change ${
                        company.change > 0 ? "positive" : company.change < 0 ? "negative" : "neutral"
                      }`}
                    >
                      {company.changePercent != null ? `${company.changePercent.toFixed(2)}%` : "N/A"}
                      <span className="info-icon" title="Percentage change from previous close">
                        <FaInfoCircle />
                      </span>
                    </div>
                    <button
                      className="trade-button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering company selection
                        handleBuyStock(company);
                      }}
                    >
                      Trade <FaExternalLinkAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="trading-widget">
          <div className="chart-header">
            <h3>
              {selectedCompany ? `Chart for ${selectedCompany.name}` : `${exchange} Index`}
            </h3>
            {selectedCompany && (
              <button onClick={() => setSelectedCompany(null)}>Back to Index Chart</button>
            )}
          </div>
          <div id="chart-container" style={{ height: "500px", width: "100%" }}>
            {chartData ? (
              <canvas ref={chartRef} id="stockChart" />
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                Loading chart data...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <p>Powered by official brokerage APIs. Trading subject to market risks.</p>
        <div className="broker-links">
          <a href="https://financialmodelingprep.com/" target="_blank" rel="noopener noreferrer">
            Financial Modeling Prep
          </a>
        </div>
      </div>
      {notification && (
        <div className="notification">
          <p>{notification}</p>
          <button onClick={handleCloseNotification}>Close</button>
        </div>
      )}
    </div>
  );
};

export default BuyStocks;