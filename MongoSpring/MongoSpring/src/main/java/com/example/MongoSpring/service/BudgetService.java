package com.example.MongoSpring.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.MongoSpring.model.Budget;
import com.example.MongoSpring.repository.BudgetRepository;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    public List<Budget> getUserBudgets(String userId) {
        return budgetRepository.findByUserId(userId);
    }

    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(String budgetId, Budget budget) {
        Budget existingBudget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new RuntimeException("Budget not found"));
        existingBudget.setName(budget.getName());
        existingBudget.setAmount(budget.getAmount());
        return budgetRepository.save(existingBudget);
    }

    public void deleteBudget(String budgetId) {
        budgetRepository.deleteById(budgetId);
    }
}
