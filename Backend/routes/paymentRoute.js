const express = require("express");
const paymentController = require("../controllers/paymentController");
const userAuthentication = require("../middleware/auth");

const router = express.Router();

// 1. Create order (protected)
router.post(
  "/buy-premium",
  userAuthentication.authenticate,
  paymentController.createOrder,
);

// 2. Cashfree redirect/webhook (No auth)
router.post("/verify", paymentController.verifyPayment);

// 3. Verify status for Frontend (protected)
// This was causing the error if "verifyStatus" was missing in the controller
router.post(
  "/verify-status",
  userAuthentication.authenticate,
  paymentController.verifyStatus,
);

module.exports = router;
