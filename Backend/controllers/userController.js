const User = require("../models/userModel");
const bcrypt = require("bcrypt");

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

    // 1. Find the user by the email provided in the request
    const user = await User.findOne({
      where: {
        email: email, // Use the dynamic email from req.body
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found! Please Signup" });
    }

    // 3. Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 4. Send positive response if both email and password match
    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Sign-in error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  signUpUser,
  signInUser,
};
