require("dotenv").config();

const express = require("express");
const db = require("./util/db-connection");
const cors = require("cors");

const userRouter = require("./routes/userRoute");
const expenseRouter = require("./routes/expenseRoute");
const paymentRouter = require("./routes/paymentRoute");
const setupAssociations = require("./util/associations");
const premiumRoutes = require("./routes/premiumRoute");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // IMPORTANT for Cashfree
app.use(cors());

// Health check
app.get("/", (req, res) => {
  res.send("Expense Tracker API is running");
});

// Associations
setupAssociations();

// Routes
app.use("/api/users", userRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/payment", paymentRouter);
// Mount the premium routes with the /api/premium prefix
app.use("/api/premium", premiumRoutes);

// DB & Server
db.sync({ alter: true })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.error("DB Connection Error:", err);
  });
