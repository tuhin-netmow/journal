import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import Article from "@/models/Article";
import { IssueManager } from "@/components/admin/IssueManager";

export const revalidate = 0;

interface AdminIssuesPageProps {
  searchParams: Promise<{
    volume?: string;
  }>;
}

export default async function AdminIssuesPage({ searchParams }: AdminIssuesPageProps) {
  await connectToDatabase();
  const sp = await searchParams;

  const [volumes, issues] = await Promise.all([
    Volume.find().sort({ volumeNumber: -1 }).lean(),
    Issue.find()
      .populate("volume", "volumeNumber year")
      .sort({ publicationDate: -1, createdAt: -1 })
      .lean(),
  ]);

  const issuesWithCounts = await Promise.all(
    issues.map(async (iss) => {
      const count = await Article.countDocuments({ issue: iss._id });
      return {
        ...iss,
        articleCount: count,
      };
    })
  );

  return (
    <IssueManager
      initialIssues={JSON.parse(JSON.stringify(issuesWithCounts))}
      volumes={JSON.parse(JSON.stringify(volumes))}
      selectedVolumeId={sp.volume || "all"}
    />
  );
}
