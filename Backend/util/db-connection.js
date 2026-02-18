const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME, // This will pull "expense_tracker"
  process.env.DB_USER, // This will pull "root"
  process.env.DB_PASSWORD, // This will pull "Shiva@123"
  {
    host: process.env.DB_HOST, // This will pull "localhost"
    dialect: "mysql",
  },
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

connectDB();

module.exports = sequelize;
