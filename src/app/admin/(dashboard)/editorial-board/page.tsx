import React from "react";
import connectToDatabase from "@/lib/mongodb";
import EditorialBoard from "@/models/EditorialBoard";
import { EditorialBoardManager } from "@/components/admin/EditorialBoardManager";

export const revalidate = 0;

export default async function AdminEditorialBoardPage() {
  await connectToDatabase();

  const members = await EditorialBoard.find()
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  return (
    <EditorialBoardManager
      initialMembers={JSON.parse(JSON.stringify(members))}
    />
  );
}
