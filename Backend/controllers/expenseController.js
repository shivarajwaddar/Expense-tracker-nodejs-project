const Expense = require("../models/expenseModel");
const sequelize = require("../util/db-connection");
const DownloadedFile = require("../models/downloadedFiles");
const AWS = require("aws-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Corrected Import name

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Initialize Model

// 1. Get Expenses with Pagination
const getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Expense.findAndCountAll({
      where: { userId: req.user.id },
      limit: limit,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      expenses: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Add Expense with AI and Transactions
const addExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    let { amount, description, category } = req.body;
    let finalCategory = category || "Uncategorized";

    // AI Classification logic - FIXED SYNTAX
    try {
      const prompt = `Classify this expense: "${description}". Reply with only the category name (one word).`;
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text().trim();

      if (aiResponse) {
        finalCategory = aiResponse;
      }
    } catch (err) {
      console.error(
        "AI failed. Staying with frontend category:",
        finalCategory,
      );
    }

    const newExpense = await Expense.create(
      {
        amount,
        description,
        category: finalCategory,
        userId: req.user.id,
        note: `Added via API on ${new Date().toLocaleDateString()}`,
      },
      { transaction: t },
    );

    const updatedTotal = Number(req.user.totalExpenses) + Number(amount);
    await req.user.update({ totalExpenses: updatedTotal }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error("ADD EXPENSE ERROR:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 3. Delete Expense with Transactions
const deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const expenseId = req.params.id;

    const expense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id },
      transaction: t,
    });

    if (!expense) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized" });
    }

    const newTotal = Math.max(
      0,
      Number(req.user.totalExpenses) - Number(expense.amount),
    );

    await req.user.update({ totalExpenses: newTotal }, { transaction: t });
    await expense.destroy({ transaction: t });

    await t.commit();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    if (t) await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// 4. S3 Upload Logic
function uploadToS3(stringifiedExpenses, fileName) {
  const s3bucket = new AWS.S3({
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
    region: process.env.REGION,
  });

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: stringifiedExpenses,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, data) => {
      if (err) reject(err);
      else resolve(data.Location);
    });
  });
}

// 5. Download Expenses
const downloadexpenses = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    const stringifiedExpenses = JSON.stringify(expenses);

    const date = new Date().toISOString().split("T")[0];
    const fileName = `Expense_User${req.user.id}_${date}.txt`;

    const fileUrl = await uploadToS3(stringifiedExpenses, fileName);

    await DownloadedFile.create({
      fileUrl: fileUrl,
      fileName: fileName,
      dbUserId: req.user.id,
    });

    res.status(200).json({ fileUrl, success: true });
  } catch (err) {
    res.status(500).json({ fileUrl: "", success: false, err: err.message });
  }
};

// 6. Get Download History
const getDownloadHistory = async (req, res) => {
  try {
    const history = await DownloadedFile.findAll({
      where: { dbUserId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ history, success: true });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = {
  getExpenses,
  addExpense,
  deleteExpense,
  downloadexpenses,
  getDownloadHistory,
};
