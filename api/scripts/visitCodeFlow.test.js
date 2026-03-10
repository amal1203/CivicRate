import test from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import app from "../app.js";
import Office from "../models/office.model.js";
import Employee from "../models/employee.model.js";
import Admin from "../models/admin.model.js";
import VisitCode from "../models/visitCode.model.js";
import Rating from "../models/rating.model.js";
import User from "../models/user.model.js";

dotenv.config();

const isAfterOfficeHoursIndia = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value || "0");
  return hour > 18 || (hour === 18 && minute > 0);
};

test("visit code full workflow: issue -> verify -> submit -> reject reuse", async (t) => {
  if (!process.env.MONGO) {
    t.skip("MONGO is missing in environment");
    return;
  }
  if (isAfterOfficeHoursIndia()) {
    t.skip("Skipped after office hours because verification intentionally expires at 6:00 PM IST");
    return;
  }

  await mongoose.connect(process.env.MONGO);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const rand = Math.random().toString(36).slice(2, 8);
  const office = await Office.create({
    name: `Test Office ${rand}`,
    type: "Test",
    district: "Kozhikode",
    place: `Place-${rand}`,
    open: true,
  });
  const employee = await Employee.create({
    officeId: office._id,
    name: `Employee ${rand}`,
    designation: "Clerk",
    department: "Records",
    isActive: true,
  });
  const adminPassword = "Admin@12345";
  const admin = await Admin.create({
    name: `Admin ${rand}`,
    email: `admin-${rand}@civicrate.gov`,
    password: bcryptjs.hashSync(adminPassword, 10),
    officeId: office._id,
    role: "office_admin",
  });

  let issuedCodeId = null;
  let ratingId = null;
  const userPhone = `9${Math.floor(Math.random() * 1e9)
    .toString()
    .padStart(9, "0")}`;
  const userPassword = "User@12345";

  try {
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: admin.email, password: adminPassword }),
    });
    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.token);

    const issueRes = await fetch(`${baseUrl}/api/offices/${office._id}/issue-visit-codes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({ count: 1 }),
    });
    assert.equal(issueRes.status, 201);
    const issueData = await issueRes.json();
    assert.equal(issueData.codes.length, 1);

    const code = issueData.codes[0];
    const codeDoc = await VisitCode.findOne({ officeId: office._id, code }).lean();
    assert.ok(codeDoc?._id);
    issuedCodeId = String(codeDoc._id);

    const verifyRes = await fetch(`${baseUrl}/api/offices/${office._id}/verify-visit-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitCode: code }),
    });
    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.ok(verifyData.visitAccessToken);

    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `user-${rand}`,
        phonenumber: userPhone,
        password: userPassword,
      }),
    });
    assert.equal(signupRes.status, 201);

    const userLoginRes = await fetch(`${baseUrl}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phonenumber: userPhone, password: userPassword }),
    });
    assert.equal(userLoginRes.status, 200);
    const userLoginData = await userLoginRes.json();
    assert.ok(userLoginData.token);

    const ratingPayload = {
      officeId: String(office._id),
      officeName: office.name,
      employeeId: String(employee._id),
      district: office.district,
      employeeName: employee.name,
      serviceType: "Document verification",
      rating: 5,
      comment: "Great support",
      visitAccessToken: verifyData.visitAccessToken,
    };

    const submitRes = await fetch(`${baseUrl}/api/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userLoginData.token}`,
      },
      body: JSON.stringify(ratingPayload),
    });
    assert.equal(submitRes.status, 201);
    const submitData = await submitRes.json();
    ratingId = String(submitData?.rating?._id || "");
    assert.ok(ratingId);

    const reuseRes = await fetch(`${baseUrl}/api/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userLoginData.token}`,
      },
      body: JSON.stringify({
        ...ratingPayload,
        comment: "Second attempt",
      }),
    });
    assert.equal(reuseRes.status, 401);
    const reuseData = await reuseRes.json();
    assert.match(String(reuseData.message || ""), /already used|invalid|expired/i);
  } finally {
    if (ratingId) {
      await Rating.deleteOne({ _id: ratingId });
    }
    if (issuedCodeId) {
      await VisitCode.deleteOne({ _id: issuedCodeId });
    }
    await Admin.deleteOne({ _id: admin._id });
    await User.deleteOne({ phonenumber: userPhone });
    await Employee.deleteOne({ _id: employee._id });
    await Office.deleteOne({ _id: office._id });

    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  }
});
