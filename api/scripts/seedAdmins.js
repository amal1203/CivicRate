import dotenv from "dotenv";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import Office from "../models/office.model.js";
import Admin from "../models/admin.model.js";

dotenv.config();

const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@123";

async function seedAdmins() {
  if (!process.env.MONGO) {
    throw new Error("MONGO is missing in .env");
  }

  await mongoose.connect(process.env.MONGO);
  console.log("Connected to MongoDB for admin seeding");

  const offices = await Office.find({}).select("_id name district").lean();
  if (offices.length === 0) {
    console.log("No offices found. Seed offices first.");
    return;
  }

  let created = 0;
  let updated = 0;

  for (const office of offices) {
    const normalizedOfficeName = String(office.name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const normalizedDistrict = String(office.district || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const email = `${normalizedOfficeName}.${normalizedDistrict}@civicrate.gov`;
    const name = `${office.name} Admin`;
    const passwordHash = bcryptjs.hashSync(defaultPassword, 10);

    const existing = await Admin.findOne({ officeId: office._id });
    if (!existing) {
      await Admin.create({
        name,
        email,
        password: passwordHash,
        officeId: office._id,
        role: "office_admin",
      });
      created += 1;
    } else {
      existing.name = name;
      existing.email = email;
      existing.password = passwordHash;
      existing.role = "office_admin";
      await existing.save();
      updated += 1;
    }
  }

  console.log(`Admin seed complete. Created: ${created}, Updated: ${updated}`);
  console.log(`Default password: ${defaultPassword}`);
}

seedAdmins()
  .catch((error) => {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
