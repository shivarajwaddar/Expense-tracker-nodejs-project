const User = require("../models/userModel");
const Expense = require("../models/expenseModel");
const Order = require("../models/orderModel"); // Import your new Order model

function setupAssociations() {
  // --- 1. User & Expense (One-to-Many) ---
  User.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
  Expense.belongsTo(User, { foreignKey: "userId" });

  // --- 2. User & Order (One-to-Many) ---
  // DELIVERABLE: This connects your premium purchase data to the specific user
  User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
  Order.belongsTo(User, { foreignKey: "userId" });
}

module.exports = setupAssociations;
