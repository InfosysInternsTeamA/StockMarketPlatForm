const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';

export const fetchStockPrice = async (symbol) => {
  try {
    const response = await fetch(`${BASE_URL}${symbol}.NS?interval=1d`);
    const data = await response.json();
    
    if (data.chart.result) {
      const quote = data.chart.result[0].meta;
      return {
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        volume: quote.regularMarketVolume
      };
    }
    throw new Error('No data available');
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
};
