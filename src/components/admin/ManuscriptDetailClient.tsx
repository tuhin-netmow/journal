"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Trash2,
  Send,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface ManuscriptDetailClientProps {
  manuscript: any;
  initialLinkedArticle?: any;
}

export function ManuscriptDetailClient({
  manuscript,
  initialLinkedArticle,
}: ManuscriptDetailClientProps) {
  const router = useRouter();

  const [status, setStatus] = useState(manuscript.status);
  const [paymentStatus, setPaymentStatus] = useState(manuscript.paymentStatus);
  const [adminNotes, setAdminNotes] = useState(manuscript.adminNotes || "");
  const [linkedArticle, setLinkedArticle] = useState<any>(initialLinkedArticle || null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/submissions/${manuscript._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update manuscript");
      }

      if (data.publishedArticle) {
        setLinkedArticle(data.publishedArticle);
      }

      const successText = data.publishedArticle
        ? "Manuscript published & scholarly article released to archives!"
        : data.emailDispatched
        ? `Manuscript status updated & notification email sent to ${data.authorEmail}!`
        : "Manuscript review status and notes updated successfully!";
      setSuccessMessage(successText);
      toast.success(successText);
      router.refresh();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save updates.");
      toast.error(err.message || "Failed to save updates.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this manuscript submission and its PDF?")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/submissions/${manuscript._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success(`Manuscript ${manuscript.submissionId} deleted successfully!`);
      router.push("/admin/submissions");
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to delete manuscript: " + err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/submissions"
            className="inline-flex items-center space-x-1.5 text-xs text-royal hover:underline font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Submissions</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="font-serif font-black text-2xl text-navy">
              Submission {manuscript.submissionId}
            </h1>
            <StatusBadge status={status} />
            <PaymentStatusBadge status={paymentStatus} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {linkedArticle?.slug ? (
            <>
              <Button
                href={`/articles/${linkedArticle.slug}`}
                target="_blank"
                variant="teal"
                size="sm"
                className="space-x-1.5 shadow-sm font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Live Article</span>
              </Button>

              <Button
                href={`/admin/articles/${linkedArticle._id}/edit`}
                variant="outline"
                size="sm"
                className="space-x-1.5 text-xs font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Edit Article</span>
              </Button>
            </>
          ) : (
            <Button
              href={`/admin/articles/new?sourceManuscriptId=${manuscript._id}`}
              variant="teal"
              size="sm"
              className="space-x-1.5 shadow-sm font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              <span>Publish as Article</span>
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center space-x-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Manuscript Metadata & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paper Details */}
          <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-navy pb-3 border-b border-gray-100">
              Manuscript Information
            </h3>

            <div>
              <span className="text-xs text-academic-muted font-medium block">Title</span>
              <h2 className="font-serif font-bold text-xl text-navy mt-1">
                {manuscript.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-academic-muted block font-medium">Type</span>
                <span className="font-semibold text-navy">{manuscript.manuscriptType}</span>
              </div>
              <div>
                <span className="text-academic-muted block font-medium">Research Category</span>
                <span className="font-semibold text-navy">{manuscript.category}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-academic-muted font-medium block mb-1">Abstract</span>
              <div className="text-xs text-academic-text/90 bg-academic-bg p-4 rounded-lg border border-gray-200 whitespace-pre-line leading-relaxed">
                {manuscript.abstract}
              </div>
            </div>

            {manuscript.keywords && manuscript.keywords.length > 0 && (
              <div>
                <span className="text-xs text-academic-muted font-medium block mb-1">Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {manuscript.keywords.map((kw: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-academic-text px-2.5 py-0.5 rounded border border-gray-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Corresponding Author & Co-Authors */}
          <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-navy pb-3 border-b border-gray-100">
              Authors & Affiliations
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-academic-muted font-medium block">Corresponding Author</span>
                <span className="font-bold text-navy text-sm">{manuscript.authorName}</span>
              </div>
              <div>
                <span className="text-academic-muted font-medium block">Email Address</span>
                <a href={`mailto:${manuscript.authorEmail}`} className="text-royal hover:underline font-medium">
                  {manuscript.authorEmail}
                </a>
              </div>
              <div>
                <span className="text-academic-muted font-medium block">Institution</span>
                <span className="font-medium text-navy">{manuscript.institution}</span>
              </div>
              <div>
                <span className="text-academic-muted font-medium block">Country / Dept</span>
                <span className="font-medium text-navy">
                  {manuscript.country} {manuscript.department ? `(${manuscript.department})` : ""}
                </span>
              </div>
            </div>

            {manuscript.coAuthors && manuscript.coAuthors.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <span className="text-xs text-academic-muted font-medium block mb-2">Co-Authors</span>
                <div className="space-y-1.5">
                  {manuscript.coAuthors.map((ca: any, i: number) => (
                    <div key={i} className="text-xs bg-academic-bg p-2.5 rounded border border-gray-200 flex justify-between">
                      <span className="font-bold text-navy">{ca.name}</span>
                      <span className="text-academic-muted">{ca.affiliation || "No affiliation specified"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PDF Viewer / Download Card */}
          <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-royal" />
                <h3 className="font-serif font-bold text-lg text-navy">
                  Manuscript PDF File
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  href={`/api/submissions/${manuscript._id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                  className="space-x-1.5 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </Button>

                <Button
                  href={`/api/submissions/${manuscript._id}/pdf?download=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="teal"
                  size="sm"
                  className="space-x-1.5 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>

            <div className="text-xs text-academic-muted flex items-center justify-between">
              <span>File: <strong>{manuscript.pdfFile?.originalName || "manuscript.pdf"}</strong></span>
              <span>Size: <strong>{((manuscript.pdfFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB</strong></span>
            </div>

            {/* Embedded PDF iframe preview */}
            <div className="border border-academic-border rounded-lg overflow-hidden bg-gray-100 h-96">
              <iframe
                src={`/api/submissions/${manuscript._id}/pdf`}
                className="w-full h-full"
                title="Manuscript PDF Preview"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Control Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
              Editorial Decisions
            </h3>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-academic-text mb-1">
                Review Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
              >
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="revision_requested">Revision Requested</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Payment Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-academic-text mb-1">
                APC Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid (Confirmed)</option>
                <option value="waived">Waived</option>
                <option value="not_required">Not Required</option>
              </select>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-semibold text-academic-text mb-1">
                Internal Editorial Notes
              </label>
              <Textarea
                rows={5}
                placeholder="Internal notes regarding reviewer remarks, revision deadlines, or fee adjustments..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="text-xs"
              />
              <span className="text-[10px] text-academic-muted block mt-1">
                Notes are confidential and never shown to authors or the public.
              </span>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              variant="royal"
              className="w-full space-x-2 shadow-sm font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Editorial Decision</span>
                </>
              )}
            </Button>
          </div>

          {/* Quick Publish Helper Box */}
          {status === "accepted" && (
            <div className="bg-teal/10 border border-teal/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-teal-dark font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-teal" />
                <span>Ready for Publication!</span>
              </div>
              <p className="text-xs text-academic-text leading-relaxed">
                This manuscript has been accepted. You can convert it directly into an article, assign it to a volume and issue, and publish it on the public site.
              </p>
              <Button
                href={`/admin/articles/new?sourceManuscriptId=${manuscript._id}`}
                variant="teal"
                size="sm"
                className="w-full font-semibold"
              >
                Publish Article Now →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
