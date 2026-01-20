const express = require("express");
const userController = require("../controllers/userController");

const route = express.Router();

route.post("/adduser", userController.addUser);

module.exports = route;
