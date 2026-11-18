import mongoose, { Schema, Model, models } from "mongoose";
import { IArticle } from "@/types";
import "./Volume";
import "./Issue";
import "./Manuscript";

const CoAuthorSchema = new Schema(
  {
    name: { type: String, required: true },
    affiliation: { type: String },
    email: { type: String },
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

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    authors: [CoAuthorSchema],
    abstract: { type: String, required: true },
    keywords: [{ type: String, trim: true }],
    category: { type: String, required: true },

    volume: { type: Schema.Types.ObjectId, ref: "Volume", required: true, index: true },
    issue: { type: Schema.Types.ObjectId, ref: "Issue", required: true, index: true },

    publicationDate: { type: Date, default: Date.now },
    pdfFile: { type: PdfFileSchema },
    doi: { type: String, trim: true },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },

    sourceManuscript: { type: Schema.Types.ObjectId, ref: "Manuscript" },
  },
  { timestamps: true }
);

const Article: Model<IArticle> =
  models.Article || mongoose.model<IArticle>("Article", ArticleSchema);
export default Article;
