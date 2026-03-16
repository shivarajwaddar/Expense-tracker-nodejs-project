const User = require("../models/userModel");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");
const Brevo = require("@getbrevo/brevo");
const bcrypt = require("bcrypt");

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Create reset request in DB
    const resetRequest = await ForgotPasswordRequest.create({
      userId: user.id,
      isActive: true,
    });

    // Initialize Brevo API
    const apiInstance = new Brevo.TransactionalEmailsApi();

    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    );

    // AWS Public IP
    const publicIP = "3.109.121.108";

    const resetLink = `http://${publicIP}/ExpenseTracker/Frontend/ForgotPassword/resetpassword.html?id=${resetRequest.id}`;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Password Reset Request";

    sendSmtpEmail.htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password.</p>
          <p>Click the button below to continue:</p>

          <a href="${resetLink}"
             style="padding:12px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">
             Reset Password
          </a>

          <p>If you did not request this, please ignore this email.</p>
        </body>
      </html>
    `;

    sendSmtpEmail.sender = {
      name: "Expense Tracker Support",
      email: "shivarajwaddar123@gmail.com",
    };

    sendSmtpEmail.to = [{ email: email }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return res.status(200).json({
      message: "Reset email sent successfully",
    });
  } catch (err) {
    console.error("BREVO ERROR:", err);

    return res.status(500).json({
      message: "Failed to send reset email",
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const request = await ForgotPasswordRequest.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!request) {
      return res.status(400).json({
        message: "This reset link is invalid or already used.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedPassword },
      { where: { id: request.userId } },
    );

    await request.update({
      isActive: false,
    });

    return res.status(200).json({
      message: "Password updated successfully. You can now login.",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);

    return res.status(500).json({
      message: "Password reset failed",
    });
  }
};
