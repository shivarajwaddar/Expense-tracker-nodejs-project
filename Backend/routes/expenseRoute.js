const express = require("express");
const {
  getExpenses,
  addExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const route = express.Router();

route.get("/getexpenses", getExpenses);
route.post("/addexpense", addExpense);
route.delete("/deleteexpense/:id", deleteExpense);

module.exports = route;
