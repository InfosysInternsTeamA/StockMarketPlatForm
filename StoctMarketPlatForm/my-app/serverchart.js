// serverchart.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
const port = 8000;

// Batch stock endpoint
app.get("/api/yfinance/stocks", async (req, res) => {
  try {
    const symbols = req.query.symbols.split(",");
    const range = req.query.range || "1d";

    const requests = symbols.map((symbol) =>
      axios.get(
        `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}`
      )
    );

    const responses = await Promise.allSettled(requests);

    const data = responses.map((response, index) => {
      console.log(`Response for ${symbols[index]}:`, response); // Log the response
      if (response.status === "rejected")
        return { symbol: symbols[index], error: true };

      const result = response.value.data.chart.result[0];
      const lastClose = result.indicators.quote[0].close.length - 1;
      return {
        symbol: symbols[index],
        price: result.indicators.quote[0].close[lastClose],
        previousClose: result.meta.chartPreviousClose,
      };
    });

    res.json(data);
  } catch (error) {
    console.error("Batch request failed:", error); // Log any errors
    res.status(500).json({ error: "Batch request failed" });
  }
});

// Chart endpoint (no changes needed here for this issue)
app.get("/api/yfinance/chart/:symbol", async (req, res) => {
  try {
    const response = await axios.get(
      `https://query2.finance.yahoo.com/v8/finance/chart/${req.params.symbol}?interval=1d&range=1mo`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Chart data fetch failed" });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
