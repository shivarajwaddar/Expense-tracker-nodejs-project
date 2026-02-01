const User = require("../models/userModel");

exports.getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page from request
    const limit = 5; // Show only 5 people per page
    const offset = (page - 1) * limit; // Skip previous users

    const { count, rows } = await User.findAndCountAll({
      attributes: ["id", "name", "totalExpenses"],
      order: [["totalExpenses", "DESC"]], // Highest spending first
      limit: limit, //
      offset: offset, //
    });

    res.status(200).json({
      leaderboard: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
