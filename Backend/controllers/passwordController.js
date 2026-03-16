const User = require("../models/userModel");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");
const SibApiV3Sdk = require("@getbrevo/brevo"); // Use the correct SDK name
const bcrypt = require("bcrypt");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Create a reset request in the database
    const resetRequest = await ForgotPasswordRequest.create({
      userId: user.id,
      isActive: true,
    });

    // 2. Initialize Brevo correctly
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // Configure API Key from your .env file
    const apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    // 3. Setup dynamic reset link
    const publicIP = "3.109.121.108";
    const resetLink = `http://${publicIP}/ExpenseTracker/Frontend/ForgotPassword/resetpassword.html?id=${resetRequest.id}`;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset Request";
    sendSmtpEmail.htmlContent = `
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset your password. Click the button below to proceed:</p>
                    <div style="margin: 20px 0;">
                        <a href="${resetLink}" style="padding: 12px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Reset My Password
                        </a>
                    </div>
                    <p>If you did not request this, please ignore this email.</p>
                    <p>The link will remain active until you use it.</p>
                </body>
            </html>`;

    sendSmtpEmail.sender = {
      name: "Expense Tracker Support",
      email: process.env.BREVO_EMAIL, // Uses the sender email from your .env
    };
    sendSmtpEmail.to = [{ email: email }];

    // 4. Send the email
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return res.status(200).json({ message: "Reset email sent successfully" });
  } catch (err) {
    // Logging specific error details for debugging
    console.error(
      "BREVO ERROR DETAIL:",
      err.response ? err.response.body : err,
    );
    return res.status(500).json({
      message:
        "Failed to send email. Ensure your API key and Sender Email are valid.",
      error: err.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    // Find the active request by UUID
    const request = await ForgotPasswordRequest.findOne({
      where: { id, isActive: true },
    });

    if (!request) {
      return res.status(400).json({
        message: "This link is invalid or has already been used.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await User.update(
      { password: hashedPassword },
      { where: { id: request.userId } },
    );

    // Deactivate the reset link
    await request.update({ isActive: false });

    return res.status(200).json({
      message: "Password updated successfully! You can now login.",
    });
  } catch (err) {
    console.error("RESET ERROR:", err);
    return res.status(500).json({
      message: "Something went wrong during password update.",
    });
  }
};
