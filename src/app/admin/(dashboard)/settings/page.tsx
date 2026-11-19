import React from "react";
import connectToDatabase from "@/lib/mongodb";
import JournalSettings from "@/models/JournalSettings";
import { JournalSettingsForm } from "@/components/admin/JournalSettingsForm";
import { DEFAULT_CATEGORIES, DEFAULT_MANUSCRIPT_TYPES } from "@/lib/constants";

export const revalidate = 0;

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await connectToDatabase();
  const sp = await searchParams;
  const initialTab =
    sp.tab && ["general", "taxonomy", "mailgun", "branding", "contact"].includes(sp.tab)
      ? sp.tab
      : "general";

  let settings = await JournalSettings.findOne().lean();

  if (!settings) {
    const created = await JournalSettings.create({});
    settings = created.toObject();
  }

  if (!settings.categories || settings.categories.length === 0) {
    settings.categories = DEFAULT_CATEGORIES;
  }
  if (!settings.manuscriptTypes || settings.manuscriptTypes.length === 0) {
    settings.manuscriptTypes = DEFAULT_MANUSCRIPT_TYPES;
  }

  return (
    <JournalSettingsForm
      initialSettings={JSON.parse(JSON.stringify(settings))}
      initialTab={initialTab}
    />
  );
}
