const express = require("express");
const db = require("./util/db-connection");
const User = require("./models/userModel"); // Import your User model
const cors = require("cors");
const userRouter = require("./routes/userRoute");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// --- SIGNUP ROUTE ---
app.use("/api", userRouter);

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
