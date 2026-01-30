const User = require("../models/userModel");
const Expense = require("../models/expenseModel");
const Order = require("../models/orderModel");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest"); // Corrected path

function setupAssociations() {
  // --- 1. User & Expense (One-to-Many) ---
  User.hasMany(Expense, { foreignKey: "userId", onDelete: "CASCADE" });
  Expense.belongsTo(User, { foreignKey: "userId" });

  // --- 2. User & Order (One-to-Many) ---
  User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
  Order.belongsTo(User, { foreignKey: "userId" });

  // --- 3. User & ForgotPasswordRequest (One-to-Many) ---
  // MOVED INSIDE: This ensures the link is created during initialization
  User.hasMany(ForgotPasswordRequest, {
    foreignKey: "userId",
    onDelete: "CASCADE",
  });
  ForgotPasswordRequest.belongsTo(User, { foreignKey: "userId" });
}

module.exports = setupAssociations;
