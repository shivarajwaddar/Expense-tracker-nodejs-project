const User = require("../models/userModel");

const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Create the user in MySQL using Sequelize
    const newUser = await User.create({
      name,
      email,
      password, // Note: In a real app, hash this first!
    });

    res.status(201).json({
      message: "User created successfully!",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    // Handle duplicate emails or validation errors // err.name is bulit in like err.message
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email already exists!" });
    }
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addUser,
};
