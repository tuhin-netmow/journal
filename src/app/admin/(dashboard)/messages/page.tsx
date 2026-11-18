import React from "react";
import connectToDatabase from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { ContactMessagesManager } from "@/components/admin/ContactMessagesManager";

export const revalidate = 0;

export default async function AdminMessagesPage() {
  await connectToDatabase();
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();

  return (
    <ContactMessagesManager
      initialMessages={JSON.parse(JSON.stringify(messages))}
    />
  );
}
