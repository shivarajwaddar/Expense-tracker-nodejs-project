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
