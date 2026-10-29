import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const ResendEmailProvider = {
  send: async (to, subject, message) => {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      text: message,
    });
  },
};