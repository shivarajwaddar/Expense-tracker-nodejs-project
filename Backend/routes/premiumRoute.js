const express = require("express");
const premiumController = require("../controllers/premiumController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// This matches the call in your premium.js:
// axios.get("http://localhost:3000/api/premium/leaderboard")
router.get("/leaderboard", authenticate, premiumController.getLeaderboard);

module.exports = router;
