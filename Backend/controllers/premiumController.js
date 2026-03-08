const User = require("../models/userModel");
const Expense = require("../models/expenseModel");
const sequelize = require("../util/db-connection");

/**
 * Fetches the global leaderboard with pagination.
 * Orders users by 'totalExpenses' in descending order.
 */
exports.getLeaderboard = async (req, res) => {
  try {
    // 1. Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Matches the leaderboard UI limit
    const offset = (page - 1) * limit;

    // 2. Fetch users and total count using findAndCountAll
    // We only pull id, name, and the pre-calculated totalExpenses column
    const { count, rows } = await User.findAndCountAll({
      attributes: ["id", "name", "totalExpenses"],
      order: [["totalExpenses", "DESC"]],
      limit: limit,
      offset: offset,
    });

    // 3. Send response with pagination metadata
    res.status(200).json({
      leaderboard: rows.map((user) => ({
        ...user.toJSON(),
        // Ensure totalExpenses is never null for the frontend
        totalExpenses: user.totalExpenses || 0,
      })),
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("LEADERBOARD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: err.message,
    });
  }
};
