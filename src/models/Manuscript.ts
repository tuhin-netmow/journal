import mongoose, { Schema, Model, models } from "mongoose";
import { IManuscript } from "@/types";

const CoAuthorSchema = new Schema(
  {
    name: { type: String, required: true },
    affiliation: { type: String },
  },
  { _id: false }
);

const PdfFileSchema = new Schema(
  {
    storageKey: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true, default: "application/pdf" },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const ManuscriptSchema = new Schema<IManuscript>(
  {
    submissionId: { type: String, required: true, unique: true, index: true },
    authorName: { type: String, required: true, trim: true },
    authorEmail: { type: String, required: true, lowercase: true, trim: true },
    authorPhone: { type: String, trim: true },
    institution: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    country: { type: String, required: true, trim: true },

    title: { type: String, required: true, trim: true },
    manuscriptType: { type: String, required: true, default: "Research Article" },
    category: { type: String, required: true, default: "General Science" },
    abstract: { type: String, required: true },
    keywords: [{ type: String, trim: true }],
    coAuthors: [CoAuthorSchema],

    pdfFile: { type: PdfFileSchema, required: true },

    status: {
      type: String,
      enum: ["submitted", "under_review", "revision_requested", "accepted", "rejected", "published"],
      default: "submitted",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid", "waived"],
      default: "pending",
      index: true,
    },

    adminNotes: { type: String },
  },
  { timestamps: true }
);

const Manuscript: Model<IManuscript> =
  models.Manuscript || mongoose.model<IManuscript>("Manuscript", ManuscriptSchema);
export default Manuscript;
