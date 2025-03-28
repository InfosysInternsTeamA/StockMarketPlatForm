import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
import Home from "./components/LoginSignup/Home";
import Login from "./components/LoginSignup/Login";
import Signup from "./components/LoginSignup/Signup";
import Portfolio from "./components/Portfolio/Portfolio";
import Profile from "./components/Profile/Profile"; // <-- Import Profile

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />{" "}
          {/* Add the Profile route */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
