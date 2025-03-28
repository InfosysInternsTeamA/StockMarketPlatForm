import { faEnvelope, faLock, faUser, faVenusMars, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../Notification/Notification";
import "./Signup.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8081/auth/register", {
        name,
        email,
        password,
        gender,
      });
      if (response.data === "User registered successfully!") {
        setRegistrationSuccess(true);
        setErrorMessage("");
        const userName = email.split("@")[0]; // Extract username from email
        sessionStorage.setItem("userName", userName); // Store the extracted username
        sessionStorage.setItem("userGender", gender); // Store the user's gender
        setNotification({ message: "User registered successfully!", type: "success" });
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setErrorMessage(response.data || "Registration failed. Please try again.");
        setNotification({ message: response.data || "Registration failed. Please try again.", type: "error" });
      }
    } catch (error) {
      console.error("Error registering user", error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        setErrorMessage(errorData.message || "Registration failed. Please try again.");
        setNotification({ message: errorData.message || "Registration failed. Please try again.", type: "error" });
      } else {
        setErrorMessage("Network error. Please try again later.");
        setNotification({ message: "Network error. Please try again later.", type: "error" });
      }
    }
  };

  return (
    <div className="signup-wrapper">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="signup-container">
        <div className="header">
          <h1 className="text">Create Account</h1>
          <div className="underline"></div>
          <p className="subtext">Join our financial community today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="inputs">
            <div className="input-field">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="input-field">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="input-field">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                placeholder="Create Password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="input-field">
              <FontAwesomeIcon icon={faVenusMars} className="input-icon" />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-select"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="submit-container">
            <button type="submit" className="submit-button">
              Get Started
            </button>
          </div>

          <p className="login-link">
            Already have an account? <span onClick={() => navigate("/login")}>Log in</span>
          </p>
        </form>

        {registrationSuccess && (
          <div className="success-message">
            <FontAwesomeIcon icon={faCheckCircle} />
            Registration Successful! Redirecting...
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

export default Signup;
