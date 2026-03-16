const Order = require("../models/orderModel");
const sequelize = require("../util/db-connection");
const { Cashfree } = require("cashfree-pg");
const User = require("../models/userModel");

// Initialize Cashfree with Environment Variables
Cashfree.XClientId = process.env.PAYMENT_APP_ID;
Cashfree.XClientSecret = process.env.PAYMENT_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

exports.createOrder = async (req, res) => {
  try {
    // --- UPDATED IP ADDRESS ---
    const publicIP = "3.109.121.108:3000";

    const orderId = `ORDER_${Date.now()}`;
    const userId = req.user.id;

    const request = {
      order_amount: 1.0,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: userId.toString(),
        customer_phone: "9876543210",
      },
      order_meta: {
        // Redirects back to frontend with the order_id in the URL
        return_url: `http://${publicIP}/Expenses/expense-tracker.html?order_id={order_id}`,
      },
    };

    console.log("Creating Cashfree Order for User:", userId);

    const response = await Cashfree.PGCreateOrder("2025-01-01", request);

    // 1. Save order to your database
    await Order.create({
      id: orderId,
      userId: userId,
      plan: "PREMIUM",
      amount: 1.0,
      status: "PENDING",
      paymentSessionId: response.data.payment_session_id,
    });

    // 2. Send session ID back to frontend
    res.status(201).json({
      payment_session_id: response.data.payment_session_id,
      order_id: orderId,
    });
  } catch (err) {
    console.error(
      "CASHFREE API ERROR:",
      err.response ? err.response.data : err.message,
    );

    res.status(500).json({
      error: "Could not create order",
      details: err.response ? err.response.data.message : err.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findOne({ where: { id: order_id } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the Order status to SUCCESS
    order.status = "SUCCESS";
    await order.save();

    // Update the User's premium status
    const user = await User.findByPk(order.userId);

    if (user) {
      await user.update({ isPremium: true });
      console.log(`User ${user.id} upgraded to PREMIUM`);
    }

    return res.status(200).json({
      success: true,
      message: "Transaction Successful and User Upgraded",
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

exports.verifyStatus = async (req, res) => {
  try {
    if (req.user && req.user.isPremium) {
      return res.json({ premium: true });
    }
    return res.json({ premium: false });
  } catch (err) {
    console.error("VERIFY STATUS ERROR:", err);
    res.status(500).json({ error: "Status check failed" });
  }
};
