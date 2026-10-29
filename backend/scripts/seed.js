import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Mandi from "../src/models/Mandi.js";
import Schedule from "../src/models/Schedule.js";
import QueueEntry from "../src/models/QueueEntry.js";
import Procurement from "../src/models/Procurement.js";
import Payment from "../src/models/Payment.js";
import Counter from "../src/models/Counter.js";
import { getNextTokenNumber } from "../src/utils/getNextTokenNumber.js";

const CROPS = ["WHEAT", "RICE", "ONION", "TOMATO", "POTATO"];
const MANDI_DATA = [
  { name: "Sultanpur Mandi", location: "Sultanpur, Uttar Pradesh" },
  { name: "Ayodhya Mandi", location: "Ayodhya, Uttar Pradesh" },
  { name: "Lucknow Mandi", location: "Lucknow, Uttar Pradesh" },
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randomInt(0, arr.length - 1)];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected. Clearing old data...");

  await Promise.all([
    User.deleteMany({}),
    Mandi.deleteMany({}),
    Schedule.deleteMany({}),
    QueueEntry.deleteMany({}),
    Procurement.deleteMany({}),
    Payment.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  const mandis = await Mandi.insertMany(MANDI_DATA);
  console.log(`Created ${mandis.length} Mandis`);

  const admins = [];
  for (let i = 0; i < mandis.length; i++) {
    const admin = await User.create({
      name: `Admin ${mandis[i].name.split(" ")[0]}`,
      phone: `90000000${i + 1}`,
      password: "password123",
      role: "MANDI_ADMIN",
      mandiId: mandis[i]._id,
    });
    admins.push(admin);
  }
  console.log(`Created ${admins.length} Mandi Admins`);

  const officer = await User.create({
    name: "Govt Officer",
    phone: "9000000099",
    password: "password123",
    role: "GOVT_OFFICER",
  });
  console.log("Created 1 Govt Officer");

  const farmers = [];
  for (let i = 1; i <= 50; i++) {
    const farmer = await User.create({
      name: `Farmer ${i}`,
      phone: `80000${String(i).padStart(5, "0")}`,
      password: "password123",
      role: "FARMER",
      email: `farmer${i}@example.com`
    });
    farmers.push(farmer);
  }
  console.log(`Created ${farmers.length} Farmers`);

  const schedules = [];
  for (const mandi of mandis) {
    for (const crop of [pick(CROPS), pick(CROPS)]) {
      const schedule = await Schedule.create({
        mandi: mandi._id,
        crop,
        date: new Date(),
        startTime: "09:00",
        endTime: "16:00",
        maxFarmers: 30,
        status: "OPEN",
      });
      schedules.push(schedule);
    }
  }
  console.log(`Created ${schedules.length} Schedules`);

  let farmerIndex = 0;
  for (const schedule of schedules) {
    const farmerCount = randomInt(8, 15);

    for (let i = 0; i < farmerCount && farmerIndex < farmers.length; i++) {
      const farmer = farmers[farmerIndex++];
      const tokenNumber = await getNextTokenNumber(schedule._id);

      const roll = Math.random();
      let status = "WAITING";
      if (roll < 0.6) status = "COMPLETED";
      else if (roll < 0.75) status = "WEIGHING";

      const checkedInAt = new Date(Date.now() - randomInt(10, 240) * 60000);
      const startedAt = status !== "WAITING" ? new Date(checkedInAt.getTime() + randomInt(2, 20) * 60000) : null;
      const completedAt = status === "COMPLETED" ? new Date(startedAt.getTime() + randomInt(3, 15) * 60000) : null;

      const entry = await QueueEntry.create({
        schedule: schedule._id,
        farmer: farmer._id,
        tokenNumber,
        status,
        checkedInAt,
        startedAt,
        completedAt,
        fiveLeftAlertEnabled: Math.random() < 0.5,
        fiveLeftAlertSent: status === "COMPLETED",
        turnAlertSent: status !== "WAITING",
      });

      if (status === "COMPLETED") {
        const quantity = randomInt(10, 80);
        const rate = randomInt(15, 40);
        const totalAmount = quantity * rate;

        const procurement = await Procurement.create({
          queueEntry: entry._id,
          crop: schedule.crop,
          quantity,
          rate,
          totalAmount,
        });

        const paymentRoll = Math.random();
        let paymentStatus = "PENDING";
        if (paymentRoll < 0.4) paymentStatus = "RELEASED";
        else if (paymentRoll < 0.7) paymentStatus = "PROCESSED";

        await Payment.create({
          procurement: procurement._id,
          amount: totalAmount,
          status: paymentStatus,
          releasedAt: paymentStatus === "RELEASED" ? new Date() : null,
        });
      }
    }
  }

  console.log(`\nDistributed ${farmerIndex} farmers into queue entries`);
  console.log("\n--- Login credentials (password: password123 for everyone) ---");
  console.log(`Govt Officer: ${officer.phone}`);
  admins.forEach((a, i) => console.log(`Admin (${mandis[i].name}): ${a.phone}`));
  console.log(`Sample Farmer: ${farmers[0].phone}`);

  await mongoose.disconnect();
};

run();