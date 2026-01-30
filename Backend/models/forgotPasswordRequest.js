const { DataTypes } = require("sequelize");
const sequelize = require("../util/db-connection"); // Adjust path to your connection file

const ForgotPasswordRequest = sequelize.define("ForgotPasswordRequest", {
  // Primary key using UUID for a secure, unguessable reset link
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4, // Automatically generates a unique UUID
  },
  // Track if the link has already been used or has been invalidated
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // Link is active by default upon creation
  },
  // userId will be added automatically via association
});

module.exports = ForgotPasswordRequest;
