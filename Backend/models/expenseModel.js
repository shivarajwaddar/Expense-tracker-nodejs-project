const sequelize = require("../util/db-connection");
const { DataTypes } = require("sequelize");

const Expenses = sequelize.define("expenses", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // ADD THIS TO MATCH YOUR MIGRATION
  note: {
    type: DataTypes.STRING,
    allowNull: true, // Optional field
  },
});

module.exports = Expenses;
