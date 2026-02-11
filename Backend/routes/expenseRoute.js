const express = require("express");
const userAuthentication = require("../middleware/auth");
const {
  getExpenses,
  addExpense,
  deleteExpense,
  downloadexpenses,
  getDownloadHistory,
} = require("../controllers/expenseController");
const route = express.Router();

route.get("/getexpenses", userAuthentication.authenticate, getExpenses);
route.post("/addexpense", userAuthentication.authenticate, addExpense);
route.delete(
  "/deleteexpense/:id",
  userAuthentication.authenticate,
  deleteExpense,
);
route.get(
  "/downloadexpenses",
  userAuthentication.authenticate,
  downloadexpenses,
);

route.get(
  "/downloadhistory",
  userAuthentication.authenticate,
  getDownloadHistory,
);

module.exports = route;
