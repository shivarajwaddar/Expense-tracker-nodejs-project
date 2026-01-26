const Expenses = require("../models/expenseModel");

// 1. Get ONLY the logged-in user's expenses
const getExpenses = async (req, res) => {
  try {
    // We use req.user.id provided by the authenticate middleware
    const expenses = await Expenses.findAll({ where: { userId: req.user.id } });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Add expense with the logged-in User ID
const addExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;

    // We explicitly link this new expense to the authenticated user
    const newExpense = await Expenses.create({
      amount,
      description,
      category,
      userId: req.user.id, // This is the secret sauce for security!
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 3. Delete expense (only if it belongs to the logged-in user)
const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;

    // We add userId to the 'where' clause so User A can't delete User B's expense
    const deleted = await Expenses.destroy({
      where: {
        id: expenseId,
        userId: req.user.id,
      },
    });

    if (deleted) {
      res.status(200).json({ message: "Expense deleted successfully" });
    } else {
      // This will trigger if the ID doesn't exist OR if it belongs to another user
      res.status(404).json({ message: "Expense not found or unauthorized" });
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
