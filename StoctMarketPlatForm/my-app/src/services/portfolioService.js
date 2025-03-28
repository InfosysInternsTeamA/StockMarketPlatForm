import axios from "axios";

const API_URL = "http://localhost:8081/api/portfolios";

const portfolioService = {
  createPortfolio: async (portfolio) => {
    try {
      const response = await axios.post(API_URL, portfolio, {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Replace with actual credentials
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating portfolio:", error);
      throw error;
    }
  },

  getUserPortfolios: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Replace with actual credentials
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user portfolios:", error);
      throw error;
    }
  },

  getPortfolioById: async (portfolioId) => {
    try {
      const response = await axios.get(`${API_URL}/${portfolioId}`, {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Replace with actual credentials
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching portfolio by ID:", error);
      throw error;
    }
  },

  updatePortfolio: async (portfolio) => {
    try {
      const response = await axios.put(
        `${API_URL}/${portfolio._id}`,
        portfolio,
        {
          headers: {
            Authorization: `Bearer YOUR_API_KEY`, // Replace with actual credentials
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating portfolio:", error);
      throw error;
    }
  },

  addAsset: async (portfolioId, asset) => {
    try {
      const response = await axios.post(
        `${API_URL}/${portfolioId}/assets`,
        asset,
        {
          headers: {
            Authorization: `Bearer YOUR_API_KEY`, // Replace with actual credentials
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding asset:", error);
      throw error;
    }
  },

  recordTransaction: async (portfolioId, transaction) => {
    try {
      const response = await axios.post(
        `${API_URL}/${portfolioId}/transactions`,
        transaction,
        {
          headers: {
            Authorization: `Bearer YOUR_API_KEY`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error recording transaction:", error);
      throw error;
    }
  },

  removeAsset: async (portfolioId, symbol) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${portfolioId}/assets/${symbol}`,
        {
          headers: {
            Authorization: `Bearer YOUR_API_KEY`, // Replace with actual credentials
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error removing asset:", error);
      throw error;
    }
  },

  deletePortfolio: async (portfolioId) => {
    try {
      await axios.delete(`${API_URL}/${portfolioId}`, {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`, // Replace with actual credentials
        },
      });
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      throw error;
    }
  },
};

export default portfolioService;
