import Rating from "../models/rating.model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import VisitCode from "../models/visitCode.model.js";

const getTodayInIndia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

export const createRating = async (req, res) => {
  try {
    const {
      officeId,
      officeName,
      employeeId,
      district,
      employeeName,
      serviceType,
      rating,
      comment,
      visitAccessToken,
    } = req.body;
    const authenticatedUser = req.user || null;

    if (
      !officeId ||
      !employeeId ||
      !employeeName ||
      !serviceType ||
      !visitAccessToken
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(officeId) ||
      !mongoose.Types.ObjectId.isValid(employeeId)
    ) {
      return res.status(400).json({ message: "Invalid office or employee id" });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!authenticatedUser?.id) {
      return res.status(401).json({ message: "User authentication required" });
    }

    let visitPayload;
    try {
      visitPayload = jwt.verify(
        visitAccessToken,
        process.env.JWT_SECRET || "civicrate-dev-secret"
      );
    } catch {
      return res.status(401).json({ message: "Invalid or expired visit access token" });
    }

    if (
      visitPayload?.scope !== "visit_code" ||
      String(visitPayload.officeId) !== String(officeId) ||
      !mongoose.Types.ObjectId.isValid(String(visitPayload.visitCodeId || ""))
    ) {
      return res.status(401).json({ message: "Visit access token does not match this office" });
    }

    const todayInIndia = getTodayInIndia();
    const consumedVisitCode = await VisitCode.findOneAndUpdate(
      {
        _id: visitPayload.visitCodeId,
        officeId,
        code: String(visitPayload.code || "").toUpperCase(),
        validOn: todayInIndia,
        isUsed: false,
      },
      { $set: { isUsed: true, usedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!consumedVisitCode) {
      return res.status(401).json({ message: "Visit code is invalid, expired, or already used" });
    }

    let created = null;

    try {
      created = await Rating.create({
        officeId,
        officeName: officeName || "",
        visitCodeId: consumedVisitCode._id,
        employeeId,
        district: district || "",
        employeeName,
        serviceType,
        rating: numericRating,
        comment: comment || "",
        userName: authenticatedUser.username || "Anonymous",
        userPhone: authenticatedUser.phonenumber || "",
      });
    } catch (error) {
      await VisitCode.updateOne(
        { _id: consumedVisitCode._id, isUsed: true, usedForRatingId: null },
        { $set: { isUsed: false, usedAt: null } }
      );
      throw error;
    }

    await VisitCode.updateOne(
      { _id: consumedVisitCode._id },
      { $set: { usedForRatingId: created._id } }
    );

    return res.status(201).json({
      message: "Rating saved",
      rating: created,
    });
  } catch (error) {
    console.error("Create rating error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
