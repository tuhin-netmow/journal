"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Plus, Edit, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface VolumeManagerProps {
  initialVolumes: any[];
}

export function VolumeManager({ initialVolumes }: VolumeManagerProps) {
  const router = useRouter();

  const [volumes, setVolumes] = useState(initialVolumes);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [volumeNumber, setVolumeNumber] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setVolumeNumber((volumes.length + 1).toString());
    setYear(new Date().getFullYear().toString());
    setDescription("");
    setError(null);
    setShowModal(true);
  };

  const openEdit = (vol: any) => {
    setEditingId(vol._id.toString());
    setVolumeNumber(vol.volumeNumber.toString());
    setYear(vol.year.toString());
    setDescription(vol.description || "");
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = "/api/volumes";
      const method = editingId ? "PUT" : "POST";
      const body = {
        ...(editingId ? { id: editingId } : {}),
        volumeNumber: Number(volumeNumber),
        year: Number(year),
        description,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save volume");
      }

      setShowModal(false);
      toast.success(editingId ? "Volume updated successfully!" : "Volume created successfully!");
      router.refresh();
      // Reload volumes
      const refreshRes = await fetch("/api/volumes");
      const refreshData = await refreshRes.json();
      if (refreshData.volumes) setVolumes(refreshData.volumes);
    } catch (err: any) {
      setError(err.message || "Failed to save volume.");
      toast.error(err.message || "Failed to save volume.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, volNum: number) => {
    if (!window.confirm(`Are you sure you want to delete Volume ${volNum}?`)) return;

    try {
      const res = await fetch(`/api/volumes?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete volume");
      }

      setVolumes(volumes.filter((v) => v._id.toString() !== id));
      toast.success(`Volume ${volNum} deleted successfully!`);
      router.refresh();
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
            Volume Management
          </h1>
          <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
            Organize journal publication years and multi-issue volume containers.
          </p>
        </div>

        <Button onClick={openCreate} variant="teal" size="sm" className="space-x-1.5 shadow-sm font-semibold">
          <Plus className="w-4 h-4" />
          <span>Add Volume</span>
        </Button>
      </div>

      {/* Volumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {volumes.map((vol) => (
          <div
            key={vol._id.toString()}
            className="bg-white rounded-xl border border-academic-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-serif font-black text-2xl text-navy">
                  Volume {vol.volumeNumber}
                </span>
                <span className="bg-royal/10 text-royal text-xs font-bold px-2.5 py-1 rounded">
                  {vol.year}
                </span>
              </div>

              <p className="text-xs text-academic-muted leading-relaxed line-clamp-3 mb-4">
                {vol.description || "No description provided for this volume."}
              </p>

              <div className="text-xs text-academic-text space-y-1 font-medium bg-academic-bg p-3 rounded-lg border border-gray-100 mb-4">
                <div>Issues in Volume: <strong>{vol.issues?.length || 0}</strong></div>
                <div>Published Articles: <strong>{vol.publishedArticleCount || 0}</strong></div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <Button
                href={`/admin/issues?volume=${vol._id.toString()}`}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Manage Issues
              </Button>

              <div className="flex items-center space-x-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(vol)} className="h-8 w-8 p-0 text-academic-muted hover:text-navy">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(vol._id.toString(), vol.volumeNumber)} className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-academic-border max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-navy">
              {editingId ? "Edit Volume" : "Create New Volume"}
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
                  Volume Number *
                </label>
                <Input
                  type="number"
                  required
                  min={1}
                  value={volumeNumber}
                  onChange={(e) => setVolumeNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-academic-text mb-1">
                  Year *
                </label>
                <Input
                  type="number"
                  required
                  min={1900}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
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
                  placeholder="Volume focus and thematic scope..."
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
                  {loading ? "Saving..." : editingId ? "Update Volume" : "Create Volume"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
