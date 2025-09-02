import nodemailer from "nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  username: string,
  email: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // ✅ Create a Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // ✅ Compose email content
    const mailOptions = {
      from: `"Anonymous Message" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Anonymous Message - Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello, ${username} 👋</h2>
          <p>Here is your <strong>verification code</strong>:</p>
          <h1 style="color: #4CAF50;">${verifyCode}</h1>
          <p>This code will expire in <strong>1 Hour</strong>.</p>
          <br/>
          <p>Thanks,<br/>The Anonymous Message Team</p>
        </div>
      `,
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Verification email sent successfully ✅",
    };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return {
      success: false,
      message: "Failed to send verification email ❌",
    };
  }
}
