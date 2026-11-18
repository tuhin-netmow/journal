import mongoose, { Schema, Model, models } from "mongoose";
import { IPageContent } from "@/types";

const PageContentSchema = new Schema<IPageContent>(
  {
    pageKey: { type: String, required: true, unique: true, index: true },
    title: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const PageContent: Model<IPageContent> =
  models.PageContent || mongoose.model<IPageContent>("PageContent", PageContentSchema);
export default PageContent;
