// models/Order.js
const sequelize = require("../util/db-connection");
const { DataTypes } = require("sequelize");

const Order = sequelize.define("Order", {
  // Cashfree order_id
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  plan: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "PREMIUM",
  },

  amount: {
    type: DataTypes.INTEGER, // store in paise
    allowNull: false,
  },

  currency: {
    type: DataTypes.STRING,
    defaultValue: "INR",
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "PENDING", // PENDING | SUCCESS | FAILED
  },

  paymentSessionId: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  cfPaymentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Order;
