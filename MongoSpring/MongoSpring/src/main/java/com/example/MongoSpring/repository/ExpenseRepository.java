package com.example.MongoSpring.repository;

import com.example.MongoSpring.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByBudgetId(String budgetId);
    List<Expense> findByUserId(String userId);
}