"use client";

import React, { useState } from "react";
import { Copy, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CitationBoxProps {
  article: {
    title: string;
    authors: Array<{ name: string; affiliation?: string }>;
    publicationDate?: string | Date;
    volume?: { volumeNumber: number; year: number };
    issue?: { issueNumber: number };
    doi?: string;
  };
  journalName?: string;
}

export function CitationBox({ article, journalName = "International Journal of Advanced Scientific Research" }: CitationBoxProps) {
  const [activeFormat, setActiveFormat] = useState<"APA" | "IEEE" | "BibTeX">("APA");
  const [copied, setCopied] = useState(false);

  const year = article.publicationDate
    ? new Date(article.publicationDate).getFullYear()
    : article.volume?.year || new Date().getFullYear();
  const authorList = article.authors.map((a) => a.name).join(", ");
  const volNum = article.volume?.volumeNumber || "1";
  const issNum = article.issue?.issueNumber || "1";
  const doiText = article.doi ? ` https://doi.org/${article.doi}` : "";

  const citations = {
    APA: `${authorList} (${year}). ${article.title}. ${journalName}, ${volNum}(${issNum}).${doiText}`,
    IEEE: `${authorList}, "${article.title}," ${journalName}, vol. ${volNum}, no. ${issNum}, ${year}.${doiText}`,
    BibTeX: `@article{ijasr_${year}_${article.title.slice(0, 10).toLowerCase().replace(/\s+/g, "")},
  title={${article.title}},
  author={${article.authors.map((a) => a.name).join(" and ")}},
  journal={${journalName}},
  volume={${volNum}},
  number={${issNum}},
  year={${year}}${article.doi ? `,\n  doi={${article.doi}}` : ""}
}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citations[activeFormat]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-academic-bg rounded-lg border border-academic-border p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-gray-200 gap-3">
        <div className="flex items-center space-x-2">
          <Quote className="w-5 h-5 text-royal" />
          <h4 className="font-serif font-bold text-navy text-sm">Cite This Article</h4>
        </div>
        <div className="flex items-center space-x-1">
          {(["APA", "IEEE", "BibTeX"] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setActiveFormat(fmt)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeFormat === fmt
                  ? "bg-navy text-white"
                  : "bg-white text-academic-text border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <div className="my-3 font-mono text-xs text-academic-text bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap break-all leading-relaxed">
        {citations[activeFormat]}
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="space-x-1.5 text-xs text-royal border-royal/30 hover:bg-royal/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Citation Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Citation ({activeFormat})</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
