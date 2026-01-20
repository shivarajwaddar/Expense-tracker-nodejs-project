const express = require("express");
const userController = require("../controllers/userController");

const route = express.Router();

route.post("/signup/adduser", userController.signUpUser);
route.post("/signin", userController.signInUser);

module.exports = route;
