import React from "react";
import connectToDatabase from "@/lib/mongodb";
import JournalSettings from "@/models/JournalSettings";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Server component layout for public pages
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings: any = null;
  try {
    await connectToDatabase();
    settings = await JournalSettings.findOne().lean();
  } catch (err) {
    console.error("Failed to load settings in public layout:", err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar journalName={settings?.journalName} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
