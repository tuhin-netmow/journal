import React from "react";
import connectToDatabase from "@/lib/mongodb";
import JournalSettings from "@/models/JournalSettings";
import { JournalSettingsForm } from "@/components/admin/JournalSettingsForm";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  await connectToDatabase();
  let settings = await JournalSettings.findOne().lean();

  if (!settings) {
    settings = await JournalSettings.create({});
  }

  return (
    <JournalSettingsForm
      initialSettings={JSON.parse(JSON.stringify(settings))}
    />
  );
}
