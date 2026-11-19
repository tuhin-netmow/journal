import React from "react";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import JournalSettings from "@/models/JournalSettings";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export const revalidate = 0;

interface EditArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminEditArticlePage({ params }: EditArticlePageProps) {
  await connectToDatabase();
  const { id } = await params;

  const [article, volumes, issues, settings] = await Promise.all([
    Article.findById(id).lean(),
    Volume.find().sort({ volumeNumber: -1 }).lean(),
    Issue.find().populate("volume", "volumeNumber").sort({ issueNumber: 1 }).lean(),
    JournalSettings.findOne().lean(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <ArticleForm
      initialData={JSON.parse(JSON.stringify(article))}
      volumes={JSON.parse(JSON.stringify(volumes))}
      issues={JSON.parse(JSON.stringify(issues))}
      isEdit={true}
      categories={settings?.categories || DEFAULT_CATEGORIES}
    />
  );
}
