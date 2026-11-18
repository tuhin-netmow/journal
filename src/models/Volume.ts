import mongoose, { Schema, Model, models } from "mongoose";
import { IVolume } from "@/types";

const VolumeSchema = new Schema<IVolume>(
  {
    volumeNumber: { type: Number, required: true, unique: true, index: true },
    year: { type: Number, required: true, index: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Volume: Model<IVolume> =
  models.Volume || mongoose.model<IVolume>("Volume", VolumeSchema);
export default Volume;
