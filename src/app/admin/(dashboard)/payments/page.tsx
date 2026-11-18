import React from "react";
import connectToDatabase from "@/lib/mongodb";
import JournalSettings from "@/models/JournalSettings";
import Manuscript from "@/models/Manuscript";
import { PaymentManager } from "@/components/admin/PaymentManager";

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  await connectToDatabase();

  const [settings, manuscripts] = await Promise.all([
    JournalSettings.findOne().lean(),
    Manuscript.find().sort({ createdAt: -1 }).limit(25).lean(),
  ]);

  return (
    <PaymentManager
      initialSettings={JSON.parse(JSON.stringify(settings || {}))}
      manuscripts={JSON.parse(JSON.stringify(manuscripts))}
    />
  );
}
