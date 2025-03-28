import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Market.css"; // Ensure your CSS file is imported

const Market = () => {
  const [news, setNews] = useState([]); // State for news data
  const [error, setError] = useState(null); // State for error messages
  const [loading, setLoading] = useState(true); // State for loading indicator

  // Function to retrieve cached news from localStorage
  const getCachedNews = () => {
    try {
      const cached = localStorage.getItem("stockNews");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error parsing cached news:", e);
    }
    return null;
  };

  // Function to save news to localStorage
  const saveNewsToCache = (news) => {
    if (Array.isArray(news)) {
      localStorage.setItem("stockNews", JSON.stringify(news));
    }
  };

  useEffect(() => {
    // Check for cached news on mount
    const cachedNews = getCachedNews();
    if (cachedNews) {
      setNews(cachedNews);
      setLoading(false); // Display cached data immediately
    } else {
      setLoading(true); // Show loading if no cache exists
    }

    // Fetch fresh news from the API
    const fetchNews = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/stock-news");
        setNews(response.data); // Update state with fresh data
        saveNewsToCache(response.data); // Cache the fresh data
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load latest news"); // Set error message
      } finally {
        if (!cachedNews) {
          setLoading(false); // Hide loading only if no cache was used initially
        }
      }
    };

    fetchNews(); // Trigger the fetch
  }, []); // Empty dependency array ensures this runs only on mount

  return (
    <div className="market-container">
      <h1 className="market-header">Latest Market News</h1>

      {/* Display loading message only when fetching without cache */}
      {loading && <p className="loading-message">Loading...</p>}

      {/* Display error message, adjusted based on news availability */}
      {error && (
        <p className="error-message">
          {news.length > 0 ? "Failed to load latest news" : "Failed to load news"}
        </p>
      )}

      {/* Render news grid with available data */}
      <div className="news-grid">
        {news.map((item, index) => (
          <div key={index} className="news-card">
            <div className="news-content">
              <h3 className="news-title">{item.title}</h3>
              <p className="news-summary">{item.summary}</p>
              <div className="news-footer">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-link"
                >
                  Read more →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Market;