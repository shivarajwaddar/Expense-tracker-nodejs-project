const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticate = async (req, res, next) => {
  try {
    // 1. Pull the token from the request header
    const token = req.header("Authorization");

    // 2. If no token is provided, deny access
    if (!token) {
      return res.status(401).json({ success: false, message: "Token Missing" });
    }

    // 3. Verify the token using your Secret Key from .env
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user in the database using the ID stored in the token
    const user = await User.findByPk(decodedToken.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 5. VERY IMPORTANT: Attach the user object to the request (req)
    // This allows your Controllers to access the logged-in user via 'req.user'
    req.user = user;

    // 6. Move to the next function (the Controller)
    next();
  } catch (err) {
    console.error("Authentication Error:", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or Expired Token" });
  }
};

module.exports = {
  authenticate,
};
