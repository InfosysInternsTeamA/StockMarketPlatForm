const express = require("express");
const axios = require("axios");
const cors = require("cors");
const NodeCache = require("node-cache");

const app = express();
const port = 5000;
app.use(cors());

const stockCache = new NodeCache({ stdTTL: 300 }); // 5-minute cache

// Create a persistent session for Yahoo
const yahooSession = axios.create();

// Initialize Yahoo session: retrieve cookie and crumb
async function initializeYahooSession() {
  try {
    // Request the page to get cookies
    await yahooSession.get("https://finance.yahoo.com/quote/RELIANCE.NS", { headers: { "User-Agent": "Mozilla/5.0" } });
    // Request to get crumb
    const crumbResponse = await yahooSession.get("https://query1.finance.yahoo.com/v1/test/getcrumb", { headers: { "User-Agent": "Mozilla/5.0" } });
    yahooSession.defaults.params = { crumb: crumbResponse.data };
    console.log("Yahoo session initialized with crumb:", crumbResponse.data);
  } catch (error) {
    console.error("Failed to initialize Yahoo session:", error.message);
  }
}
initializeYahooSession();

app.get("/api/yfinance/stock/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    // Use symbol as sent (the frontend will send with .NS suffix)
    const cacheKey = symbol;
    const cachedData = stockCache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    // Yahoo API request using persistent yahooSession
    const response = await yahooSession.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      params: { interval: "1d", range: "1d" },
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json"
      },
      timeout: 15000
    });

    if (!response.data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      throw new Error("Invalid data format from Yahoo");
    }

    // Cache and return data directly (or reformat as desired)
    stockCache.set(cacheKey, response.data);
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    return res.status(500).json({ 
      error: "Failed to fetch stock data", 
      details: error.message 
    });
  }
});

app.get("/health", (req, res) => res.status(200).send("OK"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});