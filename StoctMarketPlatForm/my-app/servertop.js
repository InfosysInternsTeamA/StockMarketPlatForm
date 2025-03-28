const express = require("express");
const yahooFinance = require("yahoo-finance2").default;
const cors = require("cors");
const NodeCache = require("node-cache");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());

// Rate limiting for CoinGecko
const coinGeckoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  message: { error: "CoinGecko rate limit exceeded. Please wait 60 seconds." },
  headers: true,
});

// Rate limiting for clients
const clientLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please slow down and try again." },
  headers: true,
});

app.use(clientLimiter);

// Caching setup
const stockCache = new NodeCache({ stdTTL: 600 }); // 10 minutes
const coingeckoCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

// Helper function for nested properties
const getNestedValue = (obj, path, defaultValue) =>
  path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);

// Enhanced fetch with retry for CoinGecko
const fetchWithRetry = async (url, maxRetries = 2) => {
  let attempts = 0;
  while (attempts <= maxRetries) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: { "User-Agent": "YourApp/1.0 (contact@yourapp.com)", "Accept-Encoding": "gzip" },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers["retry-after"] || 30;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        attempts++;
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries reached");
};

// Stock data endpoint with symbol validation and enhanced data fetching
app.get("/api/yfinance/stocks", async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      console.log("No symbols provided in request");
      return res.status(400).json({ error: "Symbols parameter is required" });
    }

    const symbolList = symbols.split(",");
    console.log("Processing symbols:", symbolList);

    // Validate symbols
    const invalidSymbols = symbolList.filter((s) => !/^[a-zA-Z0-9.]+$/.test(s));
    if (invalidSymbols.length > 0) {
      console.log("Invalid symbols detected:", invalidSymbols);
      return res.status(400).json({ error: `Invalid symbols: ${invalidSymbols.join(", ")}` });
    }

    const results = [];
    for (const symbol of symbolList) {
      const cacheKey = symbol;
      let stockData = stockCache.get(cacheKey);

      if (!stockData) {
        console.log(`Fetching fresh stock data for ${symbol}`);
        try {
          const quote = await yahooFinance.quote(symbol);
          console.log(`Raw quote data for ${symbol}:`, JSON.stringify(quote, null, 2));

          // Use fallback fields for avgVolume and dividendYield
          const avgVolume =
            getNestedValue(quote, "averageDailyVolume3Month", null) ||
            getNestedValue(quote, "averageDailyVolume10Day", null) ||
            null;

          let dividendYield = getNestedValue(quote, "dividendYield", null);
          if (dividendYield === null) {
            const trailingDividend = getNestedValue(quote, "trailingAnnualDividendYield", null);
            dividendYield = trailingDividend ? trailingDividend * 100 : null; // Convert to percentage
          } else if (dividendYield < 1) {
            dividendYield = dividendYield * 100; // Convert to percentage if in decimal form
          }

          stockData = {
            symbol: getNestedValue(quote, "symbol", symbol),
            price: getNestedValue(quote, "regularMarketPrice", null),
            previousClose: getNestedValue(quote, "regularMarketPreviousClose", null),
            open: getNestedValue(quote, "regularMarketOpen", null),
            dayLow: getNestedValue(quote, "regularMarketDayLow", null),
            dayHigh: getNestedValue(quote, "regularMarketDayHigh", null),
            yearLow: getNestedValue(quote, "fiftyTwoWeekLow", null),
            yearHigh: getNestedValue(quote, "fiftyTwoWeekHigh", null),
            marketCap: getNestedValue(quote, "marketCap", null),
            volume: getNestedValue(quote, "regularMarketVolume", null),
            avgVolume: avgVolume,
            beta: getNestedValue(quote, "beta", null),
            peRatio: getNestedValue(quote, "trailingPE", null),
            eps: getNestedValue(quote, "epsTrailingTwelveMonths", null),
            dividendYield: dividendYield,
            exDividendDate: getNestedValue(quote, "exDividendDate", null),
            currency: getNestedValue(quote, "currency", "USD"),
            percentChange24h: getNestedValue(quote, "regularMarketChangePercent", null),
          };

          // Calculate percentChange24h if not provided
          if (stockData.percentChange24h === null && stockData.price && stockData.previousClose) {
            stockData.percentChange24h = ((stockData.price - stockData.previousClose) / stockData.previousClose) * 100;
          }

          // Warn if critical fields are still missing
          if (stockData.avgVolume === null) {
            console.warn(`Average volume data unavailable for ${symbol}`);
          }
          if (stockData.dividendYield === null) {
            console.warn(`Dividend yield data unavailable for ${symbol}`);
          }

          stockCache.set(cacheKey, stockData);
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error.message);
          results.push({ symbol, error: "Data unavailable" });
          continue;
        }
      } else {
        console.log(`Using cached stock data for ${symbol}:`, stockData);
      }

      results.push(stockData);
    }

    console.log("Sending stock data:", results);
    return res.json(results);
  } catch (error) {
    console.error("Error in /api/yfinance/stocks endpoint:", error.message);
    return res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// Trending stocks (mock data)
app.get("/api/yfinance/trending", async (req, res) => {
  try {
    const cacheKey = "trending";
    let trendingData = stockCache.get(cacheKey);
    if (!trendingData) {
      trendingData = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"];
      stockCache.set(cacheKey, trendingData);
    }
    console.log("Sending trending data:", trendingData);
    return res.json(trendingData);
  } catch (error) {
    console.error("Error fetching trending stocks:", error.message);
    return res.status(500).json({ error: "Failed to fetch trending stocks" });
  }
});

// News (mock data)
app.get("/api/yfinance/news", async (req, res) => {
  try {
    const cacheKey = "news";
    let newsData = stockCache.get(cacheKey);
    if (!newsData) {
      newsData = {
        timestamp: new Date().toISOString(),
        items: [
          { title: "Stock Market Update", summary: "Major indices up this week", link: "https://example.com/news1" },
          { title: "Tech Sector Growth", summary: "Strong earnings reported", link: "https://example.com/news2" },
        ],
      };
      stockCache.set(cacheKey, newsData);
    }
    console.log("Sending news data:", newsData);
    return res.json(newsData);
  } catch (error) {
    console.error("Error fetching news:", error.message);
    return res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Trending coins from CoinGecko
app.get("/api/coingecko/trending", coinGeckoLimiter, async (req, res) => {
  try {
    const cacheKey = "trending-coins";
    const cached = coingeckoCache.get(cacheKey);
    if (cached) {
      console.log("Sending cached trending coins:", cached);
      return res.json(cached);
    }
    const response = await fetchWithRetry("https://api.coingecko.com/api/v3/search/trending");
    console.log("Fetched trending coins:", response);
    coingeckoCache.set(cacheKey, response.coins);
    res.json(response.coins);
  } catch (error) {
    console.error("Error fetching trending coins:", error.message);
    return res.status(error.response?.status === 429 ? 429 : 500).json({
      error: error.response?.status === 429 ? "Rate limit exceeded" : "Failed to fetch trending coins",
    });
  }
});

// Top cryptocurrencies from CoinGecko
app.get("/api/coingecko/top-cryptos", coinGeckoLimiter, async (req, res) => {
  try {
    const cacheKey = "top-cryptos";
    const cached = coingeckoCache.get(cacheKey);
    if (cached) {
      console.log("Sending cached top cryptos:", cached);
      return res.json(cached);
    }
    const data = await fetchWithRetry(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false"
    );
    console.log("Fetched top cryptos:", data);
    coingeckoCache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching top cryptos:", error.message);
    return res.status(error.response?.status === 429 ? 429 : 500).json({
      error: error.response?.status === 429 ? "Rate limit exceeded" : "Failed to fetch top cryptos",
    });
  }
});

// Health check
app.get("/health", (req, res) => res.status(200).send("OK"));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.listen(port, () => console.log(`Server running on port ${port}`));