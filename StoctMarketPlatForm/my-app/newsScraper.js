const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");
const cheerio = require("cheerio");

const app = express();
const parser = new Parser();

// Enable CORS to allow requests from the frontend (http://localhost:3000)
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Middleware to parse JSON requests (if needed)
app.use(express.json());

// Function to fetch and parse news from Yahoo Finance RSS
const fetchNews = async () => {
  try {
    const feed = await parser.parseURL("https://finance.yahoo.com/news/rss");
    return feed.items.map((item) => {
      const content = item.description || ""; // Fallback to empty string if description is missing
      const $ = cheerio.load(content); // Parse the content with Cheerio
      const imgSrc = $("img").attr("src"); // Extract image source if present
      const contentText = $.text().trim(); // Extract text content
      return {
        title: item.title,
        summary: contentText,
        link: item.link,
        image: imgSrc || null, // Use null if no image is found
      };
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    return [];
  }
};

// Stock news API endpoint
app.get("/api/stock-news", async (req, res) => {
  try {
    const news = await fetchNews();
    res.json(news);
  } catch (error) {
    console.error("Error in /api/stock-news:", error);
    res.status(500).send("Server error");
  }
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
app.listen(3001, () => {
  console.log("Server running on port 3001");
});