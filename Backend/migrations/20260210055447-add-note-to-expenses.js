"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the 'note' column to 'Expenses' table
    await queryInterface.addColumn("Expenses", "note", {
      type: Sequelize.STRING,
      allowNull: true, // Notes are usually optional
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the 'note' column if we rollback
    await queryInterface.removeColumn("Expenses", "note");
  },
};
