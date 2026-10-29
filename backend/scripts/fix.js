import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const fixEmailIndex = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    // Check current indexes
    console.log("\n--- Checking current indexes ---");
    const indexes = await User.collection.getIndexes();
    console.log("Current indexes:");
    // indexes is an object, not an array
    Object.keys(indexes).forEach(key => {
      const idx = indexes[key];
      console.log(`  - ${key}:`, {
        key: idx.key,
        unique: idx.unique || false,
        sparse: idx.sparse || false
      });
    });

    // Drop the email index if it exists
    console.log("\n--- Dropping email_1 index ---");
    try {
      await User.collection.dropIndex('email_1');
      console.log("✅ Successfully dropped email_1 index");
    } catch (error) {
      if (error.code === 27) {
        console.log("ℹ️  email_1 index doesn't exist, skipping drop");
      } else {
        console.log("⚠️  Error dropping index:", error.message);
      }
    }

    // Create new index with sparse: true
    console.log("\n--- Creating new sparse unique index on email ---");
    try {
      await User.collection.createIndex(
        { email: 1 },
        { 
          unique: true, 
          sparse: true,
          name: 'email_1'
        }
      );
      console.log("✅ Successfully created email_1 index with sparse: true");
    } catch (error) {
      console.log("❌ Error creating index:", error.message);
      throw error;
    }

    // Verify the new index
    console.log("\n--- Verifying new index ---");
    const newIndexes = await User.collection.getIndexes();
    const emailIndex = newIndexes['email_1'];
    if (emailIndex) {
      console.log("✅ Email index created successfully:");
      console.log(`  - Unique: ${emailIndex.unique}`);
      console.log(`  - Sparse: ${emailIndex.sparse}`);
      console.log(`  - Key:`, emailIndex.key);
    } else {
      console.log("❌ Email index not found!");
    }

    console.log("\n✅ Index fix completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

fixEmailIndex();