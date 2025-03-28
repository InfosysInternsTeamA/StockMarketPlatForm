package com.example.MongoSpring.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.MongoSpring.model.Asset;
import com.example.MongoSpring.model.Portfolio;
import com.example.MongoSpring.service.PortfolioService;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = "http://localhost:3000")
public class PortfolioController {
    
    private static final Logger logger = LoggerFactory.getLogger(PortfolioController.class);

    @Autowired
    private PortfolioService portfolioService;

    @GetMapping
    public ResponseEntity<List<Portfolio>> getAllPortfolios() {
        logger.info("Fetching all portfolios");
        return ResponseEntity.ok(portfolioService.getAllPortfolios());
    }

    @PostMapping
    public ResponseEntity<Portfolio> createPortfolio(@RequestBody Portfolio portfolio) {
        logger.info("Creating portfolio: {}", portfolio.getName());
        return ResponseEntity.ok(portfolioService.createPortfolio(portfolio));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Portfolio>> getUserPortfolios(@PathVariable String userId) {
        logger.info("Fetching portfolios for user: {}", userId);
        return ResponseEntity.ok(portfolioService.getUserPortfolios(userId));
    }

    @GetMapping("/{portfolioId}")
    public ResponseEntity<Portfolio> getPortfolioById(@PathVariable String portfolioId) {
        logger.info("Fetching portfolio by ID: {}", portfolioId);
        return ResponseEntity.ok(portfolioService.getPortfolioById(portfolioId));
    }

    @PostMapping("/{portfolioId}/assets")
    public ResponseEntity<Portfolio> addAsset(
            @PathVariable String portfolioId,
            @RequestBody Asset asset) {
        logger.info("Adding asset to portfolio ID: {}", portfolioId);
        return ResponseEntity.ok(portfolioService.addAssetToPortfolio(portfolioId, asset));
    }

    @DeleteMapping("/{portfolioId}/assets/{symbol}")
    public ResponseEntity<Portfolio> removeAsset(
            @PathVariable String portfolioId,
            @PathVariable String symbol) {
        logger.info("Removing asset from portfolio ID: {}", portfolioId);
        return ResponseEntity.ok(portfolioService.removeAssetFromPortfolio(portfolioId, symbol));
    }

    @DeleteMapping("/{portfolioId}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable String portfolioId) {
        logger.info("Deleting portfolio ID: {}", portfolioId);
        portfolioService.deletePortfolio(portfolioId);
        return ResponseEntity.ok().build();
    }
}
