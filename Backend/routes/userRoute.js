const express = require("express");
const userController = require("../controllers/userController");
const userAuthentication = require("../middleware/auth");

const route = express.Router();

route.post("/signup/adduser", userController.signUpUser);
route.post("/signin", userController.signInUser);
route.get("/get-user", userAuthentication.authenticate, userController.getUser);

module.exports = route;
