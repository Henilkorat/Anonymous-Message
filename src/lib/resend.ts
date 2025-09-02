import { Resend } from "resend";

export const getResendInstance = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("❌ Missing RESEND_API_KEY in .env.local");
  }

  return new Resend(apiKey);
};
