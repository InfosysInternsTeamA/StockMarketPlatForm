package com.example.MongoSpring.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.MongoSpring.model.Budget;

public interface BudgetRepository extends MongoRepository<Budget, String> {
    List<Budget> findByUserId(String userId);
}
