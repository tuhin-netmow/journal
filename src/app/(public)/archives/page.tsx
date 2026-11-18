import React from "react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import Article from "@/models/Article";
import { BookOpen, Calendar, Search, Layers, Filter } from "lucide-react";
import { ArticleCard } from "@/components/journal/ArticleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Journal Archives",
  description: "Explore the comprehensive archival collection of past volumes, issues, and peer-reviewed articles published in IJASR.",
};

export const revalidate = 0;

interface ArchivesPageProps {
  searchParams: Promise<{
    q?: string;
    volume?: string;
    issue?: string;
    category?: string;
  }>;
}

export default async function ArchivesPage({ searchParams }: ArchivesPageProps) {
  await connectToDatabase();
  const sp = await searchParams;

  const querySearch = sp.q || "";
  const queryVolume = sp.volume || "";
  const queryIssue = sp.issue || "";
  const queryCategory = sp.category || "";

  // Fetch all volumes sorted descending
  const volumes = await Volume.find().sort({ volumeNumber: -1 }).lean();

  // Fetch all published issues
  const allIssues = await Issue.find({ status: "published" })
    .populate("volume", "volumeNumber year")
    .sort({ publicationDate: -1 })
    .lean();

  // Group issues by year and volume
  const volumeTree: Record<string, { volume: any; issues: any[] }> = {};
  volumes.forEach((vol: any) => {
    volumeTree[vol._id.toString()] = {
      volume: vol,
      issues: [],
    };
  });

  allIssues.forEach((iss: any) => {
    const volId = iss.volume?._id?.toString() || iss.volume?.toString();
    if (volumeTree[volId]) {
      volumeTree[volId].issues.push(iss);
    }
  });

  // Build MongoDB query for articles
  const articleQuery: Record<string, any> = { status: "published" };

  if (queryVolume) {
    articleQuery.volume = queryVolume;
  }
  if (queryIssue) {
    articleQuery.issue = queryIssue;
  }
  if (queryCategory && queryCategory !== "all") {
    articleQuery.category = queryCategory;
  }
  if (querySearch) {
    articleQuery.$or = [
      { title: { $regex: querySearch, $options: "i" } },
      { abstract: { $regex: querySearch, $options: "i" } },
      { "authors.name": { $regex: querySearch, $options: "i" } },
      { keywords: { $regex: querySearch, $options: "i" } },
    ];
  }

  const articles = await Article.find(articleQuery)
    .populate("volume", "volumeNumber year")
    .populate("issue", "issueNumber title publicationDate")
    .sort({ publicationDate: -1, createdAt: -1 })
    .lean();

  // Get distinct categories
  const categories = await Article.distinct("category", { status: "published" });

  return (
    <div className="py-12 bg-academic-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="border-b border-academic-border pb-8">
          <span className="text-xs uppercase font-bold text-royal tracking-wider">
            Repository of Scholarly Work
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-navy mt-1">
            Journal Archives
          </h1>
          <p className="text-academic-muted text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            Browse through historical and current volumes, search across specialized subject categories, and download full-text peer-reviewed research papers.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-xl border border-academic-border shadow-sm">
          <form method="GET" action="/archives" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-academic-text mb-1">
                Search Articles
              </label>
              <div className="relative">
                <Input
                  name="q"
                  defaultValue={querySearch}
                  placeholder="Search by title, author name, keyword, or abstract..."
                  className="pl-9"
                />
                <Search className="w-4 h-4 text-academic-muted absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-academic-text mb-1">
                Category
              </label>
              <select
                name="category"
                defaultValue={queryCategory}
                className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
              >
                <option value="all">All Research Fields</option>
                {categories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <Button type="submit" variant="royal" className="w-full space-x-2">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>
              {(querySearch || queryVolume || queryIssue || (queryCategory && queryCategory !== "all")) && (
                <Button href="/archives" variant="outline">Reset</Button>
              )}
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Volume & Issue Tree Navigation */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-academic-border p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <Layers className="w-4 h-4 text-royal" />
                <h3 className="font-serif font-bold text-navy text-sm">
                  Browse by Volume
                </h3>
              </div>

              <div className="space-y-4">
                {Object.values(volumeTree).map(({ volume, issues }) => (
                  <div key={volume._id.toString()} className="space-y-2">
                    <Link
                      href={`/archives?volume=${volume._id.toString()}`}
                      className={`block font-serif font-bold text-xs uppercase tracking-wide hover:text-royal transition-colors ${
                        queryVolume === volume._id.toString() ? "text-royal font-black" : "text-navy"
                      }`}
                    >
                      Volume {volume.volumeNumber} ({volume.year})
                    </Link>

                    {issues.length > 0 ? (
                      <ul className="pl-3 border-l-2 border-gray-100 space-y-1 text-xs">
                        {issues.map((iss: any) => (
                          <li key={iss._id.toString()}>
                            <Link
                              href={`/archives?volume=${volume._id.toString()}&issue=${iss._id.toString()}`}
                              className={`hover:text-royal transition-colors block py-0.5 ${
                                queryIssue === iss._id.toString()
                                  ? "text-royal font-bold"
                                  : "text-academic-muted"
                              }`}
                            >
                              Issue {iss.issueNumber}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[11px] text-gray-400 pl-3 block">
                        No published issues
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Article Search Results */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-navy">
                {articles.length} {articles.length === 1 ? "Article" : "Articles"} Found
              </h2>
            </div>

            {articles.length === 0 ? (
              <div className="bg-white rounded-xl border border-academic-border p-12 text-center">
                <BookOpen className="w-12 h-12 text-academic-muted mx-auto mb-3" />
                <h3 className="font-serif font-bold text-lg text-navy">No Articles Found</h3>
                <p className="text-xs text-academic-muted mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords or clearing applied filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((art: any) => (
                  <ArticleCard key={art._id.toString()} article={art} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
