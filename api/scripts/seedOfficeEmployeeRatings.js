import dotenv from "dotenv";
import mongoose from "mongoose";
import Office from "../models/office.model.js";
import Employee from "../models/employee.model.js";
import Rating from "../models/rating.model.js";
import VisitCode from "../models/visitCode.model.js";

dotenv.config();

const officeSeed = [
  {
    name: "District Collectorate",
    type: "Collectorate",
    district: "Ernakulam",
    place: "Kakkanad",
    open: true,
    visitCode: "ERK2026",
    employees: [
      { name: "Anita Nair", designation: "Senior Clerk", department: "Revenue" },
      { name: "Rahul Menon", designation: "Office Superintendent", department: "Administration" },
      { name: "Divya Das", designation: "Public Relations Officer", department: "Public Grievance" },
    ],
  },
  {
    name: "Taluk Office Thrissur",
    type: "Taluk Office",
    district: "Thrissur",
    place: "Swaraj Round",
    open: true,
    visitCode: "TSR2026",
    employees: [
      { name: "Arun Kumar", designation: "Village Officer", department: "Land Records" },
      { name: "Sreelakshmi P", designation: "UD Clerk", department: "Certificates" },
      { name: "Nikhil Varma", designation: "Data Entry Operator", department: "Citizen Services" },
    ],
  },
  {
    name: "Kozhikode Revenue Office",
    type: "Revenue Office",
    district: "Kozhikode",
    place: "Palayam",
    open: true,
    visitCode: "KKD2026",
    employees: [
      { name: "Fathima Rahman", designation: "Deputy Tahsildar", department: "Revenue Recovery" },
      { name: "Manoj B", designation: "Clerk", department: "Land Tax" },
      { name: "Sneha K", designation: "Front Desk Executive", department: "Public Support" },
    ],
  },
];

const ratingTemplates = [
  { rating: 5, serviceType: "Certificate processing", comment: "Very helpful and professional service." },
  { rating: 4, serviceType: "Document verification", comment: "Good response and clear guidance." },
  { rating: 4, serviceType: "Public support", comment: "Supportive staff and timely updates." },
];

async function seed() {
  if (!process.env.MONGO) {
    throw new Error("MONGO is missing in .env");
  }

  await mongoose.connect(process.env.MONGO);
  console.log("Connected to MongoDB for seeding");

  let createdOffices = 0;
  let createdEmployees = 0;
  let createdRatings = 0;
  let createdVisitCodes = 0;

  const validOn = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const buildSeedVisitCode = (office, idx) => {
    const prefix = String(office?.district || "OFF")
      .replace(/[^A-Za-z]/g, "")
      .slice(0, 3)
      .toUpperCase()
      .padEnd(3, "X");
    return `${prefix}${validOn.replaceAll("-", "").slice(2)}${String(idx + 1).padStart(3, "0")}`;
  };

  for (const officeData of officeSeed) {
    const { employees, ...officeOnly } = officeData;

    let office = await Office.findOne({
      name: officeOnly.name,
      district: officeOnly.district,
      place: officeOnly.place,
    });

    if (!office) {
      office = await Office.create(officeOnly);
      createdOffices += 1;
    } else if (officeOnly.visitCode && office.visitCode !== officeOnly.visitCode) {
      office.visitCode = officeOnly.visitCode;
      await office.save();
    }

    for (const employeeData of employees) {
      let employee = await Employee.findOne({
        officeId: office._id,
        name: employeeData.name,
      });

      if (!employee) {
        employee = await Employee.create({
          ...employeeData,
          officeId: office._id,
        });
        createdEmployees += 1;
      }

      const existingRatings = await Rating.countDocuments({
        officeId: office._id,
        employeeId: employee._id,
      });

      if (existingRatings === 0) {
        const docs = ratingTemplates.map((template, idx) => ({
          officeId: office._id,
          officeName: office.name,
          district: office.district,
          employeeId: employee._id,
          employeeName: employee.name,
          serviceType: template.serviceType,
          rating: template.rating - (idx === 2 ? 1 : 0),
          comment: template.comment,
          userName: ["User A", "User B", "User C"][idx],
          userPhone: "",
        }));
        await Rating.insertMany(docs);
        createdRatings += docs.length;
      }
    }

    for (let i = 0; i < 10; i += 1) {
      const code = buildSeedVisitCode(office, i);
      const existingCode = await VisitCode.findOne({ code }).lean();
      if (!existingCode) {
        await VisitCode.create({
          officeId: office._id,
          code,
          validOn,
        });
        createdVisitCodes += 1;
      }
    }
  }

  console.log(
    `Seed complete. Offices created: ${createdOffices}, employees created: ${createdEmployees}, ratings created: ${createdRatings}, visit codes created: ${createdVisitCodes}`
  );
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
