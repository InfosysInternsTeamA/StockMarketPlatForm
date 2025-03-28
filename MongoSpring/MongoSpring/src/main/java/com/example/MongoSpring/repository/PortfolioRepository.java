package com.example.MongoSpring.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.MongoSpring.model.Portfolio;

public interface PortfolioRepository extends MongoRepository<Portfolio, String> {
    List<Portfolio> findByUserId(String userId);
}