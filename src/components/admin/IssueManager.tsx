"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Plus, Edit, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate, getApiResponseError, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface IssueManagerProps {
  initialIssues: any[];
  volumes: any[];
  selectedVolumeId?: string;
}

export function IssueManager({ initialIssues, volumes, selectedVolumeId = "all" }: IssueManagerProps) {
  const router = useRouter();

  const [issues, setIssues] = useState(initialIssues);
  const [filterVolume, setFilterVolume] = useState(selectedVolumeId);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [issueNumber, setIssueNumber] = useState("1");
  const [volumeId, setVolumeId] = useState(volumes[0]?._id?.toString() || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publicationDate, setPublicationDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"draft" | "published">("published");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredIssues = issues.filter((iss) => {
    if (filterVolume === "all") return true;
    return (iss.volume?._id?.toString() || iss.volume?.toString()) === filterVolume;
  });

  const openCreate = () => {
    setEditingId(null);
    setIssueNumber("1");
    setVolumeId(volumes[0]?._id?.toString() || "");
    setTitle(`Volume ${volumes[0]?.volumeNumber || 1}, Issue 1`);
    setDescription("");
    setPublicationDate(new Date().toISOString().slice(0, 10));
    setStatus("published");
    setError(null);
    setShowModal(true);
  };

  const openEdit = (iss: any) => {
    setEditingId(iss._id.toString());
    setIssueNumber(iss.issueNumber.toString());
    setVolumeId(iss.volume?._id?.toString() || iss.volume?.toString());
    setTitle(iss.title);
    setDescription(iss.description || "");
    setPublicationDate(iss.publicationDate ? new Date(iss.publicationDate).toISOString().slice(0, 10) : "");
    setStatus(iss.status);
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = "/api/issues";
      const method = editingId ? "PUT" : "POST";
      const body = {
        ...(editingId ? { id: editingId } : {}),
        issueNumber: Number(issueNumber),
        volume: volumeId,
        title,
        description,
        publicationDate,
        status,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to save issue");
        throw new Error(errorMsg);
      }

      setShowModal(false);
      toast.success(editingId ? "Issue updated successfully!" : "Issue created successfully!");
      router.refresh();

      // Reload issues
      const refreshRes = await fetch("/api/issues");
      const refreshData = await refreshRes.json();
      if (refreshData.issues) setIssues(refreshData.issues);
    } catch (err: any) {
      const errMsg = getErrorMessage(err, "Failed to save issue.");
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (iss: any) => {
    const newStatus = iss.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/issues", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: iss._id.toString(),
          status: newStatus,
        }),
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to toggle status");
        throw new Error(errorMsg);
      }

      setIssues(
        issues.map((i) =>
          i._id.toString() === iss._id.toString() ? { ...i, status: newStatus } : i
        )
      );
      toast.success(`Issue status changed to ${newStatus}.`);
      router.refresh();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to toggle status"));
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (!window.confirm(`Are you sure you want to delete ${titleStr}?`)) return;

    try {
      const res = await fetch(`/api/issues?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to delete issue");
        throw new Error(errorMsg);
      }

      setIssues(issues.filter((i) => i._id.toString() !== id));
      toast.success(`Deleted ${titleStr} successfully!`);
      router.refresh();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete issue"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Issue Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
            Issue Management
          </h1>
          <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
            Manage, publish, and schedule periodic journal issues within their designated volumes.
          </p>
        </div>

        <Button onClick={openCreate} variant="teal" size="sm" className="space-x-1.5 shadow-sm font-semibold">
          <Plus className="w-4 h-4" />
          <span>Create New Issue</span>
        </Button>
      </div>

      {/* Filter by Volume */}
      <div className="bg-white p-4 rounded-xl border border-academic-border shadow-sm flex items-center space-x-3 text-xs">
        <span className="font-semibold text-navy">Filter by Volume:</span>
        <select
          value={filterVolume}
          onChange={(e) => setFilterVolume(e.target.value)}
          className="h-9 rounded-md border border-academic-border bg-white px-3 py-1 text-xs text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
        >
          <option value="all">All Volumes</option>
          {volumes.map((v) => (
            <option key={v._id.toString()} value={v._id.toString()}>
              Volume {v.volumeNumber} ({v.year})
            </option>
          ))}
        </select>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl border border-academic-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-academic-bg text-navy uppercase tracking-wider font-semibold border-b border-academic-border">
              <tr>
                <th className="py-3 px-4">Issue Details</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Issue No.</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Publication Date</th>
                <th className="py-3 px-4">Articles</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-academic-muted">
                    No issues found for the selected volume.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((iss) => (
                  <tr key={iss._id.toString()} className="hover:bg-academic-bg/50 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-serif font-bold text-navy text-sm">{iss.title}</div>
                      {iss.description && (
                        <div className="text-[11px] text-academic-muted truncate max-w-xs mt-0.5">
                          {iss.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-royal">
                      Volume {iss.volume?.volumeNumber || "–"} ({iss.volume?.year || "–"})
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-navy">
                      #{iss.issueNumber}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={iss.status} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-academic-muted">
                      {formatDate(iss.publicationDate)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-navy">
                      <Link
                        href={`/admin/articles?issue=${iss._id.toString()}`}
                        className="text-royal hover:underline font-bold"
                      >
                        {iss.articleCount || 0} articles
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStatus(iss)}
                          title={iss.status === "published" ? "Unpublish issue" : "Publish issue"}
                          className="h-8 px-2 text-xs"
                        >
                          {iss.status === "published" ? (
                            <span className="flex items-center space-x-1 text-amber-600">
                              <EyeOff className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Unpublish</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-teal">
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Publish</span>
                            </span>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(iss)}
                          className="h-8 px-2 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(iss._id.toString(), iss.title)}
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-academic-border max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-navy">
              {editingId ? "Edit Issue" : "Create New Issue"}
            </h3>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-academic-text mb-1">
                  Assign to Volume *
                </label>
                <select
                  required
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-academic-text mb-1">
                    Issue Number *
                  </label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={issueNumber}
                    onChange={(e) => setIssueNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-academic-text mb-1">
                    Publication Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal font-bold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-academic-text mb-1">
                  Issue Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Volume 4, Issue 2 (Fall 2026)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-academic-text mb-1">
                  Publication Date
                </label>
                <Input
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-academic-text mb-1">
                  Description (Optional)
                </label>
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Editorial theme or special focus..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" disabled={loading}>
                  {loading ? "Saving..." : editingId ? "Update Issue" : "Create Issue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
