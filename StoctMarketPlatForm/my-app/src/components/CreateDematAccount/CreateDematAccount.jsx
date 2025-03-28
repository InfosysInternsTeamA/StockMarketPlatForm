import React from "react";
import { FaClock, FaRupeeSign, FaShieldAlt, FaUserPlus } from "react-icons/fa";
import "./CreateDematAccount.css";

const CreateDematAccount = () => {
  const handleUpstoxAccount = () => {
    window.open("https://upstox.com/open-account/", "_blank", "noopener,noreferrer");
  };

  const handleZerodhaAccount = () => {
    window.open("https://zerodha.com/open-account/", "_blank", "noopener,noreferrer");
  };

  const features = [
    {
      icon: <FaUserPlus />,
      title: "Quick Account Opening",
      description: "Open your demat account in just 10 minutes with paperless KYC",
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure & Reliable",
      description: "SEBI registered, trusted by millions of investors",
    },
    {
      icon: <FaRupeeSign />,
      title: "Low Brokerage",
      description: "Competitive brokerage rates and zero account maintenance charges",
    },
    {
      icon: <FaClock />,
      title: "Instant Access",
      description: "Start trading immediately after account activation",
    },
  ];

  return (
    <div className="demat-container">
      <div className="broker-sections-container">
        {/* Upstox Section */}
        <div className="broker-section upstox">
          <div className="demat-header">
            <h1>Open Your Demat Account</h1>
            <p>Start your investment journey with Upstox</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="cta-section">
            <h2>Ready to Start Trading?</h2>
            <p>Open your demat account with Upstox in minutes</p>
            <button onClick={handleUpstoxAccount} className="open-account-button upstox">
              Open Upstox Account
            </button>
          </div>
        </div>

        {/* Zerodha Section */}
        <div className="broker-section zerodha">
          <div className="demat-header">
            <h1>Trade with Zerodha</h1>
            <p>India's biggest stock broker offering the best trading platform</p>
          </div>

          <div className="video-container">
            <iframe
              src="https://www.youtube.com/embed/Y__a4UxNU10?si=Rq2MN0LhI034dmPj"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="zerodha-features">
            <h3 style={{ fontWeight: "bold", color: "#333" }}>Why Choose Zerodha?</h3>
            <ul>
              <li>₹0 equity delivery investments</li>
              <li>₹20 flat per executed order for all other segments</li>
              <li>Cutting-edge trading platforms</li>
              <li>Instant account opening</li>
            </ul>
          </div>

          <div className="cta-section">
            <h2>Open Your Zerodha Account</h2>
            <p>Start trading with India's largest broker</p>
            <button onClick={handleZerodhaAccount} className="open-account-button zerodha">
              Open Zerodha Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDematAccount;
