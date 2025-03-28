import React, { useEffect, useState, Suspense, lazy } from "react";
import {
  FaChartLine,
  FaNewspaper,
  FaUser,
  FaUserAlt,
  FaWallet,
  FaShoppingCart,
  FaBookOpen,
  FaHome,
  FaChartBar,
  FaMoneyBill,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";

// Lazy-loaded components
const BuyStocks = lazy(() => import("../BuyStocks/BuyStocks"));
const PortfolioManager = lazy(() => import("../Portfolio/PortfolioManager"));
const Profile = lazy(() => import("../Profile/Profile"));
const Learn = lazy(() => import("../Learn/Learn"));
const Market = lazy(() => import("../Market/Market"));
const StockDashboard = lazy(() => import("../StockTable/StockDashboard"));
const BudgetManager = lazy(() => import("../Budget/BudgetManager"));

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: "", email: "", gender: "" });
  const [activeComponent, setActiveComponent] = useState(null);
  const [showDematDialog, setShowDematDialog] = useState(false);
  const [showAccountOptions, setShowAccountOptions] = useState(false);
  const [nextComponent, setNextComponent] = useState(null);

  // Sample trending stocks data (can be replaced with API data)
  const trendingStocks = [
    { symbol: "TSLA", name: "Tesla Inc", price: 850.5, change: 2.45 },
    { symbol: "AAPL", name: "Apple Inc", price: 185.3, change: -1.15 },
    { symbol: "BTC", name: "Bitcoin", price: 42000.0, change: 3.78 },
    { symbol: "GOOGL", name: "Alphabet Inc", price: 2750.9, change: 0.89 },
  ];

  // Check login status on mount
  useEffect(() => {
    const loginStatus = sessionStorage.getItem("isLoggedIn");
    if (loginStatus === "true") {
      setIsLoggedIn(true);
      const userName = sessionStorage.getItem("userName");
      const userEmail = sessionStorage.getItem("userEmail") || "john.doe@example.com";
      const userGender = sessionStorage.getItem("userGender") || "male";
      setUser({
        name: userName || userEmail.split("@")[0],
        email: userEmail,
        gender: userGender,
      });
    }
  }, []);

  // Handle navigation with login check
  const handleNavClick = (component) => {
    if (isLoggedIn) {
      if (component === "buyStocks") {
        const dematStatus = sessionStorage.getItem("dematCreated");
        if (dematStatus !== "true") {
          setShowDematDialog(true);
          setNextComponent("buyStocks"); // Store the next component
          return;
        }
      }
      setActiveComponent(component);
    } else {
      navigate("/login");
    }
  };

  const handleCreateDematAccount = (response) => {
    if (response === "yes") {
      navigate("/profile", { state: { showDemat: true } });
    } else {
      setShowAccountOptions(true);
      setActiveComponent(nextComponent);
    }
    setShowDematDialog(false);
  };

  const handleCloseAccountOptions = () => {
    setShowAccountOptions(false);
    setActiveComponent(nextComponent);
  };

  // Handle profile navigation from location state
  useEffect(() => {
    if (location.state?.showUserDetails) {
      if (isLoggedIn) {
        setActiveComponent("profile");
        setTimeout(() => {
          const dematSection = document.querySelector(".demat-account-section");
          if (dematSection) {
            dematSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        navigate("/login");
      }
    }
  }, [location, isLoggedIn, navigate]);

  // Handle buy stocks navigation from location state
  useEffect(() => {
    if (location.state?.showBuyStocks) {
      if (isLoggedIn) {
        setActiveComponent("buyStocks");
      } else {
        navigate("/login");
      }
    }
  }, [location, isLoggedIn, navigate]);

  // Logout handler
  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div id="full">
      {/* Header with Navigation */}
      <header className="financial-header">
        <nav>
          <div className="nav-brand" onClick={() => setActiveComponent(null)}>
            <span className="logo"><FaChartBar /></span>
            <span className="brand-name">TradeView</span>
          </div>
          <ul className="nav-links">
            <li>
              <a
                className={`nav-item ${activeComponent === "stockDashboard" ? "active" : ""}`}
                onClick={() => handleNavClick("stockDashboard")}
              >
                <FaHome className="nav-icon" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeComponent === "market" ? "active" : ""}`}
                onClick={() => handleNavClick("market")}
              >
                <FaChartLine className="nav-icon" />
                <span>Market</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeComponent === "portfolio" ? "active" : ""}`}
                onClick={() => handleNavClick("portfolio")}
              >
                <FaWallet className="nav-icon" />
                <span>Portfolio</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeComponent === "buyStocks" ? "active" : ""}`}
                onClick={() => handleNavClick("buyStocks")}
              >
                <FaShoppingCart className="nav-icon" />
                <span>Trade</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeComponent === "budget" ? "active" : ""}`}
                onClick={() => handleNavClick("budget")}
              >
                <FaMoneyBill className="nav-icon" />
                <span>Budget</span>
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${activeComponent === "learn" ? "active" : ""}`}
                onClick={() => handleNavClick("learn")}
              >
                <FaBookOpen className="nav-icon" />
                <span>Learn</span>
              </a>
            </li>
            {!isLoggedIn ? (
              <div className="auth-buttons">
                <li>
                  <a className="nav-cta secondary" onClick={() => navigate("/login")}>
                    Sign In
                  </a>
                </li>
                <li>
                  <a className="nav-cta primary" onClick={() => navigate("/register")}>
                    Join Free
                  </a>
                </li>
              </div>
            ) : (
              <li className="user-profile-container">
                <div className="compact-profile">
                  <div className="user-avatar">
                    {user.gender === "male" ? <FaUser /> : <FaUserAlt />}
                  </div>
                  <div className="user-info">
                    <span className="username">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </div>
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar-large">
                      {user.gender === "male" ? <FaUser /> : <FaUserAlt />}
                    </div>
                    <div>
                      <p className="user-name">{user.name}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-items">
                    <button
                      className="dropdown-item"
                      onClick={() => setActiveComponent("profile")}
                    >
                      <FaUser /> My Account
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => setActiveComponent("portfolio")}
                    >
                      <FaChartLine /> Portfolio
                    </button>
                    <button
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Main Content with Suspense */}
      <main className="financial-dashboard">
        <Suspense fallback={<div>Loading...</div>}>
          {activeComponent === "profile" ? (
            <Profile />
          ) : activeComponent === "stockDashboard" ? (
            <StockDashboard />
          ) : activeComponent === "portfolio" ? (
            <PortfolioManager />
          ) : activeComponent === "buyStocks" ? (
            <BuyStocks />
          ) : activeComponent === "budget" ? (
            <BudgetManager />
          ) : activeComponent === "market" ? (
            <Market />
          ) : activeComponent === "learn" ? (
            <Learn />
          ) : (
            <div className="dashboard-grid">
              <section className="market-chart">
                <h2>NASDAQ Composite (^IXIC)</h2>
                <div className="chart-placeholder">
                  <img src="chart-placeholder.png" alt="Market chart" />
                </div>
              </section>

              <section className="watchlist">
                <h2>My Watchlist</h2>
                <div className="stocks-table">
                  <div className="table-header">
                    <span>Symbol</span>
                    <span>Price</span>
                    <span>Change</span>
                    <span>Volume</span>
                  </div>
                  {trendingStocks.map((stock, i) => (
                    <div className="stock-row" key={i}>
                      <div className="symbol-cell">
                        <span className="symbol">{stock.symbol}</span>
                        <span className="name">{stock.name}</span>
                      </div>
                      <div className="price">${stock.price.toFixed(2)}</div>
                      <div
                        className={`change ${
                          stock.change >= 0 ? "positive" : "negative"
                        }`}
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change}%
                      </div>
                      <div className="volume">
                        {(Math.random() * 1e6).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="financial-news">
                <h2>
                  Market News <FaNewspaper />
                </h2>
                <div className="news-items">
                  <div className="news-item">
                    <div className="news-thumbnail"></div>
                    <div className="news-content">
                      <h3>Federal Reserve Announces Rate Hike Decision</h3>
                      <p className="timestamp">2h ago • Bloomberg</p>
                      <p>
                        Central bank raises interest rates by 25 basis points amid
                        inflation concerns...
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </Suspense>
      </main>
      {showDematDialog && (
        <div className="demat-dialog-overlay">
          <div className="demat-dialog">
            <p>You need to create a Demat account to trade. Do you want to create one now?</p>
            <div className="demat-dialog-buttons"> {/* Button container */}
              <button onClick={() => handleCreateDematAccount("yes")}>Yes</button>
              <button onClick={() => handleCreateDematAccount("no")}>No</button>
            </div>
          </div>
        </div>
      )}
      {showAccountOptions && (
        <div className="account-options-overlay">
          <div className="account-options">
            <p>You can continue trading with the Demat account you have created.</p>
            <button onClick={handleCloseAccountOptions}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
