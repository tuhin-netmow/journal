import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/academic_journal";

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@journal.ac.org";
  const password = process.env.ADMIN_PASSWORD || "AdminPassword2026!";
  const name = "Journal Chief Administrator";

  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);

  const existing = await User.findOne({ email: email.toLowerCase() });
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    existing.role = "admin";
    existing.isActive = true;
    await existing.save();
    console.log(`✓ Admin user [${email}] updated successfully.`);
  } else {
    await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "admin",
      isActive: true,
    });
    console.log(`✓ Admin user [${email}] created successfully.`);
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

createAdmin().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
