import mongoose from "mongoose";

const visitCodeSchema = new mongoose.Schema(
  {
    officeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    validOn: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    usedForRatingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rating",
      default: null,
    },
  },
  { timestamps: true }
);

visitCodeSchema.index({ officeId: 1, validOn: 1, isUsed: 1 });

const VisitCode = mongoose.model("VisitCode", visitCodeSchema);

export default VisitCode;
