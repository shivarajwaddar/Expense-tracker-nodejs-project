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

    // 2. Initialize Brevo properly (Direct Method)
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    );

    // 3. Setup dynamic reset link - UPDATED TO YOUR CURRENT AWS IP
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
                </body>
            </html>`;

    sendSmtpEmail.sender = {
      name: "Expense Tracker Support",
      email: "shivarajwaddar123@gmail.com",
    };
    sendSmtpEmail.to = [{ email: email }];

    // 4. Send the email and catch the specific response
    console.log("Attempting to send email to:", email);
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return res.status(200).json({ message: "Reset email sent successfully" });
  } catch (err) {
    // THIS LOGS THE REAL REASON IN PM2 LOGS
    console.error(
      "BREVO DETAILED ERROR:",
      err.response ? err.response.body : err,
    );

    return res.status(500).json({
      message: "Failed to send email.",
      error: err.response ? err.response.body.message : "Internal Server Error",
    });
  }
};
