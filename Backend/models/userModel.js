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
  // ADD THIS FIELD:
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Default status is a regular user
  },
});

module.exports = User;
