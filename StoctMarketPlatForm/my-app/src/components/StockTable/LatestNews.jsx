import React from "react";

const LatestNews = () => {
  const news = [
    {
      title: "Trump is launching a cryptocurrency platform, and we have no idea what it does",
      summary: "There are few public details about the platform...",
      link: "#",
    },
    {
      title:
        "The number of bitcoin millionaires has soared 111% in the last year as the cryptocurrency rallies",
      summary: "",
      link: "#",
    },
  ];

  return (
    <div className="latest-news">
      <h2>LATEST NEWS 📰</h2>
      <ul>
        {news.map((item, index) => (
          <li key={index}>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
            {item.summary && <p>{item.summary}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LatestNews;