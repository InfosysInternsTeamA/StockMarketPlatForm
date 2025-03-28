import React, { useEffect } from "react";
import {
  FaClock,
  FaRupeeSign,
  FaShieldAlt,
  FaUserPlus,
  FaWallet,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to sections if indicated
    if (location.state?.showDemat) {
      const dematSection = document.querySelector(".demat-account-section");
      if (dematSection) dematSection.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const handleOpenUpstox = () => {
    // Set the preferred broker in sessionStorage
    sessionStorage.setItem("preferredBroker", "upstox");
    // Open Upstox account creation page
    window.open(
      "https://upstox.com/open-account/",
      "_blank",
      "noopener,noreferrer"
    );
    // Navigate back to Buy Stocks after setting preference
    setTimeout(() => {
      navigate("/", { state: { showBuyStocks: true } });
    }, 500);
  };

  const handleOpenZerodha = () => {
    // Set the preferred broker in sessionStorage
    sessionStorage.setItem("preferredBroker", "zerodha");
    // Open Zerodha account creation page
    window.open(
      "https://zerodha.com/open-account/",
      "_blank",
      "noopener,noreferrer"
    );
    // Navigate back to Buy Stocks after setting preference
    setTimeout(() => {
      navigate("/", { state: { showBuyStocks: true } });
    }, 500);
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-section">
        <h2>My Account</h2>
        <div className="profile-info">
          <p>Name: sharinnrajakumar</p>
          <p>Email: sharinnrajakumar@gmail.com</p>
          <p>Gender: male</p>
        </div>
      </div>

      {/* Demat Account Section */}
      <div className="demat-account-section">
        <h2>Open Demat Account</h2>
        <div className="demat-cards-container">
          {/* Upstox Card */}
          <div className="demat-card">
            <FaWallet className="card-icon" />
            <h3>Upstox</h3>
            <ul className="features-list">
              <li>
                <FaRupeeSign /> Low Brokerage Charges
              </li>
              <li>
                <FaUserPlus /> Quick Account Opening
              </li>
              <li>
                <FaShieldAlt /> Secure Platform
              </li>
              <li>
                <FaClock /> Instant Access
              </li>
            </ul>
            <div className="video-container">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/XW-GUMz3b0s?si=R7MQOIISHMf_6w1u"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <button onClick={handleOpenUpstox} className="demat-button upstox">
              Open Upstox Account
            </button>
          </div>

          {/* Zerodha Card */}
          <div className="demat-card">
            <FaWallet className="card-icon" />
            <h3>Zerodha</h3>
            <ul className="features-list">
              <li>
                <FaRupeeSign /> Zero Cost Delivery
              </li>
              <li>
                <FaUserPlus /> Paperless Account Opening
              </li>
              <li>
                <FaShieldAlt /> India's Largest Broker
              </li>
            </ul>
            <div className="video-container">
              <iframe
                src="https://www.youtube.com/embed/Y__a4UxNU10?si=Rq2MN0LhI034dmPj"
                title="Zerodha Account Opening"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
            <button
              onClick={handleOpenZerodha}
              className="demat-button zerodha"
            >
              Open Zerodha Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
