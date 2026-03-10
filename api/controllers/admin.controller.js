import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import VisitCode from "../models/visitCode.model.js";

const getTodayInIndia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: String(email).trim().toLowerCase() }).lean();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const validPassword = bcryptjs.compareSync(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        adminId: String(admin._id),
        officeId: String(admin.officeId),
        role: admin.role,
        name: admin.name,
        email: admin.email,
      },
      process.env.JWT_SECRET || "civicrate-dev-secret",
      { expiresIn: "12h" }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        officeId: admin.officeId,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listAdminVisitCodes = async (req, res) => {
  try {
    const officeId = req.admin?.officeId;
    if (!mongoose.Types.ObjectId.isValid(officeId || "")) {
      return res.status(400).json({ message: "Invalid admin office context" });
    }

    const validOn = getTodayInIndia();
    const codes = await VisitCode.find({ officeId, validOn })
      .sort({ createdAt: -1, code: 1 })
      .select("code validOn isUsed usedAt createdAt")
      .lean();

    return res.status(200).json({
      officeId,
      validOn,
      codes: codes.map((item) => ({
        _id: item._id,
        code: item.code,
        validOn: item.validOn,
        status: item.isUsed ? "used" : "unused",
        isUsed: item.isUsed,
        usedAt: item.usedAt,
        issuedAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error("List admin visit codes error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminVisitCodesReport = async (req, res) => {
  try {
    const officeId = req.admin?.officeId;
    if (!mongoose.Types.ObjectId.isValid(officeId || "")) {
      return res.status(400).json({ message: "Invalid admin office context" });
    }

    const validOn = getTodayInIndia();
    const [stats] = await VisitCode.aggregate([
      { $match: { officeId: new mongoose.Types.ObjectId(officeId), validOn } },
      {
        $group: {
          _id: null,
          totalIssued: { $sum: 1 },
          used: { $sum: { $cond: ["$isUsed", 1, 0] } },
        },
      },
    ]);

    const totalIssued = stats?.totalIssued || 0;
    const used = stats?.used || 0;
    const unused = totalIssued - used;

    return res.status(200).json({
      officeId,
      validOn,
      totalIssued,
      used,
      unused,
    });
  } catch (error) {
    console.error("Admin visit codes report error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
