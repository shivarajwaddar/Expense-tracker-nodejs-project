const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const db = require("./util/db-connection");
const userRouter = require("./routes/userRoute");
const expenseRouter = require("./routes/expenseRoute");
const paymentRouter = require("./routes/paymentRoute");
const premiumRoutes = require("./routes/premiumRoute");
const forgotPasswordRoute = require("./routes/passwordRoute");
const setupAssociations = require("./util/associations");

const app = express();

setupAssociations();
app.use(cors());
app.use(bodyParser.json());

// serve frontend files
app.use(express.static(path.join(__dirname, "../Frontend")));

// API routes
app.use("/api/users", userRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/premium", premiumRoutes);
app.use("/api/password", forgotPasswordRoute);

console.log("Jenkins is automatically building this change!");

// Landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/Home/index.html"));
});

db.sync({ alter: true })
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("DB Connection Error:", err));
