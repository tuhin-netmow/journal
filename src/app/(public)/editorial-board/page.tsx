import React from "react";
import connectToDatabase from "@/lib/mongodb";
import EditorialBoard from "@/models/EditorialBoard";
import { User, Award, Globe, Building2, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Editorial Board",
  description: "Meet the international editorial board and advisory council governing the peer review and publication standards of IJASR.",
};

export const revalidate = 0;

export default async function EditorialBoardPage() {
  await connectToDatabase();

  const members = await EditorialBoard.find()
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  // Group by primary roles for academic hierarchy
  const editorInChief = members.filter((m: any) =>
    m.role.toLowerCase().includes("editor-in-chief")
  );
  const managingEditors = members.filter((m: any) =>
    m.role.toLowerCase().includes("managing")
  );
  const associateEditors = members.filter((m: any) =>
    m.role.toLowerCase().includes("associate")
  );
  const boardMembers = members.filter(
    (m: any) =>
      !m.role.toLowerCase().includes("editor-in-chief") &&
      !m.role.toLowerCase().includes("managing") &&
      !m.role.toLowerCase().includes("associate")
  );

  const renderMemberCard = (member: any, isLeader = false) => (
    <div
      key={member._id.toString()}
      className={`bg-white rounded-xl border border-academic-border p-6 shadow-sm transition-all hover:shadow-md flex flex-col ${
        isLeader ? "ring-2 ring-royal/30" : ""
      }`}
    >
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-royal/10 text-royal flex items-center justify-center shrink-0 font-bold text-lg border border-royal/20">
          <User className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant={isLeader ? "royal" : "secondary"} className="mb-1 text-[11px]">
            {member.role}
          </Badge>
          <h3 className="font-serif font-bold text-lg text-navy leading-snug">
            {member.name}
          </h3>
          {member.academicTitle && (
            <p className="text-xs text-academic-muted font-medium mt-0.5">
              {member.academicTitle}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-xs text-academic-text/90 pt-3 border-t border-gray-100 mt-auto">
        <div className="flex items-start space-x-2">
          <Building2 className="w-3.5 h-3.5 text-royal shrink-0 mt-0.5" />
          <span className="font-medium">{member.institution}</span>
        </div>
        {member.country && (
          <div className="flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5 text-teal shrink-0" />
            <span className="text-academic-muted">{member.country}</span>
          </div>
        )}
        {member.specialization && (
          <div className="flex items-start space-x-2 pt-1">
            <Award className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-academic-muted italic">
              Specialization: {member.specialization}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="py-12 bg-academic-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Title */}
        <div className="border-b border-academic-border pb-8">
          <span className="text-xs uppercase font-bold text-royal tracking-wider">
            Academic Leadership
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-navy mt-1">
            Editorial Board
          </h1>
          <p className="text-academic-muted text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            Our distinguished international board of editors comprises world-class scholars dedicated to upholding publication integrity and scholarly excellence.
          </p>
        </div>

        {/* Section 1: Editor-in-Chief & Managing Editors */}
        {(editorInChief.length > 0 || managingEditors.length > 0) && (
          <section className="space-y-6">
            <h2 className="font-serif font-bold text-xl text-navy pb-2 border-b border-gray-200">
              Executive Leadership
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {editorInChief.map((m: any) => renderMemberCard(m, true))}
              {managingEditors.map((m: any) => renderMemberCard(m, true))}
            </div>
          </section>
        )}

        {/* Section 2: Associate Editors */}
        {associateEditors.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-serif font-bold text-xl text-navy pb-2 border-b border-gray-200">
              Associate Editors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {associateEditors.map((m: any) => renderMemberCard(m))}
            </div>
          </section>
        )}

        {/* Section 3: Editorial Board Members */}
        {boardMembers.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-serif font-bold text-xl text-navy pb-2 border-b border-gray-200">
              Editorial Board Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardMembers.map((m: any) => renderMemberCard(m))}
            </div>
          </section>
        )}

        {members.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-academic-border">
            <BookOpen className="w-12 h-12 text-academic-muted mx-auto mb-3" />
            <p className="text-sm text-academic-muted">
              Editorial board members are currently being updated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
