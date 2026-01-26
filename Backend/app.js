require("dotenv").config();

const express = require("express");
const db = require("./util/db-connection");
const User = require("./models/userModel"); // Import your User model
const cors = require("cors");
const userRouter = require("./routes/userRoute");
const expenseRouter = require("./routes/expenseRoute");
const setupAssociations = require("./util/associations"); // Import the folder/file

// ... other imports and middleware ...

// CALL THE ASSOCIATIONS BEFORE SYNCING

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

setupAssociations();

// --- SIGNUP ROUTE ---
app.use("/api/users", userRouter);
app.use("/api/expense", expenseRouter);

// Database Sync and Server Start
db.sync({ force: false })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is listening on port 3000");
    });
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });
