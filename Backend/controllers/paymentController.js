const Order = require("../models/orderModel");
const User = require("../models/userModel");
const { Cashfree } = require("cashfree-pg");

Cashfree.XClientId = process.env.PAYMENT_APP_ID;
Cashfree.XClientSecret = process.env.PAYMENT_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const publicIP = "3.109.121.108";
    const userId = req.user.id;

    const orderId = `ORDER_${Date.now()}_${userId}`;

    const request = {
      order_amount: 1,
      order_currency: "INR",
      order_id: orderId,

      customer_details: {
        customer_id: userId.toString(),
        customer_phone: "9999999999",
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
      amount: 1,
      currency: "INR",
      status: "PENDING",
      paymentSessionId: response.data.payment_session_id,
    });

    res.status(201).json({
      payment_session_id: response.data.payment_session_id,
      order_id: orderId,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "Could not create order",
    });
  }
};

// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await Order.findOne({
      where: { id: order_id },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = "SUCCESS";
    order.cfPaymentId = "CASHFREE_PAYMENT";

    await order.save();

    const user = await User.findByPk(order.userId);

    if (user) {
      await user.update({
        isPremium: true,
      });
    }

    res.json({
      success: true,
      message: "User upgraded to Premium",
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);

    res.status(500).json({
      error: "Payment verification failed",
    });
  }
};

// CHECK PREMIUM STATUS
exports.verifyStatus = async (req, res) => {
  try {
    if (req.user.isPremium) {
      return res.json({
        premium: true,
      });
    }

    res.json({
      premium: false,
    });
  } catch (err) {
    console.error("STATUS ERROR:", err);

    res.status(500).json({
      error: "Status check failed",
    });
  }
};
