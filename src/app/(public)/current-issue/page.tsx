import React from "react";
import connectToDatabase from "@/lib/mongodb";
import Issue from "@/models/Issue";
import Article from "@/models/Article";
import { BookOpen, Calendar, Layers, FileText } from "lucide-react";
import { ArticleCard } from "@/components/journal/ArticleCard";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Current Issue",
  description: "Browse scholarly articles published in the current issue of the International Journal of Advanced Scientific Research.",
};

export const revalidate = 0;

export default async function CurrentIssuePage() {
  await connectToDatabase();

  const currentIssue = await Issue.findOne({ status: "published" })
    .populate("volume", "volumeNumber year description")
    .sort({ publicationDate: -1, createdAt: -1 })
    .lean();

  let articles: any[] = [];
  if (currentIssue) {
    articles = await Article.find({
      issue: currentIssue._id,
      status: "published",
    })
      .populate("volume", "volumeNumber year")
      .populate("issue", "issueNumber title publicationDate")
      .sort({ publicationDate: -1, createdAt: -1 })
      .lean();
  }

  return (
    <div className="py-12 bg-academic-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Issue Banner */}
        {currentIssue ? (
          <div className="bg-white rounded-2xl border border-academic-border p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-teal text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                Current Issue
              </span>
              <span className="text-xs font-semibold text-academic-muted flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-royal" />
                <span>
                  Volume {currentIssue.volume?.volumeNumber || "–"}, Issue {currentIssue.issueNumber} ({currentIssue.volume?.year || "2026"})
                </span>
              </span>
              <span className="text-xs font-semibold text-academic-muted flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-royal" />
                <span>Published: {formatDate(currentIssue.publicationDate)}</span>
              </span>
            </div>

            <div>
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-navy">
                {currentIssue.title}
              </h1>
              {currentIssue.description && (
                <p className="text-academic-muted text-sm sm:text-base mt-3 max-w-3xl leading-relaxed">
                  {currentIssue.description}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center space-x-4 text-xs text-academic-muted font-medium">
              <span>Articles in this issue: <strong>{articles.length}</strong></span>
              <span>•</span>
              <span>All articles peer-reviewed and open access</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-academic-border p-12 text-center">
            <BookOpen className="w-12 h-12 text-academic-muted mx-auto mb-3" />
            <h2 className="font-serif font-bold text-xl text-navy">
              No Published Issue Available
            </h2>
            <p className="text-sm text-academic-muted mt-2">
              Our editorial team is currently preparing the forthcoming journal issue.
            </p>
          </div>
        )}

        {/* Articles Section */}
        {articles.length > 0 && (
          <div className="space-y-6">
            <div className="border-b border-academic-border pb-3">
              <h2 className="font-serif font-bold text-2xl text-navy">
                Table of Contents
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((art) => (
                <ArticleCard key={art._id.toString()} article={art} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
