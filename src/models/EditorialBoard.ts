import mongoose, { Schema, Model, models } from "mongoose";
import { IEditorialBoard } from "@/types";

const EditorialBoardSchema = new Schema<IEditorialBoard>(
  {
    name: { type: String, required: true, trim: true },
    academicTitle: { type: String, trim: true },
    role: { type: String, required: true, trim: true }, // e.g. "Editor-in-Chief", "Managing Editor", "Associate Editor", "Editorial Board Member"
    institution: { type: String, required: true, trim: true },
    country: { type: String, trim: true },
    specialization: { type: String, trim: true },
    photo: { type: String },
    displayOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

const EditorialBoard: Model<IEditorialBoard> =
  models.EditorialBoard || mongoose.model<IEditorialBoard>("EditorialBoard", EditorialBoardSchema);
export default EditorialBoard;
