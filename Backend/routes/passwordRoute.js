const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

// Forgot password request (No auth needed)
router.post("/forgotpassword", passwordController.forgotPassword);

// Reset password action (ID is the UUID from the email link)
router.post("/resetpassword/:id", passwordController.resetPassword);

module.exports = router;
