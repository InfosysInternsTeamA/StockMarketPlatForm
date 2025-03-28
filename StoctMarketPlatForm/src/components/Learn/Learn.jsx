import React, { useState, useEffect } from "react";
import { FiBookOpen, FiVideo, FiArrowRight, FiCheck, FiX, FiClock } from "react-icons/fi";
import "./Learn.css";

const Learn = () => {
  // State variables for tab and quiz management
  const [activeTab, setActiveTab] = useState("videos");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showExplanation, setShowExplanation] = useState(false);

  // Educational content data
  const educationalContent = {
    videos: [
      {
        title: "Stock Market Basics for Beginners",
        content: "Learn the fundamentals of stock market investing",
        videoId: "86rPBAnRCHc",
        duration: "15:30",
        category: "Beginner",
      },
      {
        title: "Technical Analysis Masterclass",
        content: "Complete guide to reading stock charts",
        videoId: "eynxyoKgpng",
        duration: "22:45",
        category: "Advanced",
      },
      {
        title: "Fundamental Analysis Techniques",
        content: "How to evaluate company financials",
        videoId: "kXYvRR7gV2E",
        duration: "15:30",
        category: "Beginner",
      },
      {
        title: "Risk Management Strategies",
        content: "Protecting your investments from market volatility",
        videoId: "gM65dEuNsMw",
        duration: "15:30",
        category: "Beginner",
      },
      {
        title: "Diversification Principles",
        content: "Building a balanced investment portfolio",
        videoId: "jg_MflByI3Y",
        duration: "15:30",
        category: "Beginner",
      },
      {
        title: "Using Trading Platforms",
        content: "Step-by-step guide to modern trading tools",
        videoId: "LqiwxjcKBuM",
        duration: "15:30",
        category: "Beginner",
      },
    ],
    articles: [
      {
        title: "Understanding Market Indicators",
        content: "Learn how to interpret key market indicators like MACD and RSI",
        readTime: "8 min",
        category: "Technical Analysis",
      },
      {
        title: "Portfolio Diversification Strategies",
        content: "Essential techniques for building a resilient investment portfolio",
        readTime: "10 min",
        category: "Portfolio Management",
      },
      {
        title: "IPO Investment Guide",
        content: "Step-by-step approach to evaluating and investing in IPOs",
        readTime: "12 min",
        category: "Investing",
      },
    ],
  };

  // Quiz questions data
  const questions = [
    {
      question: "What does IPO stand for?",
      options: [
        "Initial Public Offering",
        "International Profit Organization",
        "Investment Portfolio Optimization",
      ],
      correctAnswer: 0,
      explanation: "IPO stands for Initial Public Offering, which is when a private company issues stock to the public for the first time.",
    },
    {
      question: "Which index is often used as a benchmark for the US stock market?",
      options: ["NASDAQ", "S&P 500", "Dow Jones"],
      correctAnswer: 1,
      explanation: "The S&P 500 is widely regarded as the best single gauge of large-cap US equities.",
    },
    {
      question: "What does P/E ratio stand for?",
      options: ["Price to Equity", "Price to Earnings", "Profit to Expenses"],
      correctAnswer: 1,
      explanation: "The P/E ratio compares a company's share price to its earnings per share.",
    },
  ];

  // Timer effect for quiz questions
  useEffect(() => {
    if (!quizCompleted && selectedAnswer === null) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestion, quizCompleted, selectedAnswer]);

  // Effect to handle time running out
  useEffect(() => {
    if (timeLeft <= 0 && !quizCompleted && selectedAnswer === null) {
      handleAnswerReveal();
    }
  }, [timeLeft, quizCompleted, selectedAnswer]);

  // Handle selecting an answer
  const handleAnswerSelect = (index) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
      setShowExplanation(true);
    }
  };

  // Reveal answer and move to next question or complete quiz
  const handleAnswerReveal = () => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
        setShowExplanation(false);
      }, 2000);
    } else {
      setQuizCompleted(true);
    }
  };

  // Restart the quiz
  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setScore(0);
    setTimeLeft(15);
    setShowExplanation(false);
  };

  // Render the component
  return (
    <div className="learn-container">
      {/* Header with tabs */}
      <div className="learn-header">
        <h1>Market Education Hub</h1>
        <div className="learn-tabs">
          <button
            className={`tab-button ${activeTab === "videos" ? "active" : ""}`}
            onClick={() => setActiveTab("videos")}
          >
            <FiVideo /> Video Courses
          </button>
          <button
            className={`tab-button ${activeTab === "articles" ? "active" : ""}`}
            onClick={() => setActiveTab("articles")}
          >
            <FiBookOpen /> Educational Articles
          </button>
        </div>
      </div>

      {/* Video content */}
      {activeTab === "videos" && (
        <div className="content-sections">
          {educationalContent.videos.map((item, index) => (
            <div key={index} className="content-card">
              <div className="video-meta">
                <span className="category-badge">{item.category}</span>
                <span className="duration">{item.duration}</span>
              </div>
              <div className="video-container">
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${item.videoId}`}
                  title={item.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="content-details">
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <button className="learn-more">
                  Watch Now <FiArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article content */}
      {activeTab === "articles" && (
        <div className="content-sections">
          {educationalContent.articles.map((item, index) => (
            <div key={index} className="content-card">
              <div className="article-thumbnail">
                <div className="article-meta">
                  <span className="category-tag">{item.category}</span>
                  <span className="read-time">{item.readTime} read</span>
                </div>
                <div className="thumbnail-placeholder"></div>
              </div>
              <div className="content-details">
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <button className="learn-more">
                  Read Article <FiArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz section */}
      <div className="quiz-section">
        <h2>Test Your Knowledge</h2>

        {quizCompleted ? (
          <div className="quiz-results">
            <h3>Quiz Results</h3>
            <p>You scored {score} out of {questions.length}</p>
            <p>Percentage: {(score / questions.length * 100).toFixed(0)}%</p>
            <button onClick={restartQuiz}>Restart Quiz</button>
          </div>
        ) : (
          <div className="interactive-quiz">
            <div className="quiz-header">
              <p>Stock Market Basics Quiz</p>
              <div className="progress-indicator">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="question-container">
              <h3>{questions[currentQuestion].question}</h3>

              <div className="timer">
                <FiClock /> {timeLeft}s
              </div>

              <div className="options-container">
                {questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    className={`option ${
                      selectedAnswer !== null
                        ? index === questions[currentQuestion].correctAnswer
                          ? "correct"
                          : index === selectedAnswer
                          ? "incorrect"
                          : ""
                        : ""
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="radio-circle">
                      {selectedAnswer !== null ? (
                        index === questions[currentQuestion].correctAnswer ? (
                          <FiCheck className="check-icon" />
                        ) : index === selectedAnswer ? (
                          <FiX className="x-icon" />
                        ) : null
                      ) : (
                        <span className="radio-dot"></span>
                      )}
                    </span>
                    <span className="option-text">{option}</span>
                  </div>
                ))}
              </div>

              {showExplanation && (
                <div className="explanation">
                  <p className="explanation-text">{questions[currentQuestion].explanation}</p>
                </div>
              )}

              {selectedAnswer !== null && currentQuestion < questions.length - 1 && (
                <button className="next-button" onClick={handleAnswerReveal}>
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;