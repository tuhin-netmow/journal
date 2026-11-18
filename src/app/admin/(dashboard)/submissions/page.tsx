import React from "react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import Manuscript from "@/models/Manuscript";
import { FileText, Download, Eye, Search, Filter, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { DeleteManuscriptButton } from "@/components/admin/DeleteManuscriptButton";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

interface SubmissionsPageProps {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    search?: string;
  }>;
}

export default async function AdminSubmissionsPage({ searchParams }: SubmissionsPageProps) {
  await connectToDatabase();
  const sp = await searchParams;

  const queryStatus = sp.status || "all";
  const queryPayment = sp.paymentStatus || "all";
  const querySearch = sp.search || "";

  const query: Record<string, any> = {};
  if (queryStatus !== "all") query.status = queryStatus;
  if (queryPayment !== "all") query.paymentStatus = queryPayment;
  if (querySearch) {
    query.$or = [
      { submissionId: { $regex: querySearch, $options: "i" } },
      { title: { $regex: querySearch, $options: "i" } },
      { authorName: { $regex: querySearch, $options: "i" } },
      { authorEmail: { $regex: querySearch, $options: "i" } },
      { institution: { $regex: querySearch, $options: "i" } },
    ];
  }

  const submissions = await Manuscript.find(query).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
            Manuscript Submissions
          </h1>
          <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
            Review submitted author papers, update review decisions, inspect private PDFs, and manage fees.
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-academic-border shadow-sm">
        <form method="GET" action="/admin/submissions" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Search Submissions
            </label>
            <div className="relative">
              <Input
                name="search"
                defaultValue={querySearch}
                placeholder="Search by ID, title, author, email, or institution..."
                className="pl-9"
              />
              <Search className="w-4 h-4 text-academic-muted absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Review Status
            </label>
            <select
              name="status"
              defaultValue={queryStatus}
              className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
            >
              <option value="all">All Review Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="revision_requested">Revision Requested</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Payment Status
            </label>
            <select
              name="paymentStatus"
              defaultValue={queryPayment}
              className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
              <option value="not_required">Not Required</option>
            </select>
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex items-center justify-end space-x-3 pt-2">
            <Button type="submit" variant="royal" size="sm" className="space-x-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </Button>
            {(querySearch || queryStatus !== "all" || queryPayment !== "all") && (
              <Button href="/admin/submissions" variant="outline" size="sm">
                Clear
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-academic-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between text-xs text-academic-muted font-medium">
          <span>Total: <strong>{submissions.length}</strong> manuscripts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-academic-bg text-navy uppercase tracking-wider font-semibold border-b border-academic-border">
              <tr>
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Author & Affiliation</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-academic-muted">
                    No manuscripts matching the criteria.
                  </td>
                </tr>
              ) : (
                submissions.map((sub: any) => (
                  <tr key={sub._id.toString()} className="hover:bg-academic-bg/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-royal whitespace-nowrap">
                      <Link href={`/admin/submissions/${sub._id.toString()}`} className="hover:underline">
                        {sub.submissionId}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs font-serif font-bold text-navy truncate">
                      <Link
                        href={`/admin/submissions/${sub._id.toString()}`}
                        className="hover:text-royal transition-colors"
                        title={sub.title}
                      >
                        {sub.title}
                      </Link>
                      <div className="text-[11px] text-academic-muted font-sans font-normal mt-0.5">
                        {sub.manuscriptType} • {sub.category}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-academic-text">{sub.authorName}</div>
                      <div className="text-[11px] text-academic-muted">{sub.authorEmail}</div>
                      <div className="text-[11px] text-academic-muted truncate max-w-[180px]">
                        {sub.institution}, {sub.country}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-academic-muted whitespace-nowrap">
                      {formatDate(sub.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={sub.status} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PaymentStatusBadge status={sub.paymentStatus} />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          href={`/admin/submissions/${sub._id.toString()}`}
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Button>

                        {sub.pdfFile?.storageKey && (
                          <Button
                            href={`/api/submissions/${sub._id.toString()}/pdf?download=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download Manuscript PDF"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-academic-muted hover:text-navy"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        <DeleteManuscriptButton
                          id={sub._id.toString()}
                          submissionId={sub.submissionId}
                        />
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
