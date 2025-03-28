import React, { useState } from "react";
import { FaUser } from "react-icons/fa";

const Navbar = ({ activeSection, setActiveSection }) => {
  const menuItems = ["Dashboard", "Market", "Portfolio", "Buy Stocks", "Budget", "Learn"];
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="logo-icon" style={{ color: "#00C853" }}>
          💹
        </span>
        <span className="logo-name">TradeView</span>
      </div>
      <div className="menu">
        {menuItems.map((item) => (
          <div
            key={item}
            className={`menu-item ${activeSection === item ? "active" : ""}`}
            onClick={() => setActiveSection(item)}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
        <div className="avatar">
          <FaUser />
        </div>
        <span>sharinjakumar</span>
        {showDropdown && (
          <div className="dropdown">
            <ul>
              <li>Profile</li>
              <li>Settings</li>
              <li>Logout</li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

