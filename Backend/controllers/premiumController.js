const User = require("../models/userModel");

const getLeaderboard = async (req, res) => {
  try {
    // 1. Fetch users and their pre-calculated totals directly
    const leaderboardData = await User.findAll({
      attributes: ["name", "totalExpenses"], // No math needed here!
      order: [["totalExpenses", "DESC"]], // Sort highest to lowest
    });

    // 2. Send the data (No sorting or looping required in JS)
    res.status(200).json(leaderboardData);
  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ error: "Could not fetch leaderboard" });
  }
};

module.exports = {
  getLeaderboard,
};
