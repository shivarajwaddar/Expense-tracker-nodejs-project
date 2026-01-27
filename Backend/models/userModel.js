const sequelize = require("../util/db-connection");
const { DataTypes } = require("sequelize");

const User = sequelize.define("db_user", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  totalExpenses: {
    type: DataTypes.INTEGER, // Changed from Sequelize.INTEGER to DataTypes.INTEGER
    defaultValue: 0,
  },
});

module.exports = User;
