const User = require("../models/userModel");
const Expense = require("../models/expenseModel");

function setupAssociations() {
  // 1. A User can have many Expenses (One-to-Many)
  User.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });

  // 2. An Expense belongs to a single User
  Expense.belongsTo(User, { foreignKey: "userId" });
}

module.exports = setupAssociations;
