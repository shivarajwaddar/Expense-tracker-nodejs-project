const Order = require("../models/orderModel");
const sequelize = require("../util/db-connection");
const { Cashfree } = require("cashfree-pg");

Cashfree.XClientId = process.env.PAYMENT_APP_ID;
Cashfree.XClientSecret = process.env.PAYMENT_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

exports.createOrder = async (req, res) => {
  try {
    const publicIP = "3.111.169.174:3000";

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
        return_url: `http://${publicIP}/Expenses/expense-tracker.html?order_id={order_id}`,
      },
    };

    const response = await Cashfree.PGCreateOrder("2025-01-01", request);

    await Order.create({
      id: orderId,
      userId: userId,
      plan: "PREMIUM",
      amount: 100,
      status: "PENDING",
      paymentSessionId: response.data.payment_session_id,
    });

    res.status(201).json({
      payment_session_id: response.data.payment_session_id,
      order_id: orderId,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Could not create order" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await Order.findOne({
      where: { order_id },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = "SUCCESS";
    await order.save();

    res.json({
      success: true,
      message: "Payment verified",
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500).json({
      error: "Payment verification failed",
    });
  }
};

exports.verifyStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await Order.findOne({
      where: { userId: userId, status: "SUCCESS" },
      order: [["createdAt", "DESC"]],
    });

    if (order) {
      return res.json({ premium: true });
    }

    return res.json({ premium: false });
  } catch (err) {
    console.error("VERIFY STATUS ERROR:", err);
    res.status(500).json({ error: "Status check failed" });
  }
};
