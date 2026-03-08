const express = require("express");
const path = require("path"); // Required for file paths
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const db = require("./util/db-connection");
const userRouter = require("./routes/userRoute");
const expenseRouter = require("./routes/expenseRoute");
const paymentRouter = require("./routes/paymentRoute");
const premiumRoutes = require("./routes/premiumRoute");
const forgotPasswordRoute = require("./routes/forgotPasswordRoute");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// --- STATIC FILE SERVICING ---
// This line allows the browser to access files inside the Frontend folder
app.use(express.static(path.join(__dirname, "../Frontend")));

// --- API ROUTES ---
app.use("/api/users", userRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/premium", premiumRoutes);
app.use("/api/password", forgotPasswordRoute);

// --- FRONTEND ROUTE ---
// Serves the signin page as the default landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/Signin/signin.html"));
});

// Database Sync & Server Start
db.sync({ alter: true })
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`>>> Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("DB Connection Error:", err));
