import dotenv from "dotenv";
import mongoose from "mongoose";
import VisitCode from "../models/visitCode.model.js";

dotenv.config();

const formatIndiaDate = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(date);

async function cleanupVisitCodes() {
  if (!process.env.MONGO) {
    throw new Error("MONGO is missing in .env");
  }

  await mongoose.connect(process.env.MONGO);
  console.log("Connected to MongoDB for cleanup");

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const cutoffValidOn = formatIndiaDate(cutoffDate);

  const result = await VisitCode.deleteMany({ validOn: { $lt: cutoffValidOn } });

  console.log(
    `Cleanup complete. Removed ${result.deletedCount || 0} visit codes older than ${cutoffValidOn}`
  );
}

cleanupVisitCodes()
  .catch((error) => {
    console.error("Cleanup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
