import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Send,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Sparkles,
  Search,
  CheckCircle,
  FileCheck,
  Scale,
  Award,
  Layers,
} from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import JournalSettings from "@/models/JournalSettings";
import PageContent from "@/models/PageContent";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/journal/ArticleCard";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  await connectToDatabase();

  const settings: any = (await JournalSettings.findOne().lean()) || {};
  const heroContent: any = (await PageContent.findOne({ pageKey: "homepage_hero" }).lean()) || {};

  // Fetch current / latest issue
  const publishedIssueIds = await Article.distinct("issue", { status: "published" });

  const publishedIssues = await Issue.find({
    $or: [
      { status: "published" },
      { _id: { $in: publishedIssueIds } },
    ],
  })
    .populate("volume", "volumeNumber year description")
    .lean();

  publishedIssues.sort((a: any, b: any) => {
    const volA = a.volume?.volumeNumber ?? 0;
    const volB = b.volume?.volumeNumber ?? 0;
    if (volA !== volB) return volB - volA;

    const issA = a.issueNumber ?? 0;
    const issB = b.issueNumber ?? 0;
    if (issA !== issB) return issB - issA;

    const dateA = new Date(a.publicationDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.publicationDate || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const currentIssue = publishedIssues[0] || null;

  // Fetch recent published articles (up to 6)
  const recentArticles = await Article.find({ status: "published" })
    .populate("volume", "volumeNumber year")
    .populate("issue", "issueNumber title publicationDate")
    .sort({ publicationDate: -1, createdAt: -1 })
    .limit(6)
    .lean();

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-navy via-navy to-navy-dark text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1769AA_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal/20 border border-teal/40 text-teal-light text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Peer-Reviewed • Immediate Open Access</span>
          </div>

          <h1
            className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm text-white"
            style={{ color: "#ffffff" }}
          >
            {heroContent.title || "Advancing Research. Sharing Knowledge. Inspiring Innovation."}
          </h1>

          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {heroContent.content ||
              "A professional academic publishing platform dedicated to advancing scholarly research, upholding rigorous peer review standards, and promoting global knowledge sharing."}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              href="/submit-manuscript"
              size="lg"
              variant="teal"
              className="w-full sm:w-auto space-x-2 text-base font-semibold shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span>Submit Your Manuscript</span>
            </Button>

            <Button
              href="/archives"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto space-x-2 text-base bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur"
            >
              <Search className="w-5 h-5" />
              <span>Explore Published Articles</span>
            </Button>
          </div>

          {/* Quick Journal Information Grid */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-navy-light text-left">
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-[11px] text-gray-400 uppercase font-semibold">Journal ISSN</div>
              <div className="text-sm font-bold text-white mt-0.5">{settings.issn || "2834-912X"}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-[11px] text-gray-400 uppercase font-semibold">Publisher</div>
              <div className="text-sm font-bold text-white mt-0.5 truncate">{settings.publisherName || "Apex Scholarly"}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-[11px] text-gray-400 uppercase font-semibold">Frequency</div>
              <div className="text-sm font-bold text-white mt-0.5">{settings.publicationFrequency || "Quarterly"}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="text-[11px] text-gray-400 uppercase font-semibold">Licensing</div>
              <div className="text-sm font-bold text-white mt-0.5">CC BY 4.0 Open</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. JOURNAL INTRODUCTION & HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-academic-border p-8 md:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xs uppercase font-bold text-royal tracking-wider">
              About The Journal
            </span>
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-navy">
              High-Impact Scholarly Publishing Committed to Integrity
            </h2>
            <p className="text-academic-text/80 text-sm md:text-base leading-relaxed">
              {settings.description ||
                "A peer-reviewed, open-access international journal dedicated to publishing cutting-edge scholarly research across science, engineering, computing, and interdisciplinary fields."}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-academic-text">
              <span className="flex items-center space-x-1.5 bg-academic-bg px-3 py-1.5 rounded-full border border-gray-200">
                <CheckCircle className="w-4 h-4 text-teal" />
                <span>Rigorous Double-Blind Review</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-academic-bg px-3 py-1.5 rounded-full border border-gray-200">
                <Globe2 className="w-4 h-4 text-royal" />
                <span>Worldwide Open Access</span>
              </span>
              <span className="flex items-center space-x-1.5 bg-academic-bg px-3 py-1.5 rounded-full border border-gray-200">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>COPE Ethics Compliant</span>
              </span>
            </div>
          </div>

          {/* Current Issue Card Highlight */}
          <div className="bg-academic-bg rounded-xl border border-academic-border p-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-academic-muted uppercase tracking-wider">
              <span>Latest Issue</span>
              <span className="bg-royal/10 text-royal px-2 py-0.5 rounded">Active</span>
            </div>

            {currentIssue ? (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-lg text-navy">
                  {currentIssue.title}
                </h3>
                <p className="text-xs text-academic-muted line-clamp-2">
                  {currentIssue.description || "Explore peer-reviewed scientific contributions published in the latest issue."}
                </p>
                <div className="text-xs text-academic-text font-medium">
                  Published: {formatDate(currentIssue.publicationDate)}
                </div>
                <div className="pt-2">
                  <Button href="/current-issue" variant="royal" size="sm" className="w-full space-x-2 font-semibold">
                    <span>Read Current Issue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-academic-muted italic">
                New volume and issue in preparation.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 3. RECENTLY PUBLISHED ARTICLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-academic-border pb-4">
          <div>
            <span className="text-xs uppercase font-bold text-royal tracking-wider">
              New Research
            </span>
            <h2 className="font-serif font-bold text-3xl text-navy mt-1">
              Recently Published Articles
            </h2>
            <p className="text-sm text-academic-muted mt-1">
              Peer-reviewed scholarly discoveries available with unrestricted open access.
            </p>
          </div>
          <Button href="/archives" variant="outline" size="sm" className="space-x-1.5 font-semibold">
            <span>View All Archives</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {recentArticles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-academic-border">
            <BookOpen className="w-12 h-12 text-academic-muted mx-auto mb-3" />
            <p className="text-sm text-academic-muted">No published articles found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article: any) => (
              <ArticleCard key={article._id.toString()} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* 4. AIMS AND SCOPE HIGHLIGHT */}
      <section className="bg-academic-bg border-y border-academic-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold text-royal tracking-wider">
              Research Domains
            </span>
            <h2 className="font-serif font-bold text-3xl text-navy">
              Aims and Interdisciplinary Scope
            </h2>
            <p className="text-sm text-academic-muted leading-relaxed">
              We welcome submissions of original research, systemic reviews, and technical notes across key contemporary scientific frontiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-academic-border space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-royal/10 text-royal flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-navy">Computer Science & AI</h3>
              <p className="text-xs text-academic-muted leading-relaxed">
                Machine learning, computer vision, natural language processing, edge architectures, zero-knowledge systems, and cryptography.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-academic-border space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-navy">Engineering & Materials</h3>
              <p className="text-xs text-academic-muted leading-relaxed">
                Nanotechnology, perovskites, energy harvesting, aerodynamic mechanics, microgrids, robotics, and high-entropy alloys.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-academic-border space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-lg text-navy">Biomedical & Environmental</h3>
              <p className="text-xs text-academic-muted leading-relaxed">
                Epigenetics, single-cell transcriptomics, biocatalytic recycling, climate modeling, and bioinformatics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY PUBLISH WITH US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold text-teal tracking-wider">
            Author Advantages
          </span>
          <h2 className="font-serif font-bold text-3xl text-navy">
            Why Publish With IJASR?
          </h2>
          <p className="text-sm text-academic-muted">
            We provide a transparent, researcher-centered publication journey from submission to global indexation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-academic-border text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-royal/10 text-royal flex items-center justify-center mx-auto">
              <Globe2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-navy">Worldwide Reach</h4>
            <p className="text-xs text-academic-muted leading-relaxed">
              Open access guarantees your scholarship is immediately discoverable, readable, and citable across 140+ countries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-academic-border text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-navy">Constructive Review</h4>
            <p className="text-xs text-academic-muted leading-relaxed">
              Double-blind review conducted by specialized scholars committed to providing detailed constructive critique.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-academic-border text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-navy">Fast Editorial Decisions</h4>
            <p className="text-xs text-academic-muted leading-relaxed">
              Initial screening within 5 business days, with full peer-review verdicts completed in an average of 4 weeks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-academic-border text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base text-navy">Author Copyright</h4>
            <p className="text-xs text-academic-muted leading-relaxed">
              Authors retain full copyright under CC BY 4.0 licenses, allowing unrestricted academic and personal reuse.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION: SUBMIT MANUSCRIPT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy via-navy-light to-royal text-white rounded-2xl p-10 md:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-4 relative z-10">
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white leading-tight">
              Ready to Share Your Research With the World?
            </h2>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-2xl mx-auto">
              Submit your manuscript online today without creating an account. Our editorial board reviews submissions on a continuous rolling basis.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                href="/submit-manuscript"
                size="lg"
                variant="teal"
                className="space-x-2 text-base font-semibold shadow-lg"
              >
                <Send className="w-5 h-5" />
                <span>Submit Manuscript Online</span>
              </Button>

              <Button
                href="/author-guidelines"
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-base font-semibold"
              >
                <span>Read Author Guidelines</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
