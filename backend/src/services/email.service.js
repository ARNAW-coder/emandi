import { MockEmailProvider } from "./providers/mockEmailProvider.js";
import { ResendEmailProvider } from "./providers/resendEmailProvider.js";

const getProvider = () => {
  if (process.env.EMAIL_PROVIDER === "RESEND") return ResendEmailProvider;
  return MockEmailProvider;
};

export const sendEmail = async (to, subject, message) => {
  const provider = getProvider();
  await provider.send(to, subject, message);
};