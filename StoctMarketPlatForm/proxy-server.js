const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

const ALPHA_VANTAGE_API_KEY = "7Y6V3SBWNQV07VD4"; // Replace with your actual API key

app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const apiKey = ALPHA_VANTAGE_API_KEY;
  const functionType = 'GLOBAL_QUOTE';
  const url = `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });

    if (response.data && response.data['Global Quote']) {
      const quote = response.data['Global Quote'];
      const price = quote['05. price'];
      res.json({ chart: { result: [{ meta: { regularMarketPrice: price } }] } });
    } else {
      console.warn('No data found for symbol:', symbol);
      res.status(404).json({ error: 'No data found for the given symbol' });
    }
  } catch (error) {
    console.error('Error fetching data from Alpha Vantage API:', error);
    res.status(500).json({
      error: 'Failed to fetch stock data',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
