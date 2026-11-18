import React from "react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import Volume from "@/models/Volume";
import Issue from "@/models/Issue";
import { BookMarked, Plus, Search, Edit, Eye, Download, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

interface ArticlesPageProps {
  searchParams: Promise<{
    status?: string;
    volume?: string;
    issue?: string;
    search?: string;
  }>;
}

export default async function AdminArticlesPage({ searchParams }: ArticlesPageProps) {
  await connectToDatabase();
  const sp = await searchParams;

  const queryStatus = sp.status || "all";
  const queryVolume = sp.volume || "all";
  const querySearch = sp.search || "";

  const query: Record<string, any> = {};
  if (queryStatus !== "all") query.status = queryStatus;
  if (queryVolume !== "all") query.volume = queryVolume;
  if (querySearch) {
    query.$or = [
      { title: { $regex: querySearch, $options: "i" } },
      { "authors.name": { $regex: querySearch, $options: "i" } },
      { slug: { $regex: querySearch, $options: "i" } },
      { category: { $regex: querySearch, $options: "i" } },
    ];
  }

  const [articles, volumes] = await Promise.all([
    Article.find(query)
      .populate("volume", "volumeNumber year")
      .populate("issue", "issueNumber title")
      .sort({ publicationDate: -1, createdAt: -1 })
      .lean(),
    Volume.find().sort({ volumeNumber: -1 }).lean(),
  ]);

  return (
    <div className="space-y-6">
      {/* Title & Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
            Article Management
          </h1>
          <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
            Create, publish, edit, and organize peer-reviewed research papers across journal volumes and issues.
          </p>
        </div>

        <Button
          href="/admin/articles/new"
          variant="teal"
          size="sm"
          className="space-x-1.5 shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Article</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-academic-border shadow-sm">
        <form method="GET" action="/admin/articles" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Search Articles
            </label>
            <div className="relative">
              <Input
                name="search"
                defaultValue={querySearch}
                placeholder="Search by title, author, slug..."
                className="pl-9"
              />
              <Search className="w-4 h-4 text-academic-muted absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Publication Status
            </label>
            <select
              name="status"
              defaultValue={queryStatus}
              className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
            >
              <option value="all">All Articles (Drafts & Published)</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Volume
            </label>
            <select
              name="volume"
              defaultValue={queryVolume}
              className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
            >
              <option value="all">All Volumes</option>
              {volumes.map((v: any) => (
                <option key={v._id.toString()} value={v._id.toString()}>
                  Volume {v.volumeNumber} ({v.year})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end space-x-3 pt-2">
            <Button type="submit" variant="royal" size="sm" className="space-x-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </Button>
            {(querySearch || queryStatus !== "all" || queryVolume !== "all") && (
              <Button href="/admin/articles" variant="outline" size="sm">
                Reset
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-academic-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between text-xs text-academic-muted font-medium">
          <span>Total: <strong>{articles.length}</strong> articles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-academic-bg text-navy uppercase tracking-wider font-semibold border-b border-academic-border">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Authors</th>
                <th className="py-3 px-4">Volume / Issue</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Publication Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-academic-muted">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                articles.map((art: any) => (
                  <tr key={art._id.toString()} className="hover:bg-academic-bg/50 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <Link
                        href={`/admin/articles/${art._id.toString()}/edit`}
                        className="font-serif font-bold text-sm text-navy hover:text-royal transition-colors block leading-snug"
                      >
                        {art.title}
                      </Link>
                      <span className="font-mono text-[10px] text-academic-muted block mt-0.5">
                        /{art.slug}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-academic-text whitespace-nowrap">
                      {art.authors?.map((a: any) => a.name).join(", ")}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-navy">
                        Vol {art.volume?.volumeNumber || "–"}, Issue {art.issue?.issueNumber || "–"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-academic-muted">
                      {art.category}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={art.status} />
                    </td>

                    <td className="py-3.5 px-4 text-academic-muted whitespace-nowrap">
                      {formatDate(art.publicationDate)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {art.status === "published" && (
                          <Button
                            href={`/articles/${art.slug}`}
                            target="_blank"
                            title="View Public Article Page"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-royal hover:bg-royal/10"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        <Button
                          href={`/admin/articles/${art._id.toString()}/edit`}
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
