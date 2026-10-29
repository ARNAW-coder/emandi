export const MockSmsProvider = {
  send: async (phone, message) => {
    console.log(`[MOCK SMS] Sending to ${phone}: ${message}`);
  },
};