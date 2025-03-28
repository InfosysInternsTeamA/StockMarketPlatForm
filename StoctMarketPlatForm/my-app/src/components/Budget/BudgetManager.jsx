import React, { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import { DEFAULT_USER_ID } from "../../constants/api";
import "./BudgetManager.css";

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [expensesByBudget, setExpensesByBudget] = useState({});
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [newBudget, setNewBudget] = useState({ name: "", amount: "" });
  const [newExpense, setNewExpense] = useState({ description: "", amount: "", expenseDate: "" });
  const [showAddBudgetForm, setShowAddBudgetForm] = useState(false);
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleError = (err) => {
    setError(err.userMessage || "An error occurred");
    setTimeout(() => setError(null), 5000);
  };

  const validateBudget = (budget) => {
    if (!budget.name.trim()) {
      setError("Budget name is required");
      return false;
    }
    if (!budget.amount || parseFloat(budget.amount) <= 0) {
      setError("Budget amount must be greater than 0");
      return false;
    }
    return true;
  };

  const validateExpense = (expense) => {
    if (!expense.description.trim()) {
      setError("Expense description is required");
      return false;
    }
    if (!expense.amount || isNaN(parseFloat(expense.amount)) || parseFloat(expense.amount) <= 0) {
      setError("Expense amount must be a valid number greater than 0");
      return false;
    }
    if (!expense.expenseDate) {
      setError("Expense date is required");
      return false;
    }
    return true;
  };

  const validateInput = (name, value) => {
    if (!value.trim()) {
      return `${name} is required`;
    }
    if (name.toLowerCase().includes("amount") && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
      return `${name} must be a valid number greater than 0`;
    }
    return null;
  };

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/budgets/${DEFAULT_USER_ID}`);
      setBudgets(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/expenses/user/${DEFAULT_USER_ID}`);
      const organized = response.data.reduce((acc, expense) => {
        acc[expense.budgetId] = (acc[expense.budgetId] || []).concat(expense);
        return acc;
      }, {});
      setExpensesByBudget(organized);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
    fetchAllExpenses();
  }, [fetchBudgets, fetchAllExpenses]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBudget]);

  const handleAddBudget = async () => {
    if (!validateBudget(newBudget)) return;
    setLoading(true);
    try {
      await api.post("/budgets", {
        userId: DEFAULT_USER_ID,
        name: newBudget.name.trim(),
        amount: parseFloat(newBudget.amount),
      });
      await fetchBudgets();
      setNewBudget({ name: "", amount: "" });
      setShowAddBudgetForm(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!validateExpense(newExpense)) return;
    if (!selectedBudget) {
      setError("Please select a budget before adding an expense");
      return;
    }
    setLoading(true);
    try {
      const expenseDate = newExpense.expenseDate ? new Date(newExpense.expenseDate).getTime() : null;
      const payload = {
        budgetId: selectedBudget.id,
        userId: String(DEFAULT_USER_ID),
        description: newExpense.description.trim(),
        amount: parseFloat(newExpense.amount),
        expenseDate: expenseDate,
      };
      await api.post("/expenses", payload);
      await fetchAllExpenses();
      setNewExpense({ description: "", amount: "", expenseDate: "" });
      setShowAddExpenseForm(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async (updatedBudget) => {
    setLoading(true);
    try {
      await api.put(`/budgets/${updatedBudget.id}`, updatedBudget);
      setBudgets(budgets.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)));
      setEditingBudget(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = (type, id, name) => {
    return window.confirm(`Are you sure you want to delete this ${type}?\n${name || ""}`);
  };

  const handleDeleteBudget = async (budgetId, budgetName) => {
    if (!handleConfirmDelete("budget", budgetId, budgetName)) return;
    setLoading(true);
    try {
      await api.delete(`/budgets/${budgetId}`);
      setBudgets(budgets.filter((b) => b.id !== budgetId));
      if (selectedBudget?.id === budgetId) setSelectedBudget(null);
      await fetchAllExpenses();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId, description) => {
    if (!handleConfirmDelete("expense", expenseId, description)) return;
    setLoading(true);
    try {
      await api.delete(`/expenses/${expenseId}`);
      await fetchAllExpenses();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBudget = (budget) => {
    setSelectedBudget(budget);
  };

  const getTotalExpenses = (budgetId) => {
    return (expensesByBudget[budgetId] || []).reduce((total, expense) => total + expense.amount, 0);
  };

  const paginatedExpenses = (expensesByBudget[selectedBudget?.id] || []).slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const allExpenses = Object.values(expensesByBudget).flat();

  return (
    <div className="budget-manager-container">
      {error && <div className="error-message">{error}</div>}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}

      <div className="header-section">
        <h2>Budgets</h2>
        <div className="action-buttons">
          <button onClick={() => setShowAddBudgetForm(!showAddBudgetForm)}>
            + Add Budget
          </button>
          <button
            onClick={() => setShowAddExpenseForm(!showAddExpenseForm)}
            disabled={!selectedBudget}
          >
            + Add Expense
          </button>
        </div>
      </div>

      {showAddBudgetForm && (
        <div className="add-budget-form">
          <input
            type="text"
            placeholder="Budget Name"
            value={newBudget.name}
            onChange={(e) => {
              const error = validateInput("Name", e.target.value);
              setValidationErrors({ ...validationErrors, name: error });
              setNewBudget({ ...newBudget, name: e.target.value });
            }}
            className={validationErrors.name ? "invalid-input" : ""}
          />
          {validationErrors.name && (
            <div className="warning-text">{validationErrors.name}</div>
          )}
          <input
            type="number"
            placeholder="Budget Amount ($)"
            value={newBudget.amount}
            onChange={(e) => {
              const error = validateInput("Amount", e.target.value);
              setValidationErrors({ ...validationErrors, amount: error });
              setNewBudget({ ...newBudget, amount: e.target.value });
            }}
            className={validationErrors.amount ? "invalid-input" : ""}
          />
          {validationErrors.amount && (
            <div className="warning-text">{validationErrors.amount}</div>
          )}
          <button onClick={handleAddBudget}>Add Budget</button>
        </div>
      )}

      <div className="budget-list">
        {budgets.map((budget) => {
          const totalExpenses = getTotalExpenses(budget.id);
          const progressPercentage = budget.amount > 0 ? Math.min((totalExpenses / budget.amount) * 100, 100) : 0;

          return (
            <div
              key={budget.id}
              className={`budget-item ${selectedBudget && selectedBudget.id === budget.id ? "selected" : ""}`}
              onClick={() => handleSelectBudget(budget)}
            >
              <div className="budget-header">
                {editingBudget?.id === budget.id ? (
                  <input
                    value={editingBudget.name}
                    onChange={(e) => setEditingBudget({ ...editingBudget, name: e.target.value })}
                  />
                ) : (
                  <span>{budget.name}</span>
                )}
                <div className="budget-actions">
                  {editingBudget?.id === budget.id ? (
                    <>
                      <button onClick={() => handleUpdateBudget(editingBudget)}>💾</button>
                      <button onClick={() => setEditingBudget(null)}>❌</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingBudget(budget)}>✏️</button>
                      <button onClick={() => handleDeleteBudget(budget.id, budget.name)}>🗑️</button>
                    </>
                  )}
                </div>
              </div>
              <div className="budget-details">
                <span>${totalExpenses} / ${budget.amount}</span>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="total-expense-section">
        <h3>Total Expense History</h3>
        <table className="expense-table">
          <thead>
            <tr>
              <th>#</th>
              <th>DESCRIPTION</th>
              <th>AMOUNT</th>
              <th>BUDGET</th>
              <th>DATE & TIME</th>
            </tr>
          </thead>
          <tbody>
            {allExpenses.length > 0 ? (
              allExpenses.map((expense, index) => (
                <tr key={expense.id}>
                  <td>{index + 1}</td>
                  <td>{expense.description || "—"}</td>
                  <td>${expense.amount}</td>
                  <td>{budgets.find((b) => b.id === expense.budgetId)?.name || "—"}</td>
                  <td>{expense.expenseDate ? new Date(expense.expenseDate).toLocaleString() : "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-expenses">No expenses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedBudget && (
        <div className="selected-budget-section">
          <h3>Expense History for {selectedBudget.name}</h3>
          {showAddExpenseForm && (
            <div className="add-expense-form">
              <input
                type="text"
                placeholder="Expense Description"
                value={newExpense.description}
                onChange={(e) => {
                  const error = validateInput("Description", e.target.value);
                  setValidationErrors({ ...validationErrors, description: error });
                  setNewExpense({ ...newExpense, description: e.target.value });
                }}
                className={validationErrors.description ? "invalid-input" : ""}
              />
              {validationErrors.description && (
                <div className="warning-text">{validationErrors.description}</div>
              )}
              <input
                type="number"
                placeholder="Expense Amount"
                value={newExpense.amount}
                onChange={(e) => {
                  const error = validateInput("Amount", e.target.value);
                  setValidationErrors({ ...validationErrors, amount: error });
                  setNewExpense({ ...newExpense, amount: e.target.value });
                }}
                className={validationErrors.amount ? "invalid-input" : ""}
              />
              {validationErrors.amount && (
                <div className="warning-text">{validationErrors.amount}</div>
              )}
              <input
                type="datetime-local"
                value={newExpense.expenseDate}
                onChange={(e) => {
                  const value = e.target.value;
                  const error = value ? null : "Expense date is required";
                  setValidationErrors({ ...validationErrors, expenseDate: error });
                  setNewExpense({ ...newExpense, expenseDate: value });
                }}
                className={validationErrors.expenseDate ? "invalid-input" : ""}
              />
              {validationErrors.expenseDate && (
                <div className="warning-text">{validationErrors.expenseDate}</div>
              )}
              <button onClick={handleAddExpense}>Add Expense</button>
            </div>
          )}
          <table className="expense-table">
            <thead>
              <tr>
                <th>#</th>
                <th>DESCRIPTION</th>
                <th>AMOUNT</th>
                <th>DATE & TIME</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((expense, index) => (
                  <tr key={expense.id}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td>{expense.description || "—"}</td>
                    <td>${expense.amount}</td>
                    <td>{expense.expenseDate ? new Date(expense.expenseDate).toLocaleString() : "—"}</td>
                    <td>
                      <button onClick={() => handleDeleteExpense(expense.id, expense.description)}>🗑️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-expenses">No expenses found for this budget</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination-controls">
            <div className="rows-per-page">
              Rows per page:
              <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                {[10, 25, 50, 100].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="page-info">
              {`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
                currentPage * rowsPerPage,
                (expensesByBudget[selectedBudget.id] || []).length
              )} of ${(expensesByBudget[selectedBudget.id] || []).length}`}
            </div>
            <div className="page-buttons">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ⟨
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      p + 1,
                      Math.ceil((expensesByBudget[selectedBudget.id] || []).length / rowsPerPage)
                    )
                  )
                }
                disabled={currentPage * rowsPerPage >= (expensesByBudget[selectedBudget.id] || []).length}
              >
                ⟩
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;