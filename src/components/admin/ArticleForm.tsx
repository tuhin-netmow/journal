"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

interface ArticleFormProps {
  initialData?: any;
  volumes: any[];
  issues: any[];
  isEdit?: boolean;
}

export function ArticleForm({
  initialData = {},
  volumes = [],
  issues = [],
  isEdit = false,
}: ArticleFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [authors, setAuthors] = useState<Array<{ name: string; affiliation: string }>>(
    initialData.authors?.length
      ? initialData.authors
      : [{ name: "", affiliation: "" }]
  );
  const [abstract, setAbstract] = useState(initialData.abstract || "");
  const [keywords, setKeywords] = useState(
    Array.isArray(initialData.keywords) ? initialData.keywords.join(", ") : initialData.keywords || ""
  );
  const [category, setCategory] = useState(initialData.category || "Computer Science & AI");
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

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter issues by currently selected volume
  const availableIssues = issues.filter(
    (iss) => (iss.volume?._id?.toString() || iss.volume?.toString()) === volumeId
  );

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
    setAuthors([...authors, { name: "", affiliation: "" }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index: number, field: "name" | "affiliation", val: string) => {
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
      formData.append("keywords", keywords);
      formData.append("category", category);
      formData.append("volume", volumeId);
      formData.append("issue", issueId);
      formData.append("doi", doi);
      formData.append("status", status);
      formData.append("publicationDate", publicationDate);
      if (sourceManuscript) {
        formData.append("sourceManuscript", sourceManuscript);
      }

      const url = isEdit ? `/api/articles/${initialData._id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save article");
      }

      setSuccess(`Article ${isEdit ? "updated" : "created"} successfully!`);
      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
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
        const data = await res.json();
        throw new Error(data.error || "Failed to delete article");
      }

      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
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
            <Link
              href={`/articles/${initialData.slug}`}
              target="_blank"
              className="text-xs text-royal hover:underline flex items-center space-x-1"
            >
              <span>View Live</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
            >
              <option value="Computer Science & AI">Computer Science & AI</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Materials Science">Materials Science</option>
              <option value="Biomedical Sciences">Biomedical Sciences</option>
              <option value="Environmental Sciences">Environmental Sciences</option>
              <option value="Applied Physics">Applied Physics</option>
              <option value="Robotics & Automation">Robotics & Automation</option>
              <option value="General Science">General Science</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1">
              Keywords (Comma separated) *
            </label>
            <Input
              required
              placeholder="e.g. Perovskites, Solar Cells, Materials"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Authors Card */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="font-serif font-bold text-lg text-navy">
            Authors & Affiliations *
          </h3>
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

        <div className="space-y-3">
          {authors.map((auth, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-academic-bg rounded-lg border border-gray-200"
            >
              <Input
                required
                placeholder="Author Name"
                value={auth.name}
                onChange={(e) => updateAuthor(index, "name", e.target.value)}
                className="sm:w-1/2"
              />
              <Input
                placeholder="Institutional Affiliation"
                value={auth.affiliation}
                onChange={(e) => updateAuthor(index, "affiliation", e.target.value)}
                className="sm:w-1/2"
              />
              {authors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAuthor(index)}
                  className="text-rose-600 hover:text-rose-800 p-2"
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
