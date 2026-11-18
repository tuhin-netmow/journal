import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import connectToDatabase from "@/lib/mongodb";
import JournalSettings from "@/models/JournalSettings";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  let settings: any = null;
  try {
    await connectToDatabase();
    settings = await JournalSettings.findOne().lean();
  } catch (err) {
    console.error("Failed to fetch settings in admin layout:", err);
  }

  return (
    <AdminLayoutClient
      user={session.user}
      settings={settings ? JSON.parse(JSON.stringify(settings)) : undefined}
    >
      {children}
    </AdminLayoutClient>
  );
}
