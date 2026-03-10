import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Employee from "../models/employee.model.js";
import Office from "../models/office.model.js";
import Rating from "../models/rating.model.js";
import VisitCode from "../models/visitCode.model.js";

const getTodayInIndia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

const getCurrentIndiaTimeParts = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value || "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value || "0");
  return { hour, minute };
};

const randomPart = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const buildVisitCode = (office) => {
  const districtPrefix = String(office?.district || "OFF")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  return `${districtPrefix}${randomPart()}`;
};

export const listOffices = async (req, res) => {
  try {
    const { district, type, search } = req.query;
    const query = {};

    if (district?.trim()) {
      query.district = district.trim();
    }
    if (type?.trim()) {
      query.type = type.trim();
    }
    if (search?.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safeSearch, "i");
      query.$or = [{ name: regex }, { place: regex }, { district: regex }];
    }

    const offices = await Office.find(query).select("-visitCode").sort({ name: 1 }).lean();
    return res.status(200).json({ offices });
  } catch (error) {
    console.error("List offices error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listEmployeesByOffice = async (req, res) => {
  try {
    const { officeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(officeId)) {
      return res.status(400).json({ message: "Invalid office id" });
    }

    const office = await Office.findById(officeId).select("-visitCode").lean();
    if (!office) {
      return res.status(404).json({ message: "Office not found" });
    }

    const employees = await Employee.find({ officeId, isActive: true }).sort({ name: 1 }).lean();
    const employeeIds = employees.map((employee) => employee._id);

    const ratingStats = employeeIds.length
      ? await Rating.aggregate([
          { $match: { employeeId: { $in: employeeIds } } },
          {
            $group: {
              _id: "$employeeId",
              avgRating: { $avg: "$rating" },
              reviewsCount: { $sum: 1 },
            },
          },
        ])
      : [];

    const statsByEmployeeId = new Map(
      ratingStats.map((stat) => [String(stat._id), stat])
    );

    const formattedEmployees = employees.map((employee) => {
      const stat = statsByEmployeeId.get(String(employee._id));
      return {
        ...employee,
        rating: stat ? Number(stat.avgRating.toFixed(1)) : 0,
        reviewsCount: stat?.reviewsCount || 0,
      };
    });

    return res.status(200).json({
      office,
      employees: formattedEmployees,
    });
  } catch (error) {
    console.error("List office employees error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOfficeVisitCode = async (req, res) => {
  try {
    const { officeId } = req.params;
    const rawVisitCode = req.body?.visitCode;

    if (!mongoose.Types.ObjectId.isValid(officeId)) {
      return res.status(400).json({ message: "Invalid office id" });
    }

    const visitCode = String(rawVisitCode || "").trim();
    if (!visitCode) {
      return res.status(400).json({ message: "Visit code is required" });
    }

    const office = await Office.findById(officeId).select("name district place").lean();
    if (!office) {
      return res.status(404).json({ message: "Office not found" });
    }

    const normalizedVisitCode = visitCode.toUpperCase();
    const todayInIndia = getTodayInIndia();
    const { hour, minute } = getCurrentIndiaTimeParts();
    if (hour > 18 || (hour === 18 && minute > 0)) {
      return res.status(401).json({ message: "Code expired after office hours (6:00 PM)" });
    }

    const visitCodeDoc = await VisitCode.findOne({
      officeId,
      code: normalizedVisitCode,
      validOn: todayInIndia,
      isUsed: false,
    }).lean();

    if (!visitCodeDoc) {
      const matchingCodeForOffice = await VisitCode.findOne({
        officeId,
        code: normalizedVisitCode,
      })
        .select("isUsed validOn")
        .lean();

      if (!matchingCodeForOffice) {
        return res.status(401).json({ message: "Invalid visit code for this office" });
      }

      if (matchingCodeForOffice.isUsed) {
        return res.status(401).json({ message: "Visit code already used" });
      }

      return res.status(401).json({ message: "Visit code expired for today" });
    }

    const visitAccessToken = jwt.sign(
      {
        scope: "visit_code",
        officeId: String(officeId),
        visitCodeId: String(visitCodeDoc._id),
        code: visitCodeDoc.code,
        validOn: visitCodeDoc.validOn,
      },
      process.env.JWT_SECRET || "civicrate-dev-secret",
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Visit code verified",
      visitAccessToken,
    });
  } catch (error) {
    console.error("Verify office visit code error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const issueOfficeVisitCodes = async (req, res) => {
  try {
    const { officeId } = req.params;
    const adminOfficeId = req.admin?.officeId || "";
    if (String(adminOfficeId) !== String(officeId)) {
      return res
        .status(403)
        .json({ message: "You can only issue visit codes for your assigned office" });
    }

    const rawCount = Number(req.body?.count || 1);
    const count = Number.isFinite(rawCount)
      ? Math.min(Math.max(Math.floor(rawCount), 1), 50)
      : 1;

    if (!mongoose.Types.ObjectId.isValid(officeId)) {
      return res.status(400).json({ message: "Invalid office id" });
    }

    const office = await Office.findById(officeId).select("district").lean();
    if (!office) {
      return res.status(404).json({ message: "Office not found" });
    }

    const validOn = getTodayInIndia();
    const createdCodes = [];

    for (let i = 0; i < count; i += 1) {
      let attempts = 0;
      let created = null;

      while (!created && attempts < 12) {
        attempts += 1;
        const code = buildVisitCode(office);
        try {
          created = await VisitCode.create({
            officeId,
            code,
            validOn,
          });
        } catch (error) {
          if (error?.code !== 11000) {
            throw error;
          }
        }
      }

      if (!created) {
        return res.status(500).json({ message: "Could not generate enough unique visit codes" });
      }
      createdCodes.push(created.code);
    }

    return res.status(201).json({
      message: "Visit codes issued",
      officeId,
      validOn,
      codes: createdCodes,
    });
  } catch (error) {
    console.error("Issue office visit codes error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
