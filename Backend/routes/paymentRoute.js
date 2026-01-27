const express = require("express");
const paymentController = require("../controllers/paymentController");
const userAuthentication = require("../middleware/auth");

const router = express.Router();
// Create order (protected)
router.post(
  "/buy-premium",
  userAuthentication.authenticate,
  paymentController.createOrder,
);

// Cashfree redirect (NO auth)
router.post("/verify", paymentController.verifyPayment);

module.exports = router;
