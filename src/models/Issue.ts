import mongoose, { Schema, Model, models } from "mongoose";
import { IIssue } from "@/types";
import "./Volume";

const IssueSchema = new Schema<IIssue>(
  {
    issueNumber: { type: Number, required: true },
    volume: { type: Schema.Types.ObjectId, ref: "Volume", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    publicationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
  },
  { timestamps: true }
);

// Compound unique index so issueNumber is unique within a volume
IssueSchema.index({ volume: 1, issueNumber: 1 }, { unique: true });

const Issue: Model<IIssue> = models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);
export default Issue;
