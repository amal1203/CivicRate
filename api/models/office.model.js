import mongoose from "mongoose";

const officeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "", trim: true },
    district: { type: String, required: true, trim: true },
    place: { type: String, required: true, trim: true },
    open: { type: Boolean, default: true },
    visitCode: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const Office = mongoose.model("Office", officeSchema);

export default Office;
