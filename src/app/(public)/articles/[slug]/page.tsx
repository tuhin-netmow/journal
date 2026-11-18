import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import Article from "@/models/Article";
import JournalSettings from "@/models/JournalSettings";
import {
  Download,
  Calendar,
  Layers,
  FileText,
  Share2,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Tag,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CitationBox } from "@/components/journal/CitationBox";
import { formatDate } from "@/lib/utils";

interface ArticleDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  await connectToDatabase();
  const { slug } = await params;
  const article: any = await Article.findOne({
    slug,
    status: "published",
  }).lean();

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.abstract.slice(0, 160) + "...",
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.abstract.slice(0, 200),
      type: "article",
      publishedTime: article.publicationDate?.toISOString(),
      authors: article.authors.map((a: any) => a.name),
    },
  };
}

export const revalidate = 0;

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  await connectToDatabase();
  const { slug } = await params;

  const rawArticle: any = await Article.findOne({
    slug,
    status: "published",
  })
    .populate("volume", "volumeNumber year description")
    .populate("issue", "issueNumber title publicationDate")
    .lean();

  if (!rawArticle) {
    notFound();
  }

  const article: any = JSON.parse(JSON.stringify(rawArticle));

  const settings: any = (await JournalSettings.findOne().lean()) || {};
  const journalName = settings.journalName || "International Journal of Advanced Scientific Research";

  // ScholarlyArticle JSON-LD structured data for academic SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.title,
    description: article.abstract,
    datePublished: article.publicationDate,
    author: article.authors.map((a: any) => ({
      "@type": "Person",
      name: a.name,
      ...(a.affiliation ? { affiliation: { "@type": "Organization", name: a.affiliation } } : {}),
    })),
    publisher: {
      "@type": "Organization",
      name: settings.publisherName || "Apex Scholarly Publishing",
    },
    isPartOf: {
      "@type": "PublicationIssue",
      issueNumber: article.issue?.issueNumber,
      isPartOf: {
        "@type": "PublicationVolume",
        volumeNumber: article.volume?.volumeNumber,
      },
    },
    ...(article.doi ? { identifier: article.doi } : {}),
  };

  return (
    <div className="py-12 bg-academic-bg min-h-screen">
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Back Link */}
        <div>
          <Link
            href="/archives"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-royal hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Journal Archives</span>
          </Link>
        </div>

        {/* Main Article Container */}
        <article className="bg-white rounded-2xl border border-academic-border p-8 sm:p-12 shadow-sm space-y-8">
          {/* Header Metadata */}
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="royal">{article.category}</Badge>
              <span className="text-xs text-academic-muted font-medium">
                Volume {article.volume?.volumeNumber || "1"}, Issue {article.issue?.issueNumber || "1"} ({article.volume?.year || "2026"})
              </span>
              <span className="text-xs text-academic-muted">•</span>
              <span className="text-xs text-academic-muted flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Published: {formatDate(article.publicationDate)}</span>
              </span>
            </div>

            <h1 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-navy leading-tight">
              {article.title}
            </h1>

            {/* Authors with Affiliations */}
            <div className="pt-2">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-academic-text">
                {article.authors.map((author: any, index: number) => (
                  <div key={index} className="flex flex-col">
                    <span className="font-bold text-navy">{author.name}</span>
                    {author.affiliation && (
                      <span className="text-xs text-academic-muted">
                        {author.affiliation}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DOI & Open Access Banner */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <span className="bg-teal/10 text-teal border border-teal/20 px-2.5 py-0.5 rounded font-semibold uppercase text-[10px]">
                  Open Access
                </span>
                {article.doi && (
                  <span className="text-academic-muted font-mono">
                    DOI:{" "}
                    <a
                      href={`https://doi.org/${article.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-royal hover:underline"
                    >
                      {article.doi}
                    </a>
                  </span>
                )}
              </div>

              {article.pdfFile && (
                <Button
                  href={`/api/articles/${article.slug}/pdf?download=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="teal"
                  size="sm"
                  className="space-x-2 shadow-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full-Text PDF</span>
                </Button>
              )}
            </div>
          </div>

          {/* Abstract Section */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-xl text-navy">Abstract</h2>
            <div className="text-academic-text/90 leading-relaxed text-sm sm:text-base whitespace-pre-line text-justify">
              {article.abstract}
            </div>
          </section>

          {/* Keywords */}
          {article.keywords && article.keywords.length > 0 && (
            <section className="space-y-2 pt-2">
              <h3 className="font-serif font-semibold text-sm text-navy uppercase tracking-wider">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs bg-academic-bg border border-academic-border text-academic-text px-3 py-1 rounded-full font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* PDF Download Callout Box */}
          {article.pdfFile && (
            <div className="bg-academic-bg rounded-xl border border-academic-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-navy text-sm">
                    Full-Text Research Article
                  </h4>
                  <p className="text-xs text-academic-muted">
                    Official publisher formatted PDF • Free unrestricted download
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Button
                  href={`/api/articles/${article.slug}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto space-x-1.5 text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View PDF</span>
                </Button>

                <Button
                  href={`/api/articles/${article.slug}/pdf?download=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="teal"
                  size="sm"
                  className="w-full sm:w-auto space-x-1.5 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>
          )}

          {/* Citation Information with Copy Citation Component */}
          <section className="pt-4 border-t border-gray-100">
            <CitationBox article={article} journalName={journalName} />
          </section>
        </article>
      </div>
    </div>
  );
}
