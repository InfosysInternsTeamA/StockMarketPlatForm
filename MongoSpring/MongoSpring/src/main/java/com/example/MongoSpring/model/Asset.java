package com.example.MongoSpring.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.Date;

@Document(collection = "assets")
public class Asset {
    @Id
    private String id;
    private String symbol;
    private String name;
    private BigDecimal price;
    private BigDecimal change24h;
    private BigDecimal holdings;
    private BigDecimal avgBuy;
    private Date purchaseDate;

    // Constructor
    public Asset() {}

    public Asset(String symbol, String name, BigDecimal price, BigDecimal holdings, 
                 BigDecimal avgBuy, Date purchaseDate) {
        if (symbol == null || symbol.isEmpty()) {
            throw new IllegalArgumentException("Symbol is required");
        }
        if (holdings == null || holdings.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Holdings must be non-negative");
        }
        if (avgBuy == null || avgBuy.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Average buy price must be positive");
        }

        this.symbol = symbol;
        this.name = name != null ? name : symbol;  // Default name to symbol if not provided
        this.price = price != null ? price : avgBuy;  // Default price to avgBuy if not provided
        this.change24h = BigDecimal.ZERO;  // Default to zero
        this.holdings = holdings;
        this.avgBuy = avgBuy;
        this.purchaseDate = purchaseDate != null ? purchaseDate : new Date();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) {
        if (price != null && price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be positive");
        }
        this.price = price;
    }

    public BigDecimal getChange24h() { return change24h; }
    public void setChange24h(BigDecimal change24h) { this.change24h = change24h; }

    public BigDecimal getHoldings() { return holdings; }
    public void setHoldings(BigDecimal holdings) {
        if (holdings != null && holdings.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Holdings must be non-negative");
        }
        this.holdings = holdings;
    }

    public BigDecimal getAvgBuy() { return avgBuy; }
    public void setAvgBuy(BigDecimal avgBuy) {
        if (avgBuy != null && avgBuy.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Average buy price must be positive");
        }
        this.avgBuy = avgBuy;
    }

    public Date getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(Date purchaseDate) { this.purchaseDate = purchaseDate; }

    @Override
    public String toString() {
        return "Asset{" +
                "id='" + id + '\'' +
                ", symbol='" + symbol + '\'' +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", change24h=" + change24h +
                ", holdings=" + holdings +
                ", avgBuy=" + avgBuy +
                ", purchaseDate=" + purchaseDate +
                '}';
    }
}