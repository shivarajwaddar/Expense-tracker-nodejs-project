const SibApiV3Sdk = require("sib-api-v3-sdk");
const uuid = require("uuid");
const User = require("../models/userModel");
const ForgotPasswordRequest = require("../models/forgotPasswordModel");

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const id = uuid.v4();

    await ForgotPasswordRequest.create({
      id: id,
      isActive: true,
      userId: user.id,
    });

    // Brevo configuration
    const client = SibApiV3Sdk.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_SMTP_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const sender = {
      email: process.env.BREVO_EMAIL,
      name: "Expense Tracker",
    };

    const receivers = [
      {
        email: email,
      },
    ];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Reset Your Password",
      htmlContent: `
        <h2>Password Reset</h2>
        <p>Click below link to reset your password</p>
        <a href="http://3.109.121.108/password/reset/${id}">
        Reset Password
        </a>
      `,
    });

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    console.log("BREVO ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
