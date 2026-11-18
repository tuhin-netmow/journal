import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import Article from "@/models/Article";
import { VolumeManager } from "@/components/admin/VolumeManager";

export const revalidate = 0;

export default async function AdminVolumesPage() {
  await connectToDatabase();

  const volumes = await Volume.find().sort({ volumeNumber: -1 }).lean();

  const volumesWithCounts = await Promise.all(
    volumes.map(async (vol) => {
      const issues = await Issue.find({ volume: vol._id }).lean();
      const articleCount = await Article.countDocuments({ volume: vol._id, status: "published" });
      return {
        ...vol,
        issues,
        publishedArticleCount: articleCount,
      };
    })
  );

  return (
    <VolumeManager
      initialVolumes={JSON.parse(JSON.stringify(volumesWithCounts))}
    />
  );
}
