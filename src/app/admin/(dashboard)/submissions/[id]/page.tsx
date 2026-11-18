import React from "react";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Manuscript from "@/models/Manuscript";
import Article from "@/models/Article";
import { ManuscriptDetailClient } from "@/components/admin/ManuscriptDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SubmissionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminSubmissionDetailPage({
  params,
}: SubmissionDetailPageProps) {
  await connectToDatabase();
  const { id } = await params;

  const manuscript = await Manuscript.findById(id).lean();
  if (!manuscript) {
    notFound();
  }

  const linkedArticle = await Article.findOne({
    $or: [
      { sourceManuscript: id },
      { title: { $regex: new RegExp(`^${manuscript.title.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }
    ]
  }).lean();

  // Convert ObjectIds to strings
  const serializableManuscript = JSON.parse(JSON.stringify(manuscript));
  const serializableArticle = linkedArticle ? JSON.parse(JSON.stringify(linkedArticle)) : null;

  return (
    <ManuscriptDetailClient
      manuscript={serializableManuscript}
      initialLinkedArticle={serializableArticle}
    />
  );
}
