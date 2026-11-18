import React from "react";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import Manuscript from "@/models/Manuscript";
import { ManuscriptDetailClient } from "@/components/admin/ManuscriptDetailClient";

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

  // Convert ObjectIds to strings
  const serializableManuscript = JSON.parse(JSON.stringify(manuscript));

  return <ManuscriptDetailClient manuscript={serializableManuscript} />;
}
