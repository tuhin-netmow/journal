"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Trash2,
  Plus,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Mail,
  X,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toast } from "sonner";
import { slugify, getApiResponseError, getErrorMessage } from "@/lib/utils";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

interface ArticleFormProps {
  initialData?: any;
  volumes: any[];
  issues: any[];
  isEdit?: boolean;
  categories?: string[];
}

export function ArticleForm({
  initialData = {},
  volumes = [],
  issues = [],
  isEdit = false,
  categories,
}: ArticleFormProps) {
  const router = useRouter();

  const availableCategories =
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [authors, setAuthors] = useState<Array<{ name: string; affiliation: string; email?: string }>>(
    initialData.authors?.length
      ? initialData.authors
      : [{ name: "", affiliation: "", email: "" }]
  );
  const [abstract, setAbstract] = useState(initialData.abstract || "");

  // Keywords state with Enter key & badge management
  const parseInitialKeywords = (): string[] => {
    if (Array.isArray(initialData.keywords)) {
      return initialData.keywords.map((k: any) => String(k).trim()).filter(Boolean);
    }
    if (typeof initialData.keywords === "string" && initialData.keywords.trim()) {
      return initialData.keywords.split(",").map((k: string) => k.trim()).filter(Boolean);
    }
    return [];
  };

  const [keywordsList, setKeywordsList] = useState<string[]>(parseInitialKeywords);
  const [keywordInput, setKeywordInput] = useState("");

  const addKeyword = (valueToAdd?: string) => {
    const raw = valueToAdd !== undefined ? valueToAdd : keywordInput;
    const trimmed = raw.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    const parts = trimmed.split(",").map((k) => k.trim()).filter(Boolean);
    const updated = [...keywordsList];
    for (const p of parts) {
      if (!updated.some((existing) => existing.toLowerCase() === p.toLowerCase())) {
        updated.push(p);
      }
    }
    setKeywordsList(updated);
    setKeywordInput("");
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const removeKeyword = (idx: number) => {
    setKeywordsList(keywordsList.filter((_, i) => i !== idx));
  };

  const [category, setCategory] = useState(
    initialData.category || availableCategories[0] || "General Science"
  );
  const [volumeId, setVolumeId] = useState(
    initialData.volume?._id?.toString() || initialData.volume?.toString() || (volumes[0]?._id?.toString() || "")
  );
  const [issueId, setIssueId] = useState(
    initialData.issue?._id?.toString() || initialData.issue?.toString() || ""
  );
  const [doi, setDoi] = useState(initialData.doi || "");
  const [status, setStatus] = useState<"draft" | "published">(initialData.status || "published");
  const [publicationDate, setPublicationDate] = useState(
    initialData.publicationDate ? new Date(initialData.publicationDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sourceManuscript] = useState(initialData.sourceManuscript || "");
  const [notifyAuthors, setNotifyAuthors] = useState(true);
  const [sendingNotice, setSendingNotice] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter issues by currently selected volume
  const availableIssues = useMemo(() => {
    return issues.filter(
      (iss) => (iss.volume?._id?.toString() || iss.volume?.toString()) === volumeId
    );
  }, [issues, volumeId]);

  // Auto-select issue when volume changes if current issue is not in volume
  useEffect(() => {
    if (availableIssues.length > 0) {
      const match = availableIssues.find((i) => i._id.toString() === issueId);
      if (!match) {
        setIssueId(availableIssues[0]._id.toString());
      }
    } else {
      setIssueId("");
    }
  }, [volumeId, availableIssues, issueId]);

  // Handle title change & auto-generate slug if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && (!slug || slug === slugify(title))) {
      setSlug(slugify(val));
    }
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: "", affiliation: "", email: "" }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, field: "name" | "affiliation" | "email", val: string) => {
    const updated = [...authors];
    updated[index][field] = val;
    setAuthors(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!volumeId || !issueId) {
      setError("Please select both a Volume and an Issue for the article.");
      return;
    }

    const validAuthors = authors.filter((a) => a.name.trim() !== "");
    if (validAuthors.length === 0) {
      setError("At least one author name is required.");
      return;
    }

    // Collect final keywords
    const finalKeywords = [...keywordsList];
    if (keywordInput.trim()) {
      const parts = keywordInput.trim().split(",").map((k) => k.trim()).filter(Boolean);
      for (const p of parts) {
        if (!finalKeywords.some((existing) => existing.toLowerCase() === p.toLowerCase())) {
          finalKeywords.push(p);
        }
      }
      setKeywordsList(finalKeywords);
      setKeywordInput("");
    }

    if (finalKeywords.length === 0) {
      const msg = "Please enter at least one keyword (press Enter to add).";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (pdfFile) {
        formData.append("pdfFile", pdfFile);
      }
      formData.append("title", title);
      formData.append("slug", slugify(slug || title));
      formData.append("authors", JSON.stringify(validAuthors));
      formData.append("abstract", abstract);
      formData.append("keywords", JSON.stringify(finalKeywords));
      formData.append("category", category);
      formData.append("volume", volumeId);
      formData.append("issue", issueId);
      formData.append("doi", doi);
      formData.append("status", status);
      formData.append("publicationDate", publicationDate);
      formData.append("notifyAuthors", String(notifyAuthors));
      if (sourceManuscript) {
        formData.append("sourceManuscript", sourceManuscript);
      }

      const url = isEdit ? `/api/articles/${initialData._id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to save article");
        throw new Error(errorMsg);
      }

      const data = await res.json();

      const successMsg = `Article ${isEdit ? "updated" : "created"} successfully!`;
      setSuccess(successMsg);

      if (data.emailDispatched) {
        toast.success(`Article saved & publication notice emailed to: ${data.emailRecipients?.join(", ") || "authors"}!`);
      } else if (status === "published" && (!data.emailRecipients || data.emailRecipients.length === 0)) {
        toast.success(successMsg);
        toast.info("Notice: No author email on file. Add author email to send automated publication letters.", {
          duration: 5000,
        });
      } else {
        toast.success(successMsg);
      }

      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      const errMsg = getErrorMessage(err, "An unexpected error occurred while saving the article.");
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPublicationNotice = async () => {
    if (!initialData._id) return;
    setSendingNotice(true);
    try {
      const res = await fetch(`/api/articles/${initialData._id}/notify`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to send publication email");
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (data.recipients && data.recipients.length > 0) {
        toast.success(`Publication email dispatched to: ${data.recipients.join(", ")}`);
      } else {
        toast.info(data.message || "Publication notice sent to editorial office (no author email on file)");
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Email dispatch failed"));
    } finally {
      setSendingNotice(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this article?")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/articles/${initialData._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to delete article");
        throw new Error(errorMsg);
      }

      toast.success("Article deleted successfully!");
      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete article"));
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/articles"
            className="inline-flex items-center space-x-1.5 text-xs text-royal hover:underline font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>
          <h1 className="font-serif font-black text-2xl text-navy">
            {isEdit ? "Edit Article" : "Create New Article"}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {isEdit && initialData.status === "published" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendPublicationNotice}
                disabled={sendingNotice}
                className="space-x-1.5 font-semibold text-teal border-teal/40 hover:bg-teal/10"
                title="Send or resend official publication announcement email to authors"
              >
                {sendingNotice ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span>Send Publication Email</span>
              </Button>

              <Link
                href={`/articles/${initialData.slug}`}
                target="_blank"
                className="text-xs text-royal hover:underline flex items-center space-x-1"
              >
                <span>View Live</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </>
          )}

          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          )}

          <Button
            type="submit"
            variant="teal"
            size="sm"
            disabled={loading}
            className="space-x-1.5 shadow-sm font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? "Update Article" : "Save & Publish"}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center space-x-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Metadata Card */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5">
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
          Article Identification
        </h3>

        <div>
          <label className="block text-xs font-semibold text-academic-text mb-1">
            Article Title *
          </label>
          <Input
            required
            placeholder="Complete Scholarly Title of the Article"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              URL Slug *
            </label>
            <Input
              required
              placeholder="e.g. self-supervised-learning-diagnostics"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
            />
            <span className="text-[10px] text-academic-muted mt-1 block">
              Public URL: /articles/{slug || "slug-placeholder"}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Digital Object Identifier (DOI) - Optional
            </label>
            <Input
              placeholder="10.1007/s11263-026-0001-x"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-academic-text mb-1">
            Abstract *
          </label>
          <Textarea
            required
            rows={6}
            placeholder="Detailed academic abstract..."
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Research Category *
            </label>
            <SearchableSelect
              value={category}
              onChange={setCategory}
              options={availableCategories}
              placeholder="Select research category..."
              searchPlaceholder="Search or type research category..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-academic-text">
                Keywords *
              </label>
              <span className="text-[10px] text-academic-muted">
                Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-navy">Enter</kbd> or comma
              </span>
            </div>

            {/* Keyword tag badges */}
            {keywordsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2 p-2 bg-academic-bg border border-academic-border rounded-lg">
                {keywordsList.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-white border border-royal/30 text-royal text-xs font-medium shadow-xs"
                  >
                    <Tag className="w-3 h-3 text-royal/60" />
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(idx)}
                      className="text-academic-muted hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                      title="Remove keyword"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="e.g. Deep Learning, AI (press Enter to add)"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addKeyword()}
                className="shrink-0 text-xs font-semibold border-academic-border hover:bg-royal hover:text-white transition-colors"
              >
                + Add
              </Button>
            </div>
            <p className="text-[10px] text-academic-muted mt-1">
              Add at least one keyword. Press Enter or type commas to add multiple tags.
            </p>
          </div>
        </div>
      </div>

      {/* Authors Card */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h3 className="font-serif font-bold text-lg text-navy">
              Authors & Affiliations *
            </h3>
            <p className="text-xs text-academic-muted">
              Add all contributing authors. Provide email addresses so authors receive automated publication announcements.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAuthor}
            className="space-x-1.5 text-xs text-royal border-royal/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Author</span>
          </Button>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/60 rounded-lg p-3 text-xs text-navy flex items-start space-x-2">
          <Mail className="w-4 h-4 text-royal shrink-0 mt-0.5" />
          <span>
            <strong>Publication Email Notice:</strong> When an article is published, congratulations letters containing citation metadata and open access PDF download links are automatically dispatched to all authors with valid emails entered below.
          </span>
        </div>

        <div className="space-y-3">
          {authors.map((auth, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-academic-bg rounded-lg border border-gray-200"
            >
              <Input
                required
                placeholder={index === 0 ? "Primary Author Name *" : `Co-Author ${index + 1} Name *`}
                value={auth.name}
                onChange={(e) => updateAuthor(index, "name", e.target.value)}
                className="sm:w-1/3"
              />
              <Input
                placeholder="Institutional Affiliation"
                value={auth.affiliation}
                onChange={(e) => updateAuthor(index, "affiliation", e.target.value)}
                className="sm:w-1/3"
              />
              <Input
                type="email"
                placeholder={index === 0 ? "Primary Author Email (receives publication email) *" : "Author Email (receives notice)"}
                value={auth.email || ""}
                onChange={(e) => updateAuthor(index, "email", e.target.value)}
                className="sm:w-1/3"
              />
              {authors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAuthor(index)}
                  className="text-rose-600 hover:text-rose-800 p-2 cursor-pointer shrink-0"
                  title="Remove author"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Volume, Issue & Publication Status Card */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5">
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
          Volume, Issue & Publication Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Volume *
            </label>
            <select
              value={volumeId}
              onChange={(e) => setVolumeId(e.target.value)}
              className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
            >
              {volumes.map((v) => (
                <option key={v._id.toString()} value={v._id.toString()}>
                  Volume {v.volumeNumber} ({v.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Issue *
            </label>
            <select
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
            >
              {availableIssues.length === 0 ? (
                <option value="">No issues in this volume</option>
              ) : (
                availableIssues.map((i) => (
                  <option key={i._id.toString()} value={i._id.toString()}>
                    Issue {i.issueNumber} ({i.status})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Publication Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal font-bold text-royal"
            >
              <option value="published">Published (Visible Publicly)</option>
              <option value="draft">Draft (Private Admin Only)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Publication Date
            </label>
            <Input
              type="date"
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
            />
          </div>
        </div>

        {status === "published" && (
          <div className="bg-academic-bg p-3.5 rounded-lg border border-academic-border/70">
            <label className="flex items-center space-x-2 text-xs font-semibold text-academic-text cursor-pointer">
              <input
                type="checkbox"
                checked={notifyAuthors}
                onChange={(e) => setNotifyAuthors(e.target.checked)}
                className="rounded border-academic-border text-teal focus:ring-teal w-4 h-4"
              />
              <span>
                Dispatch celebratory publication announcement email to author(s) upon saving
              </span>
            </label>
            <p className="text-[11px] text-academic-muted ml-6 mt-0.5">
              Sends an official Open Access publication letter and download links to all authors with email addresses provided above.
            </p>
          </div>
        )}
      </div>

      {/* PDF Upload Card */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
          Article PDF File
        </h3>

        {initialData.pdfFile && (
          <div className="bg-academic-bg p-4 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-royal" />
              <span>
                Current PDF: <strong>{initialData.pdfFile.originalName}</strong> (
                {((initialData.pdfFile.size || 0) / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <a
              href={`/api/articles/${initialData._id}/pdf?download=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-royal hover:underline font-semibold"
            >
              Download
            </a>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-academic-text mb-1.5">
            {initialData.pdfFile ? "Upload Replacement PDF (Optional)" : "Upload Article PDF"}
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setPdfFile(e.target.files[0]);
              }
            }}
            className="block w-full text-xs text-academic-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-royal/10 file:text-royal hover:file:bg-royal/20"
          />
        </div>
      </div>
    </form>
  );
}
