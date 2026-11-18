import React from "react";
import Link from "next/link";
import { FileText, Download, Calendar, ExternalLink, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: {
    _id: string;
    title: string;
    slug: string;
    authors: Array<{ name: string; affiliation?: string }>;
    abstract: string;
    keywords?: string[];
    category?: string;
    volume?: any;
    issue?: any;
    publicationDate?: string | Date;
    doi?: string;
    pdfFile?: any;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const authorNames = article.authors?.map((a) => a.name).join(", ") || "Unknown Authors";
  const volNumber = article.volume?.volumeNumber || "–";
  const issueNumber = article.issue?.issueNumber || "–";

  return (
    <article className="bg-white rounded-lg border border-academic-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Meta badges: Category, Vol, Issue */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {article.category && (
            <Badge variant="royal">{article.category}</Badge>
          )}
          <span className="text-xs text-academic-muted font-medium">
            Vol. {volNumber}, Issue {issueNumber}
          </span>
          <span className="text-xs text-academic-muted">•</span>
          <div className="flex items-center text-xs text-academic-muted space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(article.publicationDate)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-lg text-navy hover:text-royal transition-colors mb-2 leading-snug">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        {/* Authors */}
        <p className="text-sm font-medium text-academic-muted mb-3 italic">
          {authorNames}
        </p>

        {/* Abstract snippet */}
        <p className="text-sm text-academic-text/80 line-clamp-3 mb-4 leading-relaxed">
          {article.abstract}
        </p>

        {/* Keywords */}
        {article.keywords && article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {article.keywords.slice(0, 4).map((kw, i) => (
              <span
                key={i}
                className="text-[11px] bg-academic-bg text-academic-muted px-2 py-0.5 rounded border border-gray-200"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <Button
          href={`/articles/${article.slug}`}
          variant="outline"
          size="sm"
          className="space-x-1.5 text-xs font-semibold"
        >
          <span>View Article</span>
          <ExternalLink className="w-3 h-3" />
        </Button>

        {article.pdfFile && (
          <Button
            href={`/api/articles/${article.slug}/pdf?download=true`}
            variant="teal"
            size="sm"
            className="space-x-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </Button>
        )}
      </div>
    </article>
  );
}
