// controllers/passwordController.js
const User = require("../models/userModel");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest"); // Added import
const Brevo = require("@getbrevo/brevo");
const bcrypt = require("bcrypt");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Create a reset request in the database to get a unique UUID
    const resetRequest = await ForgotPasswordRequest.create({
      userId: user.id,
      isActive: true,
    });

    // 2. Initialize Brevo properly to fix ReferenceError
    const apiInstance = new Brevo.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    // 3. Setup dynamic reset link using the Request ID
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset Request";
    const resetLink = `http://127.0.0.1:5500/ExpenseTracker/Frontend/ForgotPassword/resetpassword.html?id=${resetRequest.id}`;
    sendSmtpEmail.htmlContent = `
            <html>
                <body>
                    <h1>Reset Your Password</h1>
                    <p>Click the link below to securely reset your password:</p>
                    <a href="${resetLink}" style="padding: 10px; background-color: blue; color: white; text-decoration: none;">
                        Reset My Password
                    </a>
                </body>
            </html>`;

    sendSmtpEmail.sender = {
      name: "Expense Tracker",
      email: "shivarajwaddar123@gmail.com", // Ensure this is verified in Brevo
    };
    sendSmtpEmail.to = [{ email: email }];

    // 4. Send the email
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ message: "Reset email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and deactivate the link
    await User.update(
      { password: hashedPassword },
      { where: { id: request.userId } },
    );
    await request.update({ isActive: false });

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
