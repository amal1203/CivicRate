import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    officeName: { type: String, default: "", trim: true },
    visitCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisitCode",
      default: null,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    district: { type: String, default: "", trim: true },
    employeeName: { type: String, required: true, trim: true },
    serviceType: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true },
    userName: { type: String, default: "Anonymous", trim: true },
    userPhone: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
