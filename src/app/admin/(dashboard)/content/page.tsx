import React from "react";
import connectToDatabase from "@/lib/mongodb";
import PageContent from "@/models/PageContent";
import { ContentManager } from "@/components/admin/ContentManager";

export const revalidate = 0;

export default async function AdminContentPage() {
  await connectToDatabase();
  const contents = await PageContent.find().lean();

  return <ContentManager initialContents={JSON.parse(JSON.stringify(contents))} />;
}
