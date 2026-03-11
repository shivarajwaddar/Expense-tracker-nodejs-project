const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Signup user
const signUpUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Generate a "salt" (extra randomness) and hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user in MySQL using Sequelize
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // Note: In a real app, hash this first!
    });

    res.status(201).json({
      message: "User created successfully!",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    // Handle duplicate emails or validation errors // err.name is bulit in like err.message
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Email already exists! Please signIn" });
    }
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// sign in user

const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 3. Generate Token (Including isPremium in the payload)
    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        isPremium: user.isPremium, // <-- CRITICAL: Include this so frontend sees it
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // 4. Send Success Response
    res.status(200).json({
      message: "Login successful",
      token: token,
      name: user.name,
      isPremium: user.isPremium, // <-- Send this for immediate UI update
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUser = async (req, res) => {
  try {
    // req.user is attached by the authenticate middleware
    if (!req.user) {
      return res.status(404).json({ message: "User context missing" });
    }

    res.status(200).json({
      name: req.user.name,
      isPremium: req.user.isPremium,
    });
  } catch (err) {
    console.error("GET USER ERROR:", err); // This will show the real error in your terminal
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  signUpUser,
  signInUser,
  getUser,
};
