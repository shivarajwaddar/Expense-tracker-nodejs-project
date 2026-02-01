const Order = require("../models/orderModel");
const User = require("../models/userModel");
const sequelize = require("../util/db-connection");
const { Cashfree } = require("cashfree-pg");

// 1. SDK Initialization (v4.0.10 Style)
Cashfree.XClientId = process.env.PAYMENT_APP_ID;
Cashfree.XClientSecret = process.env.PAYMENT_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

/**
 * STEP 1: Create Order
 */
exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.id; // From your Auth Middleware

    const orderId = `ORDER_${Date.now()}`;
    const amount = plan === "PREMIUM" ? 1.0 : 0.0; // Cashfree expects Rupees (decimal)

    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: userId.toString(),
        customer_phone: "9876543210", // Should be dynamic in production
      },
      order_meta: {
        // {order_id} is a placeholder Cashfree replaces automatically
        return_url: `http://127.0.0.1:5500/ExpenseTracker/Frontend/Expenses/expense-tracker.html?order_id={order_id}`,
      },
    };

    // Call Cashfree API
    const response = await Cashfree.PGCreateOrder("2025-01-01", request);

    // Save PENDING order to database
    await Order.create({
      id: orderId,
      userId: userId,
      plan: plan || "PREMIUM",
      amount: amount * 100, // Convert to Paise for your model
      status: "PENDING",
      paymentSessionId: response.data.payment_session_id,
    });

    // Send session ID to frontend
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
 * STEP 2: Verify Payment
 *
 */
/**
 * Verifies the payment status with Cashfree and upgrades user to Premium.
 * Uses a Database Transaction to ensure data consistency.
 */
exports.verifyPayment = async (req, res) => {
  // 1. Initialize a Sequelize transaction to ensure "all-or-nothing" execution
  const t = await sequelize.transaction();

  try {
    const { order_id } = req.body;

    // Validate request input
    if (!order_id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // 2. Fetch payment details from Cashfree API to verify the actual status
    const response = await Cashfree.PGOrderFetchPayments(
      "2025-01-01",
      order_id,
    );

    // Find if any payment attempt for this order has a 'SUCCESS' status
    const successfulPayment = response.data.find(
      (p) => p.payment_status === "SUCCESS",
    );

    if (successfulPayment) {
      // Fetch the order from our local DB using the transaction lock
      const order = await Order.findOne({
        where: { id: order_id },
        transaction: t,
      });

      // Check if order exists and hasn't been processed yet (prevents double-upgrading)
      if (order && order.status !== "SUCCESS") {
        // 3. Update Order record with success status and Cashfree Reference ID
        await order.update(
          {
            status: "SUCCESS",
            cfPaymentId: successfulPayment.cf_payment_id.toString(),
          },
          { transaction: t },
        );

        // 4. Grant Premium access to the user
        await User.update(
          { isPremium: true },
          { where: { id: order.userId }, transaction: t },
        );

        // 5. If both updates succeed, permanently save changes to the database
        await t.commit();

        return res
          .status(200)
          .json({ message: "Payment successful! User is now Premium." });
      }

      // If order was already SUCCESS, rollback the transaction (no changes needed)
      await t.rollback();
      return res.status(200).json({ message: "Order already processed." });
    } else {
      // 6. If no successful payment found, mark our local order as FAILED
      await Order.update({ status: "FAILED" }, { where: { id: order_id } });

      // Rollback the transaction since the premium upgrade shouldn't happen
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Payment failed or is still pending." });
    }
  } catch (err) {
    // 7. Critical Error: Rollback any database changes to prevent partial data updates
    if (t) await t.rollback();

    console.error("VERIFICATION ERROR:", err.message);
    res
      .status(500)
      .json({ error: "Internal Server Error during verification" });
  }
};
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { order_id } = req.body; // Sent from your frontend after redirect

//     if (!order_id)
//       return res.status(400).json({ error: "Order ID is required" });

//     // Fetch all payments for this order from Cashfree
//     const response = await Cashfree.PGOrderFetchPayments(
//       "2025-01-01",
//       order_id,
//     );

//     // Check if any attempt was successful
//     const successfulPayment = response.data.find(
//       (p) => p.payment_status === "SUCCESS",
//     );

//     if (successfulPayment) {
//       // Find our local order record
//       const order = await Order.findOne({ where: { id: order_id } });

//       if (order && order.status !== "SUCCESS") {
//         // Update Order table
//         await order.update({
//           status: "SUCCESS",
//           cfPaymentId: successfulPayment.cf_payment_id.toString(),
//         });

//         // Update User table to Premium
//         await User.update({ isPremium: true }, { where: { id: order.userId } });

//         return res
//           .status(200)
//           .json({ message: "Payment successful, welcome to Premium!" });
//       }
//       return res.status(200).json({ message: "Already updated" });
//     } else {
//       await Order.update({ status: "FAILED" }, { where: { id: order_id } });
//       return res.status(400).json({ message: "Payment failed or incomplete" });
//     }
//   } catch (err) {
//     console.error("VERIFY ERROR:", err.response?.data || err.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
