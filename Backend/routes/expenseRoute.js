const express = require("express");
const userAuthentication = require("../middleware/auth");
const {
  getExpenses,
  addExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const route = express.Router();

route.get("/getexpenses", userAuthentication.authenticate, getExpenses);
route.post("/addexpense", userAuthentication.authenticate, addExpense);
route.delete(
  "/deleteexpense/:id",
  userAuthentication.authenticate,
  deleteExpense,
);

module.exports = route;
