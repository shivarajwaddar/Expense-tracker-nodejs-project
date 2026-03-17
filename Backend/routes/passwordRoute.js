const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

// Forgot password request (No auth needed)
router.post("/forgotpassword", passwordController.forgotPassword);

// Reset password action - Changed to "/reset/:id" to match Frontend Axios call
router.post("/reset/:id", passwordController.resetPassword);

module.exports = router;
