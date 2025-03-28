import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

const portfolioService = {
    addAsset: (portfolioId, asset) => {
        return axios.post(`${API_URL}/portfolios/${portfolioId}/assets`, {
          symbol: asset.symbol,
          holdings: Number(asset.holdings),  // Ensure numeric type
          avgBuy: Number(asset.avgBuy)      // Ensure numeric type
        });
      },
      getUserPortfolios: (userId) => {
        return axios.get(`${API_URL}/portfolios?userId=${userId}`).then(res => res.data);
      },
  
  createPortfolio: (portfolio) => {
    return axios.post(`${API_URL}/portfolios`, portfolio).then((res) => res.data);
  },
  getPortfolioById: (portfolioId) => {
    return axios.get(`${API_URL}/portfolios/${portfolioId}`).then((res) => res.data);
  },
  updatePortfolio: (portfolio) => {
    return axios.put(`${API_URL}/portfolios/${portfolio.id}`, portfolio).then((res) => res.data);
  },
  removeAsset: (portfolioId, symbol) => {
    return axios.delete(`${API_URL}/portfolios/${portfolioId}/assets/${symbol}`).then((res) => res.data);
  },
  recordTransaction: (portfolioId, transaction) => {
    return axios.post(`${API_URL}/portfolios/${portfolioId}/transactions`, transaction).then((res) => res.data);
  },
};

export default portfolioService;