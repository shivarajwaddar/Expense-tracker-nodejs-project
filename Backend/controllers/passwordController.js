const User = require("../models/userModel");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");
const Brevo = require("@getbrevo/brevo");
const bcrypt = require("bcrypt");

// --- 1. FORGOT PASSWORD FUNCTION ---
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetRequest = await ForgotPasswordRequest.create({
      userId: user.id,
      isActive: true,
    });

    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    );

    const publicIP = "3.109.121.108";
    const resetLink = `http://${publicIP}/ExpenseTracker/Frontend/ForgotPassword/resetpassword.html?id=${resetRequest.id}`;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset Request";
    sendSmtpEmail.htmlContent = `<html><body><h2>Reset Your Password</h2><a href="${resetLink}">Reset My Password</a></body></html>`;
    sendSmtpEmail.sender = {
      name: "Support",
      email: "shivarajwaddar123@gmail.com",
    };
    sendSmtpEmail.to = [{ email: email }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return res.status(200).json({ message: "Reset email sent" });
  } catch (err) {
    console.error("BREVO ERROR:", err);
    return res.status(500).json({ message: "Failed to send email" });
  }
};

// --- 2. RESET PASSWORD FUNCTION (MISSING THIS CAUSES THE CRASH) ---
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const request = await ForgotPasswordRequest.findOne({
      where: { id, isActive: true },
    });
    if (!request) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword },
      { where: { id: request.userId } },
    );
    await request.update({ isActive: false });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("RESET ERROR:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
