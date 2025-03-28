package com.example.MongoSpring.controller;

import com.example.MongoSpring.model.Expense;
import com.example.MongoSpring.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping("/{budgetId}")
    public ResponseEntity<List<Expense>> getBudgetExpenses(@PathVariable String budgetId) {
        try {
            List<Expense> expenses = expenseService.getBudgetExpenses(budgetId);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Expense>> getUserExpenses(@PathVariable String userId) {
        try {
            List<Expense> expenses = expenseService.getUserExpenses(userId);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @PostMapping
public ResponseEntity<?> createExpense(@RequestBody Map<String, Object> expenseData) {
    try {
        // Validate required fields
        if (!expenseData.containsKey("budgetId") || expenseData.get("budgetId") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "budgetId is required"));
        }
        if (!expenseData.containsKey("userId") || expenseData.get("userId") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "userId is required"));
        }
        if (!expenseData.containsKey("description") || expenseData.get("description") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "description is required"));
        }
        if (!expenseData.containsKey("amount") || expenseData.get("amount") == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "amount is required"));
        }

        Expense expense = new Expense();
        expense.setBudgetId((String) expenseData.get("budgetId"));
        // Handle userId as either String or Number
        Object userIdObj = expenseData.get("userId");
        if (userIdObj instanceof String) {
            expense.setUserId((String) userIdObj);
        } else if (userIdObj instanceof Number) {
            expense.setUserId(userIdObj.toString());
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "userId must be a string or number"));
        }
        expense.setDescription((String) expenseData.get("description"));
        expense.setAmount(Double.parseDouble(expenseData.get("amount").toString()));
        if (expenseData.containsKey("expenseDate") && expenseData.get("expenseDate") != null) {
            long timestamp = Long.parseLong(expenseData.get("expenseDate").toString());
            expense.setExpenseDate(new Date(timestamp));
        }
        Expense createdExpense = expenseService.createExpense(expense);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdExpense);
    } catch (NumberFormatException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid number format for amount or expenseDate: " + e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Failed to create expense: " + e.getMessage()));
    }
}

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String expenseId) {
        try {
            expenseService.deleteExpense(expenseId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }
}