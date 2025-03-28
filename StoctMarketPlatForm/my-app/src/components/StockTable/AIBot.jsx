import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./TradingChatbot.css";

const AIBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messageListRef = useRef(null);

  // Initialize Google Gemini
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      text: input.toUpperCase(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const formattedSymbol = input.toUpperCase().replace(":", ".");
      const analysis = await generateGeminiAnalysis(formattedSymbol);

      const cleanedAnalysis = cleanAnalysis(analysis);
      const responseMessage = {
        text: formatGeminiResponse(formattedSymbol, cleanedAnalysis),
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, responseMessage]);
    } catch (error) {
      const errorMessage = {
        text: `<div class="error">
                <h3>Error: ${error.message}</h3>
                <p>Please ensure you entered a valid stock symbol in the format:</p>
                <ul>
                  <li>RELIANCE.NSE</li>
                  <li>TCS.BSE</li>
                  <li>INFY.NSE</li>
                </ul>
              </div>`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsProcessing(false);
  };

  // Generate analysis using Gemini API
  const generateGeminiAnalysis = async (symbol) => {
    const prompt = `
      You are a professional stock market analyst specializing in Indian markets. Analyze the stock symbol "${symbol}" and provide detailed insights including:
      
      1. Company overview
      2. Business segments
      3. Industry position
      4. Financial health
      5. Growth drivers
      6. Risk factors
      7. Recent developments
      8. ESG factors
      9. Analyst outlook (12-18 months)
      
      Format the response as follows:
      - Use clear headings for each section
      - Provide concise but comprehensive information
      - Use bullet points where appropriate
      - Include relevant financial metrics
      - Provide a professional and informative tone
      
      If the symbol is invalid or data is unavailable, clearly state so.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  };

  // Clean the analysis by removing unwanted formatting characters
  const cleanAnalysis = (analysis) => {
    // Remove multiple newlines
    let cleaned = analysis.replace(/\n{2,}/g, "\n");
    // Remove asterisks used for formatting
    cleaned = cleaned.replace(/\*/g, "");
    // Remove hash symbols used for formatting
    cleaned = cleaned.replace(/#/g, "");
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, " ");
    return cleaned;
  };

  // Format Gemini's response for display
  const formatGeminiResponse = (symbol, analysis) => {
    // Split the analysis into sections based on common separators
    const sections = analysis.split(/\n\s*\n/);
    
    return `
      <div class="stock-analysis">
        <div class="header">
          <h3>${symbol}</h3>
          <p class="timestamp">${new Date().toLocaleString()}</p>
        </div>
        
        <div class="company-overview">
          <h4>Company Overview</h4>
          <p>${sections[0] || "Overview not available"}</p>
        </div>
        
        <div class="business-segments">
          <h4>Business Segments</h4>
          <p>${sections[1] || "Business segments not available"}</p>
        </div>
        
        <div class="industry-position">
          <h4>Industry Position</h4>
          <p>${sections[2] || "Industry position not available"}</p>
        </div>
        
        <div class="financial-health">
          <h4>Financial Health</h4>
          <p>${sections[3] || "Financial health not available"}</p>
        </div>
        
        <div class="growth-drivers">
          <h4>Growth Drivers</h4>
          <p>${sections[4] || "Growth drivers not available"}</p>
        </div>
        
        <div class="risk-factors">
          <h4>Risk Factors</h4>
          <p>${sections[5] || "Risk factors not available"}</p>
        </div>
        
        <div class="recent-developments">
          <h4>Recent Developments</h4>
          <p>${sections[6] || "Recent developments not available"}</p>
        </div>
        
        <div class="esg-factors">
          <h4>ESG Factors</h4>
          <p>${sections[7] || "ESG factors not available"}</p>
        </div>
        
        <div class="analyst-outlook">
          <h4>Analyst Outlook (12-18 months)</h4>
          <p>${sections[8] || "Analyst outlook not available"}</p>
        </div>
        
        <div class="disclaimer">
          <p>Analysis provided by Gemini AI • For informational purposes only</p>
          <p>This is not financial advice. Always conduct your own research before making investment decisions.</p>
        </div>
      </div>
    `;
  };

  return (
    <div className="trading-chatbot">
      <div className="chat-header">
        <h2>Live Market Analyst</h2>
        <div className="market-status">
          <span className="live-dot"></span>
          LIVE - NSE/BSE
        </div>
      </div>

      <div className="chat-container" ref={messageListRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isUser ? "user" : "ai"}`}>
            {msg.isUser ? (
              <div className="user-bubble">{msg.text}</div>
            ) : (
              <div className="analysis-response">
                <div className="response-header">
                  <span className="timestamp">{msg.timestamp}</span>
                  <span className="data-source">Gemini AI Analysis</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <span>Analyzing live market data...</span>
          </div>
        )}
      </div>

      <form className="input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter symbol (e.g., TCS.NSE, RELIANCE.BSE)"
          disabled={isProcessing}
        />
        <button type="submit" disabled={isProcessing}>
          Analyze
        </button>
      </form>
    </div>
  );
};

export default AIBot;