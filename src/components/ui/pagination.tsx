import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  baseUrl: string;
  searchParams?: Record<string, string | undefined>;
  itemName?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  baseUrl,
  searchParams = {},
  itemName = "items",
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const getPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") {
        params.set(key, value);
      }
    }
    if (targetPage > 1) {
      params.set("page", targetPage.toString());
    }
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis-start");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis-end");
    }

    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
      {/* Result Counter */}
      <div className="text-academic-muted">
        Showing <span className="font-semibold text-navy">{startItem}</span> to{" "}
        <span className="font-semibold text-navy">{endItem}</span> of{" "}
        <span className="font-semibold text-navy">{totalItems}</span> {itemName}
      </div>

      {/* Page Navigation Controls */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center space-x-1.5">
          {/* Previous Page Link */}
          {hasPrev ? (
            <Link
              href={getPageUrl(currentPage - 1)}
              className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-academic-border bg-white text-academic-text hover:bg-academic-bg hover:text-navy transition-colors font-medium shadow-2xs"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Link>
          ) : (
            <span
              className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed font-medium select-none"
              aria-disabled="true"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </span>
          )}

          {/* Page Number Buttons */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((p, idx) => {
              if (typeof p === "string") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-academic-muted font-bold select-none"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return isCurrent ? (
                <span
                  key={p}
                  aria-current="page"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-royal text-white font-bold shadow-xs select-none"
                >
                  {p}
                </span>
              ) : (
                <Link
                  key={p}
                  href={getPageUrl(p)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-academic-border bg-white text-academic-text hover:bg-academic-bg hover:text-navy font-medium transition-colors shadow-2xs"
                >
                  {p}
                </Link>
              );
            })}
          </div>

          {/* Next Page Link */}
          {hasNext ? (
            <Link
              href={getPageUrl(currentPage + 1)}
              className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-academic-border bg-white text-academic-text hover:bg-academic-bg hover:text-navy transition-colors font-medium shadow-2xs"
              title="Next Page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          ) : (
            <span
              className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed font-medium select-none"
              aria-disabled="true"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
