import React from "react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import PageContent from "@/models/PageContent";
import {
  FileText,
  Send,
  Eye,
  CheckCircle,
  CreditCard,
  BookOpen,
  ArrowRight,
  ListOrdered,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Author Guidelines",
  description: "Comprehensive submission guidelines, manuscript preparation instructions, reference formats, and peer review workflow.",
};

export const revalidate = 0;

export default async function AuthorGuidelinesPage() {
  await connectToDatabase();
  const guidelinesContent = await PageContent.findOne({ pageKey: "author_guidelines" }).lean();

  const workflowSteps = [
    {
      step: 1,
      title: "Online Submission",
      desc: "Author completes the online form and uploads a formatted manuscript PDF without needing an account.",
      icon: Send,
    },
    {
      step: 2,
      title: "Editorial Screening",
      desc: "Editor-in-Chief reviews the paper for journal scope, basic formatting, and ethics compliance (3-5 days).",
      icon: Eye,
    },
    {
      step: 3,
      title: "Peer Review & Decision",
      desc: "Double-blind evaluation by at least 2 subject specialists resulting in acceptance, revision, or rejection.",
      icon: CheckCircle,
    },
    {
      step: 4,
      title: "Payment (If Applicable)",
      desc: "Upon acceptance, author completes the configured Article Processing Charge via external link.",
      icon: CreditCard,
    },
    {
      step: 5,
      title: "Typesetting & Publication",
      desc: "Final proofreading, volume/issue assignment, and permanent open-access release on the website.",
      icon: BookOpen,
    },
  ];

  return (
    <div className="py-12 bg-academic-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="border-b border-academic-border pb-8">
          <span className="text-xs uppercase font-bold text-royal tracking-wider">
            Instructions for Authors
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-navy mt-1">
            Author Guidelines
          </h1>
          <p className="text-academic-muted text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            Please read these guidelines thoroughly before submitting your manuscript to ensure seamless editorial handling and peer evaluation.
          </p>
        </div>

        {/* WORKFLOW DIAGRAM */}
        <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase font-bold text-teal tracking-wider">
              Publication Workflow
            </span>
            <h2 className="font-serif font-bold text-2xl text-navy mt-1">
              From Manuscript Submission to Publication
            </h2>
            <p className="text-xs text-academic-muted mt-1">
              A transparent, rigorous, and efficient peer-review path.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 relative">
            {workflowSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-academic-bg rounded-lg border border-gray-200 p-4 text-center space-y-2 relative"
                >
                  <div className="w-10 h-10 rounded-full bg-royal/10 text-royal flex items-center justify-center mx-auto font-bold text-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] font-semibold text-royal uppercase tracking-wider">
                    Step {item.step}
                  </div>
                  <h4 className="font-serif font-bold text-sm text-navy">{item.title}</h4>
                  <p className="text-[11px] text-academic-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* DETAILED SECTIONS */}
        <div className="space-y-8">
          {/* 1. Manuscript Preparation & Formatting */}
          <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-xl text-navy flex items-center space-x-2">
              <FileText className="w-5 h-5 text-royal" />
              <span>1. Manuscript Preparation & Article Formatting</span>
            </h3>
            <div className="text-sm text-academic-text/90 space-y-2 leading-relaxed">
              <p>
                Manuscripts must be submitted in the English language with clear academic prose. All pages should be sequentially numbered. Authors are advised to organize their work into the following standardized sections:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li><strong>Title:</strong> Concise, informative, and indicative of the paper's contents.</li>
                <li><strong>Authors & Affiliations:</strong> Full names, institutional affiliations, and corresponding email.</li>
                <li><strong>Abstract:</strong> Structured or unstructured summary between 150 and 300 words.</li>
                <li><strong>Keywords:</strong> 4 to 6 relevant index terms separated by commas.</li>
                <li><strong>Introduction:</strong> Background, literature rationale, and specific research questions.</li>
                <li><strong>Materials & Methods:</strong> Comprehensive technical description enabling full experimental reproducibility.</li>
                <li><strong>Results & Discussion:</strong> Empirical findings presented through clear tables, diagrams, and statistical evaluations.</li>
                <li><strong>Conclusion:</strong> Summary of principal insights and potential future avenues of research.</li>
                <li><strong>References:</strong> Rigorous citations in standard academic formats.</li>
              </ul>
            </div>
          </section>

          {/* 2. Abstract Guidelines */}
          <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-xl text-navy">
              2. Abstract Guidelines
            </h3>
            <p className="text-sm text-academic-text/90 leading-relaxed">
              The abstract should provide an objective preview of the research. It must state briefly the purpose of the research, the principal methodologies employed, the main results, and major conclusions. It should avoid undefined abbreviations, specialized jargon, or mathematical equations whenever possible.
            </p>
          </section>

          {/* 3. References and Citations */}
          <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-xl text-navy">
              3. References & Citation Standards
            </h3>
            <div className="text-sm text-academic-text/90 space-y-2 leading-relaxed">
              <p>
                Authors may utilize either APA (7th Edition) or IEEE reference formats. Please ensure consistency throughout the entire document:
              </p>
              <div className="bg-academic-bg p-4 rounded-lg font-mono text-xs text-academic-text space-y-2 border border-gray-200">
                <p><strong>APA Example:</strong> Tanaka, H., & Wei, C. (2026). Thermodynamic stability of perovskite heterostructures. <em>IJASR</em>, 4(1), 45-58.</p>
                <p><strong>IEEE Example:</strong> [1] H. Tanaka and C. Wei, &quot;Thermodynamic stability of perovskite heterostructures,&quot; <em>IJASR</em>, vol. 4, no. 1, pp. 45-58, 2026.</p>
              </div>
            </div>
          </section>

          {/* 4. Publication Ethics & Submission Instructions */}
          <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-xl text-navy">
              4. Publication Ethics & Submission Checklist
            </h3>
            <div className="text-sm text-academic-text/90 space-y-2 leading-relaxed">
              <p>
                Before uploading your manuscript, verify that:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-xs">
                <li>The work is entirely original and not under evaluation by any other publication.</li>
                <li>All co-authors have reviewed and approved the submitted version.</li>
                <li>The file format is PDF and does not exceed 10 MB in file size.</li>
                <li>All figures, charts, and tables are clearly legible and embedded within the text.</li>
              </ul>
            </div>
          </section>

          {/* Dynamic Content if edited from Admin */}
          {guidelinesContent && (
            <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-xl text-navy">
                {guidelinesContent.title || "Additional Editorial Notes"}
              </h3>
              <div className="text-xs text-academic-text/90 whitespace-pre-line leading-relaxed">
                {guidelinesContent.content}
              </div>
            </section>
          )}
        </div>

        {/* Call to action */}
        <div className="text-center pt-4">
          <Button
            href="/submit-manuscript"
            size="lg"
            variant="teal"
            className="space-x-2 font-semibold shadow-md"
          >
            <Send className="w-5 h-5" />
            <span>Ready? Submit Your Manuscript Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
