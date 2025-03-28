import { useEffect } from "react";
import { useParams } from "react-router-dom";
import "./StockDetail.css"; 


const OFFICIAL_PURCHASE_URLS = {
  IVV: "https://www.blackrock.com/us/individual/products/239726/ishares-core-sp-500-etf",
  GNK: "https://investors.gencoshipping.com/stock-info",
  
};

const StockDetail = () => {
  const { symbol } = useParams();

  useEffect(() => {
    const officialUrl = OFFICIAL_PURCHASE_URLS[symbol?.toUpperCase()];

    if (officialUrl) {
      // Redirect immediately to official purchase page
      window.location.href = officialUrl;
    } else {
      // Fallback for other symbols
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
        `${symbol} official stock purchase`
      )}`;
    }
  }, [symbol]);

  return null; // No render needed for immediate redirect
};

export default StockDetail;
