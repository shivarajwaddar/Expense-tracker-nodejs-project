const Expense = require("../models/expenseModel"); // Renamed to singular for consistency

// 1. Get ONLY the logged-in user's expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Add expense
const addExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;

    const newExpense = await Expense.create({
      amount,
      description,
      category,
      userId: req.user.id,
    });

    const totalExpenses = Number(req.user.totalExpenses) + Number(amount);
    await req.user.update({ totalExpenses: totalExpenses });

    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 3. Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;

    const expense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id },
    });

    if (!expense) {
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized" });
    }

    // Logic: Subtract amount from the user's totalExpenses
    const updatedTotal =
      Number(req.user.totalExpenses) - Number(expense.amount);

    // Update user first, then destroy the expense
    await req.user.update({ totalExpenses: updatedTotal });
    await expense.destroy();

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getExpenses, addExpense, deleteExpense };
