export const MockEmailProvider = {
  send: async (to, subject, message) => {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | ${message}`);
  },
};