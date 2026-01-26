const Expenses = require("../models/expenseModel");

// controller function to get all expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expenses.findAll();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Controller function to add a new expense
const addExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const newExpense = await Expenses.create({
      amount,
      description,
      category,
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const deleted = await Expenses.destroy({ where: { id: expenseId } });
    if (deleted) {
      res.status(200).json({ message: "Expense deleted successfully" });
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
module.exports = {
  getExpenses,
  addExpense,
  deleteExpense,
};
