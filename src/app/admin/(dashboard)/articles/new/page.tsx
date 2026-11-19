import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import Manuscript from "@/models/Manuscript";
import JournalSettings from "@/models/JournalSettings";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { slugify } from "@/lib/utils";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export const revalidate = 0;

interface NewArticlePageProps {
  searchParams: Promise<{
    sourceManuscriptId?: string;
  }>;
}

export default async function AdminNewArticlePage({
  searchParams,
}: NewArticlePageProps) {
  await connectToDatabase();
  const sp = await searchParams;

  const [volumes, issues, settings] = await Promise.all([
    Volume.find().sort({ volumeNumber: -1 }).lean(),
    Issue.find().populate("volume", "volumeNumber").sort({ issueNumber: 1 }).lean(),
    JournalSettings.findOne().lean(),
  ]);

  let initialData: any = {};

  if (sp.sourceManuscriptId) {
    const manuscript = await Manuscript.findById(sp.sourceManuscriptId).lean();
    if (manuscript) {
      initialData = {
        title: manuscript.title,
        slug: slugify(manuscript.title),
        authors: [
          { name: manuscript.authorName, affiliation: manuscript.institution, email: manuscript.authorEmail },
          ...(manuscript.coAuthors || []),
        ],
        abstract: manuscript.abstract,
        keywords: manuscript.keywords,
        category: manuscript.category,
        sourceManuscript: manuscript._id.toString(),
        pdfFile: manuscript.pdfFile,
        status: "published",
      };
    }
  }

  return (
    <ArticleForm
      initialData={JSON.parse(JSON.stringify(initialData))}
      volumes={JSON.parse(JSON.stringify(volumes))}
      issues={JSON.parse(JSON.stringify(issues))}
      isEdit={false}
      categories={settings?.categories || DEFAULT_CATEGORIES}
    />
  );
}
