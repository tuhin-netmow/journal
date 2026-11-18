import React from "react";
import connectToDatabase from "@/lib/mongodb";
import PageContent from "@/models/PageContent";
import JournalSettings from "@/models/JournalSettings";
import { BookOpen, ShieldCheck, FileText, CheckCircle2, Award, Scale, HelpCircle } from "lucide-react";

export const metadata = {
  title: "About Journal",
  description: "Learn about the mission, aims, scope, publication ethics, and open access policy of the journal.",
};

export const revalidate = 0;

export default async function AboutPage() {
  await connectToDatabase();

  const settings: any = (await JournalSettings.findOne().lean()) || {};
  const contents = await PageContent.find().lean();

  const contentMap: Record<string, any> = {};
  contents.forEach((c: any) => {
    contentMap[c.pageKey] = c;
  });

  return (
    <div className="py-12 bg-academic-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-academic-border pb-8">
          <span className="text-xs uppercase font-bold text-royal tracking-wider">
            Journal Profile & Governance
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-navy mt-1">
            About the Journal
          </h1>
          <p className="text-academic-muted text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            Discover our institutional background, editorial commitments, peer-review methodology, and scholarly standards.
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-royal">
            <BookOpen className="w-6 h-6" />
            <h2 className="font-serif font-bold text-2xl text-navy">
              {contentMap["about_overview"]?.title || "Journal Overview"}
            </h2>
          </div>
          <p className="text-academic-text/90 leading-relaxed text-sm whitespace-pre-line">
            {contentMap["about_overview"]?.content ||
              settings.description ||
              "The International Journal of Advanced Scientific Research is a multidisciplinary, peer-reviewed, open-access scholarly publication founded to advance human knowledge."}
          </p>
        </section>

        {/* Section 2: Aims and Scope */}
        <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-teal">
            <Award className="w-6 h-6" />
            <h2 className="font-serif font-bold text-2xl text-navy">
              {contentMap["aims_scope"]?.title || "Aims & Scope"}
            </h2>
          </div>
          <div className="text-academic-text/90 leading-relaxed text-sm whitespace-pre-line">
            {contentMap["aims_scope"]?.content ||
              "IJASR welcomes original research papers, reviews, and short communications across fundamental and applied science disciplines."}
          </div>
        </section>

        {/* Section 3: Mission and Objectives */}
        <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-royal">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="font-serif font-bold text-2xl text-navy">
              {contentMap["mission_objectives"]?.title || "Mission & Objectives"}
            </h2>
          </div>
          <p className="text-academic-text/90 leading-relaxed text-sm whitespace-pre-line">
            {contentMap["mission_objectives"]?.content ||
              "Our mission is to eliminate barriers to scientific literature through universal open access, empowering researchers worldwide."}
          </p>
        </section>

        {/* Section 4: Key Policies (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Peer Review Policy */}
          <div className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-3">
            <div className="flex items-center space-x-2.5 text-royal">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-serif font-bold text-xl text-navy">
                {contentMap["peer_review_policy"]?.title || "Peer Review Policy"}
              </h3>
            </div>
            <p className="text-xs text-academic-text/80 leading-relaxed whitespace-pre-line">
              {contentMap["peer_review_policy"]?.content ||
                "Every manuscript undergoes preliminary screening by our editorial board followed by rigorous double-blind evaluation by two independent peer reviewers."}
            </p>
          </div>

          {/* Open Access Policy */}
          <div className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-3">
            <div className="flex items-center space-x-2.5 text-teal">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-serif font-bold text-xl text-navy">
                {contentMap["open_access_policy"]?.title || "Open Access Policy"}
              </h3>
            </div>
            <p className="text-xs text-academic-text/80 leading-relaxed whitespace-pre-line">
              {contentMap["open_access_policy"]?.content ||
                "This journal offers unrestricted open access under the Creative Commons Attribution 4.0 International License (CC BY 4.0)."}
            </p>
          </div>

          {/* Publication Ethics */}
          <div className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-3">
            <div className="flex items-center space-x-2.5 text-amber-600">
              <Scale className="w-5 h-5" />
              <h3 className="font-serif font-bold text-xl text-navy">
                {contentMap["publication_ethics"]?.title || "Publication Ethics"}
              </h3>
            </div>
            <p className="text-xs text-academic-text/80 leading-relaxed whitespace-pre-line">
              {contentMap["publication_ethics"]?.content ||
                "We uphold Committee on Publication Ethics (COPE) core practices. Plagiarism, data falsification, and redundant publication are strictly prohibited."}
            </p>
          </div>

          {/* Copyright & Licensing */}
          <div className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-3">
            <div className="flex items-center space-x-2.5 text-indigo-600">
              <FileText className="w-5 h-5" />
              <h3 className="font-serif font-bold text-xl text-navy">
                {contentMap["copyright_licensing"]?.title || "Copyright & Licensing"}
              </h3>
            </div>
            <p className="text-xs text-academic-text/80 leading-relaxed whitespace-pre-line">
              {contentMap["copyright_licensing"]?.content ||
                "Authors retain full copyright of their published work without restrictions while granting first publication rights to IJASR."}
            </p>
          </div>
        </div>

        {/* Section 5: Publisher & Metadata Specification */}
        <section className="bg-navy text-white rounded-xl p-8 space-y-4">
          <h3 className="font-serif font-bold text-xl text-white">
            Journal Governance & Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs text-gray-300 pt-2 border-t border-navy-light">
            <div>
              <div className="text-gray-400 uppercase font-semibold">Publisher</div>
              <div className="text-sm font-bold text-white mt-1">{settings.publisherName || "Apex Scholarly Publishing"}</div>
            </div>
            <div>
              <div className="text-gray-400 uppercase font-semibold">ISSN</div>
              <div className="text-sm font-bold text-white mt-1">{settings.issn || "2834-912X"}</div>
            </div>
            <div>
              <div className="text-gray-400 uppercase font-semibold">Publication Cadence</div>
              <div className="text-sm font-bold text-white mt-1">{settings.publicationFrequency || "Quarterly"}</div>
            </div>
            <div>
              <div className="text-gray-400 uppercase font-semibold">Editorial Address</div>
              <div className="text-sm font-bold text-white mt-1 truncate">{settings.address || "Cambridge, MA, USA"}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
