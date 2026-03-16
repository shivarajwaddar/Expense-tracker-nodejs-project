const User = require("../models/userModel");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");
const Brevo = require("@getbrevo/brevo");
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

    // 2. Initialize Brevo properly
    const defaultClient = Brevo.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new Brevo.TransactionalEmailsApi();

    // 3. Setup dynamic reset link
    // FIXED: Change this to your AWS Public IP or Domain
    const publicIP = "3.109.121.108";
    const resetLink = `http://${publicIP}/ExpenseTracker/Frontend/ForgotPassword/resetpassword.html?id=${resetRequest.id}`;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
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
      email: "shivarajwaddar123@gmail.com",
    };
    sendSmtpEmail.to = [{ email: email }];

    // 4. Send the email
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ message: "Reset email sent successfully" });
  } catch (err) {
    console.error("BREVO ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to send email. Please check server logs." });
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
      return res
        .status(400)
        .json({ message: "This link is invalid or has already been used." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and deactivate the link (Transaction-like behavior)
    await User.update(
      { password: hashedPassword },
      { where: { id: request.userId } },
    );

    await request.update({ isActive: false });

    res
      .status(200)
      .json({ message: "Password updated successfully! You can now login." });
  } catch (err) {
    console.error("RESET ERROR:", err);
    res
      .status(500)
      .json({ message: "Something went wrong during password update." });
  }
};
