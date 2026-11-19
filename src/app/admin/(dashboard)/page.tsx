import React from "react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import Manuscript from "@/models/Manuscript";
import Article from "@/models/Article";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import JournalSettings from "@/models/JournalSettings";
import { DEFAULT_CATEGORIES, DEFAULT_MANUSCRIPT_TYPES } from "@/lib/constants";
import {
  FileText,
  Clock,
  Eye,
  CheckCircle2,
  BookMarked,
  Layers,
  Calendar,
  ArrowRight,
  Plus,
  Send,
  ExternalLink,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  await connectToDatabase();

  // Aggregate stats
  const [
    totalSubmissions,
    pendingSubmissions,
    underReviewSubmissions,
    acceptedSubmissions,
    publishedArticles,
    totalVolumes,
    totalIssues,
    recentSubmissions,
    recentArticles,
    settings,
  ] = await Promise.all([
    Manuscript.countDocuments(),
    Manuscript.countDocuments({ status: "submitted" }),
    Manuscript.countDocuments({ status: "under_review" }),
    Manuscript.countDocuments({ status: "accepted" }),
    Article.countDocuments({ status: "published" }),
    Volume.countDocuments(),
    Issue.countDocuments(),
    Manuscript.find().sort({ createdAt: -1 }).limit(5).lean(),
    Article.find().populate("volume", "volumeNumber").populate("issue", "issueNumber").sort({ createdAt: -1 }).limit(5).lean(),
    JournalSettings.findOne().lean(),
  ]);

  const liveCategories: string[] =
    settings?.categories && settings.categories.length > 0
      ? settings.categories
      : DEFAULT_CATEGORIES;
  const liveManuscriptTypes: string[] =
    settings?.manuscriptTypes && settings.manuscriptTypes.length > 0
      ? settings.manuscriptTypes
      : DEFAULT_MANUSCRIPT_TYPES;

  const stats = [
    {
      label: "Total Submissions",
      value: totalSubmissions,
      icon: FileText,
      color: "text-royal bg-royal/10",
      href: "/admin/submissions",
    },
    {
      label: "New / Pending Review",
      value: pendingSubmissions,
      icon: Clock,
      color: "text-amber-700 bg-amber-100",
      href: "/admin/submissions?status=submitted",
    },
    {
      label: "Under Review",
      value: underReviewSubmissions,
      icon: Eye,
      color: "text-indigo-700 bg-indigo-100",
      href: "/admin/submissions?status=under_review",
    },
    {
      label: "Accepted Manuscripts",
      value: acceptedSubmissions,
      icon: CheckCircle2,
      color: "text-emerald-700 bg-emerald-100",
      href: "/admin/submissions?status=accepted",
    },
    {
      label: "Published Articles",
      value: publishedArticles,
      icon: BookMarked,
      color: "text-teal bg-teal/10",
      href: "/admin/articles",
    },
    {
      label: "Volumes & Issues",
      value: `${totalVolumes} / ${totalIssues}`,
      icon: Layers,
      color: "text-navy bg-navy/10",
      href: "/admin/volumes",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Quick Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
            Publishing Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
            Real-time overview of manuscript pipeline, peer reviews, volumes, and publications.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            href="/admin/articles/new"
            variant="teal"
            size="sm"
            className="space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </Button>
          <Button
            href="/admin/submissions"
            variant="outline"
            size="sm"
            className="space-x-1.5"
          >
            <span>View Submissions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 1. KEY STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              href={s.href}
              className="bg-white rounded-xl border border-academic-border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-academic-muted uppercase tracking-wider">
                  {s.label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="font-serif font-black text-2xl text-navy">
                {s.value}
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2. LIVE MANUSCRIPT TAXONOMY (CATEGORIES & TYPES) */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal/10 text-teal flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-navy text-base">
                Live Manuscript Taxonomy (Categories &amp; Types)
              </h3>
              <p className="text-xs text-academic-muted">
                Academic disciplines and manuscript article formats dynamically served to authors and editors.
              </p>
            </div>
          </div>
          <Button
            href="/admin/settings?tab=taxonomy#taxonomy"
            variant="outline"
            size="sm"
            className="text-xs space-x-1.5 border-royal/30 text-royal hover:bg-royal hover:text-white transition-colors"
          >
            <span>Manage Categories &amp; Types</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Categories */}
          <div className="space-y-2">
            <div className="font-bold text-navy uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Active Research Categories ({liveCategories.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-3 bg-academic-bg rounded-lg border border-academic-border min-h-[50px] items-center">
              {liveCategories.map((cat: string) => (
                <span
                  key={cat}
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-teal/30 text-teal-dark font-medium shadow-2xs"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Manuscript Types */}
          <div className="space-y-2">
            <div className="font-bold text-navy uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Accepted Manuscript Types ({liveManuscriptTypes.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-3 bg-academic-bg rounded-lg border border-academic-border min-h-[50px] items-center">
              {liveManuscriptTypes.map((type: string) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-royal/30 text-royal font-medium shadow-2xs"
                >
                  <FileText className="w-3 h-3 text-royal/60 mr-1" />
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT SUBMISSIONS & PUBLICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Manuscript Submissions */}
        <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-royal" />
              <h3 className="font-serif font-bold text-navy text-base">
                Recent Submissions
              </h3>
            </div>
            <Link
              href="/admin/submissions"
              className="text-xs text-royal hover:underline font-medium"
            >
              View All ({totalSubmissions}) →
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <p className="text-xs text-academic-muted py-6 text-center">
              No submissions found.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 space-y-3">
              {recentSubmissions.map((sub: any) => (
                <div key={sub._id.toString()} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-royal">
                        {sub.submissionId}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <Link
                      href={`/admin/submissions/${sub._id.toString()}`}
                      className="font-serif font-bold text-sm text-navy hover:text-royal transition-colors block truncate"
                    >
                      {sub.title}
                    </Link>
                    <div className="text-xs text-academic-muted">
                      <span className="font-medium text-navy">{sub.manuscriptType || "Research Article"}</span>
                      {" • "}
                      <span className="text-teal-dark">{sub.category || "General Science"}</span>
                      {" • "}
                      By {sub.authorName} ({sub.institution})
                    </div>
                  </div>

                  <Button
                    href={`/admin/submissions/${sub._id.toString()}`}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <BookMarked className="w-4 h-4 text-teal" />
              <h3 className="font-serif font-bold text-navy text-base">
                Published & Draft Articles
              </h3>
            </div>
            <Link
              href="/admin/articles"
              className="text-xs text-teal hover:underline font-medium"
            >
              View All Articles →
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <p className="text-xs text-academic-muted py-6 text-center">
              No articles found.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 space-y-3">
              {recentArticles.map((art: any) => (
                <div key={art._id.toString()} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={art.status} />
                      <span className="text-[11px] text-academic-muted">
                        Vol {art.volume?.volumeNumber || "–"}, Issue {art.issue?.issueNumber || "–"}
                      </span>
                    </div>
                    <Link
                      href={`/admin/articles/${art._id.toString()}/edit`}
                      className="font-serif font-bold text-sm text-navy hover:text-royal transition-colors block truncate"
                    >
                      {art.title}
                    </Link>
                    <div className="text-xs text-academic-muted">
                      {art.authors?.map((a: any) => a.name).join(", ")}
                    </div>
                  </div>

                  <Button
                    href={`/admin/articles/${art._id.toString()}/edit`}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
