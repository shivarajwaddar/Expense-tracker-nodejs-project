const Order = require("../models/orderModel");
const User = require("../models/userModel");
const sequelize = require("../util/db-connection");
const { Cashfree } = require("cashfree-pg");

// 1. SDK Initialization (v4.0.10 Style)
Cashfree.XClientId = process.env.PAYMENT_APP_ID;
Cashfree.XClientSecret = process.env.PAYMENT_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX; // Change to PRODUCTION for live payments

/**
 * STEP 1: Create Order
 */
exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id;

    const orderId = `ORDER_${Date.now()}`;
    const amount = plan === "PREMIUM" ? 1.0 : 0.0;

    // FIXED: Updated return_url to use the AWS Public IP
    const publicIP = "3.111.169.174";
    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: userId.toString(),
        customer_phone: "9876543210",
      },
      order_meta: {
        return_url: `http://${publicIP}/ExpenseTracker/Frontend/Expenses/expense-tracker.html?order_id={order_id}`,
      },
    };

    const response = await Cashfree.PGCreateOrder("2025-01-01", request);

    await Order.create({
      id: orderId,
      userId: userId,
      plan: plan || "PREMIUM",
      amount: amount * 100,
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

/**
 * STEP 2: Verify Payment (From Gateway)
 */
exports.verifyPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { order_id } = req.body;
    if (!order_id)
      return res.status(400).json({ error: "Order ID is required" });

    const response = await Cashfree.PGOrderFetchPayments(
      "2025-01-01",
      order_id,
    );
    const successfulPayment = response.data.find(
      (p) => p.payment_status === "SUCCESS",
    );

    if (successfulPayment) {
      const order = await Order.findOne({
        where: { id: order_id },
        transaction: t,
      });

      if (order && order.status !== "SUCCESS") {
        await order.update(
          {
            status: "SUCCESS",
            cfPaymentId: successfulPayment.cf_payment_id.toString(),
          },
          { transaction: t },
        );

        await User.update(
          { isPremium: true },
          { where: { id: order.userId }, transaction: t },
        );
        await t.commit();
        return res.status(200).json({ message: "Payment successful!" });
      }
      await t.rollback();
      return res.status(200).json({ message: "Order already processed." });
    } else {
      await Order.update({ status: "FAILED" }, { where: { id: order_id } });
      await t.rollback();
      return res.status(400).json({ message: "Payment failed." });
    }
  } catch (err) {
    if (t) await t.rollback();
    res
      .status(500)
      .json({ error: "Internal Server Error during verification" });
  }
};

/**
 * STEP 3: Verify Status (MISSING FUNCTION - FIXED)
 * This is called by the frontend to refresh the UI badge.
 */
exports.verifyStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    // Check if user is premium in our DB
    const user = await User.findByPk(userId);

    if (user && user.isPremium) {
      return res
        .status(200)
        .json({ success: true, message: "User is Premium" });
    }

    res.status(200).json({ success: false, message: "Not a premium user" });
  } catch (err) {
    console.error("VERIFY STATUS ERROR:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
