const Expense = require("../models/expenseModel"); // Renamed to singular for consistency
const sequelize = require("../util/db-connection");

const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini with your API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Get ONLY the logged-in user's expenses
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Add expense

const addExpense = async (req, res) => {
  // 1. Start the transaction
  const t = await sequelize.transaction();

  try {
    let { amount, description, category } = req.body;
    let finalCategory = category || "Uncategorized";

    // AI Classification logic (keep this outside the DB write if possible)
    try {
      const prompt = `Classify this expense: "${description}". Reply with only the category name (one word).`;
      const result = await ai.models.generateContent(prompt);
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

    // 2. Create the Expense (attached to transaction t)
    const newExpense = await Expense.create(
      {
        amount,
        description,
        category: finalCategory,
        userId: req.user.id,
      },
      { transaction: t },
    );

    // 3. Update the User's aggregate total (attached to transaction t)
    const updatedTotal = Number(req.user.totalExpenses) + Number(amount);
    await req.user.update({ totalExpenses: updatedTotal }, { transaction: t });

    // 4. If both operations succeed, commit them to the database
    await t.commit();

    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (error) {
    // 5. If ANY operation fails, roll back the changes to keep data consistent
    if (t) await t.rollback();

    console.error("ADD EXPENSE ERROR:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
// const addExpense = async (req, res) => {
//   try {
//     const { amount, description, category } = req.body;

//     const newExpense = await Expense.create({
//       amount,
//       description,
//       category,
//       userId: req.user.id,
//     });

//     const totalExpenses = Number(req.user.totalExpenses) + Number(amount);
//     await req.user.update({ totalExpenses: totalExpenses });

//     res.status(201).json({
//       message: "Expense added successfully",
//       expense: newExpense,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// 3. Delete expense

const deleteExpense = async (req, res) => {
  // 1. Start the transaction
  const t = await sequelize.transaction();

  try {
    const expenseId = req.params.id;

    // Find the expense specifically for this user
    const expense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id },
      transaction: t, // Use transaction for the read to ensure data consistency
    });

    if (!expense) {
      await t.rollback(); // Clean up the transaction before returning
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized" });
    }

    // 2. Calculate the new total
    // Safety check: Ensure total doesn't drop below 0
    const newTotal = Math.max(
      0,
      Number(req.user.totalExpenses) - Number(expense.amount),
    );

    // 3. Update the User's aggregate total
    await req.user.update({ totalExpenses: newTotal }, { transaction: t });

    // 4. Delete the expense record
    await expense.destroy({ transaction: t });

    // 5. If everything succeeded, commit to the database
    await t.commit();

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    // 6. Rollback if any step fails
    if (t) await t.rollback();

    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};
// const deleteExpense = async (req, res) => {
//   try {
//     const expenseId = req.params.id;

//     const expense = await Expense.findOne({
//       where: { id: expenseId, userId: req.user.id },
//     });

//     if (!expense) {
//       return res
//         .status(404)
//         .json({ message: "Expense not found or unauthorized" });
//     }

//     // Logic: Subtract amount from the user's totalExpenses
//     const updatedTotal =
//       Number(req.user.totalExpenses) - Number(expense.amount);

//     // Update user first, then destroy the expense
//     await req.user.update({ totalExpenses: updatedTotal });
//     await expense.destroy();

//     res.status(200).json({ message: "Expense deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

module.exports = { getExpenses, addExpense, deleteExpense };
