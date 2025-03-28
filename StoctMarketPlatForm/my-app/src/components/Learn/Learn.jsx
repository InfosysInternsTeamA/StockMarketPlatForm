import React, { useState, useEffect } from "react";
import { FiBookOpen, FiVideo, FiArrowRight, FiCheckSquare, FiSquare } from "react-icons/fi";
import "./Learn.css";

const Learn = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [quizResponses, setQuizResponses] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);

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
        duration: "19:17",
        category: "Beginner",
      },
      {
        title: "Risk Management Strategies",
        content: "Protecting your investments from market volatility",
        videoId: "gM65dEuNsMw",
        duration: "16:52",
        category: "Beginner",
      },
      {
        title: "Diversification Principles",
        content: "Building a balanced investment portfolio",
        videoId: "jg_MflByI3Y",
        duration: "07:24",
        category: "Beginner",
      },
      {
        title: "Using Trading Platforms",
        content: "Step-by-step guide to modern trading tools",
        videoId: "LqiwxjcKBuM",
        duration: "09:06",
        category: "Beginner",
      },
    ],
    articles: [
      {
        title: "Understanding Market Indicators",
        content: "Learn how to interpret key market indicators like MACD and RSI",
        readTime: "8 min",
        category: "Technical Analysis",
        articleLink: "https://www.investopedia.com/terms/m/macd.asp",
      },
      {
        title: "Portfolio Diversification Strategies",
        content: "Essential techniques for building a resilient investment portfolio",
        readTime: "10 min",
        category: "Portfolio Management",
        articleLink: "https://www.investopedia.com/terms/d/diversification.asp",
      },
      {
        title: "IPO Investment Guide",
        content: "Step-by-step approach to evaluating and investing in IPOs",
        readTime: "12 min",
        category: "Investing",
        articleLink: "https://www.investopedia.com/terms/i/ipo.asp",
      },
      {
        title: "The Role of Central Banks",
        content: "Understanding how central banks influence the economy and markets.",
        readTime: "9 min",
        category: "Economics",
        articleLink: "https://www.investopedia.com/terms/c/centralbank.asp",
      },
      {
        title: "Introduction to Options Trading",
        content: "A beginner's guide to understanding options contracts and strategies.",
        readTime: "11 min",
        category: "Options",
        articleLink: "https://www.investopedia.com/terms/o/option.asp",
      },
      {
        title: "Behavioral Finance Biases",
        content: "Exploring common psychological biases that affect investor decisions.",
        readTime: "14 min",
        category: "Behavioral Finance",
        articleLink: "https://www.investopedia.com/terms/b/behavioralfinance.asp",
      },
    ],
  };

  const quizzes = [
    {
      id: 1,
      title: "Stock Market Basics Quiz",
      timeLimit: 180, // 3 minutes
      questions: [
        {
          id: 1,
          question: "What does IPO stand for?",
          options: ["Initial Public Offering", "International Profit Organization", "Investment Portfolio Optimization"],
          correctAnswer: 0,
        },
        {
          id: 2,
          question: "Which index is often used as a benchmark for the US stock market?",
          options: ["NASDAQ", "S&P 500", "Dow Jones"],
          correctAnswer: 1,
        },
        {
          id: 3,
          question: "What does P/E ratio stand for?",
          options: ["Price to Equity", "Price to Earnings", "Profit to Expenses"],
          correctAnswer: 1,
        },
      ],
    },
  ];

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setQuizResponses({});
    setQuizResults(null);
    setTimeRemaining(quizzes[0].timeLimit);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizzes[0].questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleQuizSubmit = () => {
    const quiz = quizzes[0];
    const questions = quiz.questions;
    let score = 0;

    questions.forEach((question, index) => {
      const userAnswer = quizResponses[index];
      if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
        score++;
      }
    });

    setQuizResults({
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      timeTaken: quiz.timeLimit - timeRemaining,
    });
    setQuizStarted(false);
  };

  useEffect(() => {
    if (quizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      handleQuizSubmit();
    }
  }, [quizStarted, timeRemaining]);

  const currentQuiz = quizzes[0];
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

  return (
    <div className="learn-container">
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
                <a
                  href={`https://www.youtube.com/watch?v=${item.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="learn-more"
                >
                  Watch Now<FiArrowRight />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <a
                  href={item.articleLink} // Use the articleLink here
                  target="_blank"
                  rel="noopener noreferrer"
                  className="learn-more"
                >
                  Read Article <FiArrowRight />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="interactive-quiz">
        <div className="quiz-header">
          <h2>Test Your Knowledge</h2>
          <p>Take this quiz to assess your understanding of stock market basics</p>
        </div>

        {!quizStarted ? (
          <div className="quiz-start">
            <h3>{currentQuiz.title}</h3>
            <p>
              {currentQuiz.questions.length} Questions | {Math.floor(currentQuiz.timeLimit / 60)} min
            </p>
            <button className="start-quiz-button" onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        ) : (
          <div className="quiz-content">
            <div className="progress-indicator">
              <span>
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="timer">
              <span>Time Remaining:</span>
              <span className={timeRemaining <= 10 ? "low-time" : ""}>
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
              </span>
            </div>

            <div className="question-container">
              <h3>{currentQuestion.question}</h3>
              <div className="options-container">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`option ${quizResponses[currentQuestionIndex] === index ? "selected" : ""
                      }`}
                    onClick={() =>
                      setQuizResponses({
                        ...quizResponses,
                        [currentQuestionIndex]: index,
                      })
                    }
                  >
                    <div className="radio-circle">
                      {quizResponses[currentQuestionIndex] === index && (
                        <div className="radio-dot"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="quiz-navigation">
              {currentQuestionIndex > 0 && (
                <button
                  className="quiz-prev-button"
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                >
                  Previous
                </button>
              )}

              {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                <button
                  className="quiz-next-button"
                  onClick={handleNextQuestion}
                  disabled={quizResponses[currentQuestionIndex] === undefined}
                >
                  Next
                </button>
              ) : (
                <button
                  className="quiz-submit-button"
                  onClick={handleQuizSubmit}
                  disabled={quizResponses[currentQuestionIndex] === undefined}
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        )}

        {quizResults && (
          <div className="quiz-results">
            <h3>Quiz Results</h3>
            <p>
              You scored {quizResults.score} out of {quizResults.total}
            </p>
            <p>Percentage: {quizResults.percentage}%</p>
            <p>
              Time Taken: {Math.floor(quizResults.timeTaken / 60)}:
              {String(quizResults.timeTaken % 60).padStart(2, "0")}
            </p>
            <button onClick={startQuiz}>Retake Quiz</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
