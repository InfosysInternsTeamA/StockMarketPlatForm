package com.example.MongoSpring.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.MongoSpring.model.Expense;
import com.example.MongoSpring.repository.ExpenseRepository;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public List<Expense> getBudgetExpenses(String budgetId) {
        return expenseRepository.findByBudgetId(budgetId);
    }

    public List<Expense> getUserExpenses(String userId) {
        return expenseRepository.findByUserId(userId);
    }

    public Expense createExpense(Expense expense) {
        return expenseRepository.save(expense); // Saves expenseDate along with other fields
    }

    public void deleteExpense(String expenseId) {
        try {
            if (expenseRepository.existsById(expenseId)) {
                expenseRepository.deleteById(expenseId);
            } else {
                throw new RuntimeException("Expense not found");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error deleting expense: " + e.getMessage());
        }
    }
}