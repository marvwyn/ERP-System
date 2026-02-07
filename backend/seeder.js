const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Account = require("./models/Account");

async function seed() {
  try {
    console.log("Mongo Connected ✅",process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log(process.env.MONGO_URI);
    console.log("Mongo Connected ✅");

    // -------------------------
    // 1️⃣ Seed Accounts
    // -------------------------

    const defaultAccounts = [
      { name: "CASH", type: "asset" },
      { name: "SALES", type: "income" },
      { name: "DISCOUNT", type: "expense" }
    ];

    for (const acc of defaultAccounts) {
      const exists = await Account.findOne({ name: acc.name });

      if (!exists) {
        await Account.create(acc);
        console.log(`Account ${acc.name} created`);
      } else {
        console.log(`Account ${acc.name} already exists`);
      }
    }

    // -------------------------
    // 2️⃣ Seed Users
    // -------------------------

    const ownerExists = await User.findOne({ username: "owner" });
    const employeeExists = await User.findOne({ username: "employee" });

    if (!ownerExists) {
      const hashedPassword = await bcrypt.hash(process.env.OWNER_PASS, 10);

      await User.create({
        name: "Owner User",
        username: "owner",
        password: hashedPassword,
        role: "owner"
      });

      console.log("Owner user created");
    } else {
      console.log("Owner already exists");
    }

    if (!employeeExists) {
      const hashedPassword = await bcrypt.hash(process.env.EMPLOYEE_PASS, 10);

      await User.create({
        name: "Employee User",
        username: "employee",
        password: hashedPassword,
        role: "employee"
      });

      console.log("Employee user created");
    } else {
      console.log("Employee already exists");
    }

    console.log("Seeding complete ✅");
    process.exit();

  } catch (error) {
    console.error("Seeder error ❌", error);
    process.exit(1);
  }
}

seed();