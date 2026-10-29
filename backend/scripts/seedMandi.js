import dotenv from "dotenv";
import mongoose from "mongoose";
import Mandi from "../src/models/Mandi.js";

dotenv.config({path:"../.env"});
const run = async () => {
  await mongoose.connect("mongodb+srv://arnawtripathi25072007_db_user:7NZHOQia49yheEO8@cluster0.1j9f0ri.mongodb.net/emandi");

  await Mandi.deleteMany({});
  const mandis = await Mandi.insertMany([
    { name: "Sultanpur Mandi", location: "Sultanpur, Uttar Pradesh" },
    { name: "Ayodhya Mandi", location: "Ayodhya, Uttar Pradesh" },
    { name: "Lucknow Mandi", location: "Lucknow, Uttar Pradesh" },
  ]);

  console.log("Seeded Mandis:");
  mandis.forEach((m) => console.log(`  ${m._id}  ${m.name}`));

  await mongoose.disconnect();
};

run();