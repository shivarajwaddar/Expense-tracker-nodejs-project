const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const userAuthentication = require("../middleware/auth");

// Create order
router.post(
  "/buy-premium",
  userAuthentication.authenticate,
  paymentController.createOrder,
);

// Verify payment after redirect
router.post(
  "/verify",
  userAuthentication.authenticate,
  paymentController.verifyPayment,
);

// Check premium status
router.get(
  "/verify-status",
  userAuthentication.authenticate,
  paymentController.verifyStatus,
);

module.exports = router;
