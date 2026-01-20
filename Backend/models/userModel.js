const sequelize = require("../util/db-connection");
const { DataTypes } = require("sequelize");

const User = sequelize.define("db_user", {
  // Changed firstName to name to match your frontend input 'id="name"'
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Prevents duplicate accounts with the same email
    validate: {
      isEmail: true, // Ensures the data actually looks like an email address
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
