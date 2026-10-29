import { MockSmsProvider } from "./providers/mockSmsProvider.js";
// import { RealSmsProvider } from "./providers/realSmsProvider.js"; // add this when you get an API

const getProvider = () => {
  if (!process.env.SMS_PROVIDER || process.env.SMS_PROVIDER === "NONE") return null;
  if (process.env.SMS_PROVIDER === "MOCK") return MockSmsProvider;
  // if (process.env.SMS_PROVIDER === "REAL") return RealSmsProvider;
  return null;
};

export const isSmsAvailable = () => getProvider() !== null;

export const sendSMS = async (phone, message) => {
  const provider = getProvider();
  if (!provider) throw new Error("No SMS provider configured");
  await provider.send(phone, message);
};