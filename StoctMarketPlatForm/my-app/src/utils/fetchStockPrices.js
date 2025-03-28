import axios from 'axios';

const fetchStockPrice = async (symbol, exchange) => {
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.${exchange === 'NSE' ? 'NS' : 'BO'}?range=1d&interval=1m`);
    
    if (response.data.chart.result) {
      const result = response.data.chart.result[0];
      const lastPrice = result.meta.regularMarketPrice;
      return lastPrice;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
};

export default fetchStockPrice;
