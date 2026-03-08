require("dotenv").config();

const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

const express = require("express");
const db = require("./util/db-connection");
const cors = require("cors");

const userRouter = require("./routes/userRoute");
const expenseRouter = require("./routes/expenseRoute");
const paymentRouter = require("./routes/paymentRoute");
const setupAssociations = require("./util/associations");
const premiumRoutes = require("./routes/premiumRoute");
const forgotPasswordRoute = require("./routes/passwordRoute");

const app = express();

// --- LOGGING SETUP ---
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
);

app.use(morgan("dev"));
app.use(morgan("combined", { stream: accessLogStream }));
// ---------------------

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health check
app.get("/", (req, res) => {
  res.send("Expense Tracker API is running");
});

// Associations
setupAssociations();

// --- DEPLOYMENT ROUTES ---
// Using "/api/users" (plural) to match your frontend Axios calls
app.use("/api/users", userRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/premium", premiumRoutes);
app.use("/api/password", forgotPasswordRoute);

// DB & Server
db.sync({ alter: true })
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`>>> Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Connection Error:", err);
  });
