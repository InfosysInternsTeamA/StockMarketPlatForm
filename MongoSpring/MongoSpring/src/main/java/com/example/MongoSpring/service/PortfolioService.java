package com.example.MongoSpring.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.MongoSpring.model.Asset;
import com.example.MongoSpring.model.Portfolio;
import com.example.MongoSpring.repository.PortfolioRepository;

@Service
public class PortfolioService {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioService.class);

    @Autowired
    private PortfolioRepository portfolioRepository;

    public Portfolio createPortfolio(Portfolio portfolio) {
        logger.info("Creating portfolio: {}", portfolio.getName());
        return portfolioRepository.save(portfolio);
    }

    public List<Portfolio> getUserPortfolios(String userId) {
        logger.info("Fetching portfolios for user: {}", userId);
        return portfolioRepository.findByUserId(userId);
    }

    public List<Portfolio> getAllPortfolios() {
        logger.info("Fetching all portfolios");
        return portfolioRepository.findAll();
    }

    public Portfolio getPortfolioById(String portfolioId) {
        logger.info("Fetching portfolio by ID: {}", portfolioId);
        return portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));
    }

    public Portfolio addAssetToPortfolio(String portfolioId, Asset asset) {
        logger.info("Adding asset to portfolio ID: {}", portfolioId);
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        // Initialize assets list if null
        if (portfolio.getAssets() == null) {
            portfolio.setAssets(new ArrayList<>());
        }

        // Initialize asset fields (moved outside the if block)
        if (asset.getAvgBuy() == null || asset.getHoldings() == null) {
            throw new IllegalArgumentException("Asset must have avgBuy and holdings values");
        }
        asset.setPrice(asset.getAvgBuy()); // Initial price is avgBuy
        asset.setPurchaseDate(new Date());
        asset.setChange24h(BigDecimal.ZERO);

        // Check if asset already exists
        Optional<Asset> existingAsset = portfolio.getAssets().stream()
            .filter(a -> a.getSymbol().equalsIgnoreCase(asset.getSymbol()))
            .findFirst();

        if (existingAsset.isPresent()) {
            // Update existing asset
            Asset existing = existingAsset.get();
            BigDecimal totalHoldings = existing.getHoldings().add(asset.getHoldings());
            BigDecimal totalValue = existing.getAvgBuy().multiply(existing.getHoldings())
                .add(asset.getAvgBuy().multiply(asset.getHoldings()));
            BigDecimal newAvgBuy = totalValue.divide(totalHoldings, 2, RoundingMode.HALF_UP);

            existing.setHoldings(totalHoldings);
            existing.setAvgBuy(newAvgBuy);
        } else {
            // Add new asset
            portfolio.getAssets().add(asset);
        }

        portfolio.setBalance(calculateBalance(portfolio.getAssets()));
        return portfolioRepository.save(portfolio);
    }

    public Portfolio removeAssetFromPortfolio(String portfolioId, String assetSymbol) {
        logger.info("Removing asset from portfolio ID: {}", portfolioId);
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        if (portfolio.getAssets() == null) {
            throw new RuntimeException("No assets found in portfolio");
        }

        portfolio.getAssets().removeIf(asset -> asset.getSymbol().equalsIgnoreCase(assetSymbol));
        portfolio.setBalance(calculateBalance(portfolio.getAssets()));
        return portfolioRepository.save(portfolio);
    }

    public void deletePortfolio(String portfolioId) {
        logger.info("Deleting portfolio ID: {}", portfolioId);
        portfolioRepository.deleteById(portfolioId);
    }

    private BigDecimal calculateBalance(List<Asset> assets) {
        if (assets == null || assets.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return assets.stream()
            .map(asset -> asset.getPrice().multiply(asset.getHoldings()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Portfolio updateAssetPrice(String portfolioId, String assetSymbol, double newPrice) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
            .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        portfolio.getAssets().stream()
            .filter(asset -> asset.getSymbol().equalsIgnoreCase(assetSymbol))
            .findFirst()
            .ifPresent(asset -> {
                BigDecimal oldPrice = asset.getPrice();
                BigDecimal newPriceBD = BigDecimal.valueOf(newPrice);
                asset.setPrice(newPriceBD);
                asset.setChange24h(
                    oldPrice.compareTo(BigDecimal.ZERO) != 0
                        ? newPriceBD.subtract(oldPrice).divide(oldPrice, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO
                );
            });

        portfolio.setBalance(calculateBalance(portfolio.getAssets()));
        return portfolioRepository.save(portfolio);
    }
}