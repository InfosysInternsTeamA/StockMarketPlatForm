import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
//import BudgetManager from "./components/Budget/BudgetManager"; // Remove this line
import BuyStocks from "./components/BuyStocks/BuyStocks";
import CreateDematAccount from "./components/CreateDematAccount/CreateDematAccount";
import Learn from "./components/Learn/Learn";
import Home from "./components/LoginSignup/Home";
import Login from "./components/LoginSignup/Login";
import Signup from "./components/LoginSignup/Signup";
import PortfolioManager from "./components/Portfolio/PortfolioManager";
import Profile from "./components/Profile/Profile";
import Stock from "./components/Stock/Stock";
import StockDashboard from "./components/StockTable/StockDashboard";
import Market from "./components/Market/Market";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from './components/Dashboard';

const App = () => {
  const [activeSection, setActiveSection] = useState('Dashboard');
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/portfolio" element={<PortfolioManager />} />
          <Route path="/create-demat-account" element={<CreateDematAccount />} />
          <Route path="/buy-stocks" element={<BuyStocks />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/profile" element={<Profile />} />
          {/*<Route path="/budget" element={<BudgetManager />} /> Remove this line*/}
          <Route path="/learn" element={<Learn />} />
          <Route path="/stock-dashboard" element={<StockDashboard />} />
          <Route path="/market" element={<Market />} />
          <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
        <Dashboard activeSection={activeSection} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
