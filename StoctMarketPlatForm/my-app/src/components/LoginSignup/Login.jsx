import { faEnvelope, faLock, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../Notification/Notification";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8081/auth/login", {
        email,
        password,
      });
      if (response.data === "Login successful!") {
        setSubmitted(true);
        const userName = email.split("@")[0]; // Extract username from email
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userName", userName); // Store the extracted username
        sessionStorage.setItem("userEmail", email); // Store the user's email
        sessionStorage.setItem("userGender", "male"); // Replace with actual user gender from response
        setErrorMessage("");
        setNotification({ message: "Login successful!", type: "success" });
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setErrorMessage(response.data || "Login failed. Please check your credentials.");
        setNotification({ message: response.data || "Login failed. Please check your credentials.", type: "error" });
      }
    } catch (error) {
      console.error("Error logging in", error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        setErrorMessage(errorData.message || "Login failed. Please check your credentials.");
        setNotification({ message: errorData.message || "Login failed. Please check your credentials.", type: "error" });
      } else {
        setErrorMessage("Login failed. Please check your credentials.");
        setNotification({ message: "Login failed. Please check your credentials.", type: "error" });
      }
    }
  };

  return (
    <div className="login-wrapper">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="login-container">
        <div className="header">
          <h1 className="text">Welcome Back</h1>
          <div className="underline"></div>
          <p className="subtext">Manage your investments securely</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="inputs">
            <div className="input-field">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="input-field">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="submit-container">
            <button type="submit" className="submit-button">
              Sign In
            </button>
          </div>

          <div className="additional-options">
            <span onClick={() => navigate("/forgot-password")} className="forgot-password">
              Forgot Password?
            </span>
            <p className="signup-prompt">
              New here?{" "}
              <span onClick={() => navigate("/register")} className="signup-link">
                Create Account
              </span>
            </p>
          </div>
        </form>

        {submitted && (
          <div className="success-message">
            <FontAwesomeIcon icon={faCheckCircle} />
            Login Successful! Redirecting...
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationCircle} />
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
