"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Edit, Trash2, CheckCircle2, AlertCircle, User, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getApiResponseError, getErrorMessage } from "@/lib/utils";

interface EditorialBoardManagerProps {
  initialMembers: any[];
}

export function EditorialBoardManager({ initialMembers }: EditorialBoardManagerProps) {
  const router = useRouter();

  const [members, setMembers] = useState(initialMembers);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");
  const [role, setRole] = useState("Editorial Board Member");
  const [institution, setInstitution] = useState("");
  const [country, setCountry] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [displayOrder, setDisplayOrder] = useState("1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setAcademicTitle("");
    setRole("Editorial Board Member");
    setInstitution("");
    setCountry("");
    setSpecialization("");
    setDisplayOrder((members.length + 1).toString());
    setError(null);
    setShowModal(true);
  };

  const openEdit = (m: any) => {
    setEditingId(m._id.toString());
    setName(m.name);
    setAcademicTitle(m.academicTitle || "");
    setRole(m.role);
    setInstitution(m.institution);
    setCountry(m.country || "");
    setSpecialization(m.specialization || "");
    setDisplayOrder((m.displayOrder || 0).toString());
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = "/api/editorial-board";
      const method = editingId ? "PUT" : "POST";
      const body = {
        ...(editingId ? { id: editingId } : {}),
        name,
        academicTitle,
        role,
        institution,
        country,
        specialization,
        displayOrder: Number(displayOrder),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to save editorial member");
        throw new Error(errorMsg);
      }

      setShowModal(false);
      toast.success(editingId ? "Board member updated successfully!" : "Board member added successfully!");
      router.refresh();

      // Refresh members
      const refreshRes = await fetch("/api/editorial-board");
      const refreshData = await refreshRes.json();
      if (refreshData.members) setMembers(refreshData.members);
    } catch (err: any) {
      const errMsg = getErrorMessage(err, "Failed to save member.");
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the editorial board?`)) return;

    try {
      const res = await fetch(`/api/editorial-board?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to remove member");
        throw new Error(errorMsg);
      }

      setMembers(members.filter((m) => m._id.toString() !== id));
      toast.success(`Removed ${memberName} from editorial board.`);
      router.refresh();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to remove member"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
            Editorial Board Management
          </h1>
          <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
            Maintain the roster of editors, section chairs, and international advisory council members.
          </p>
        </div>

        <Button onClick={openCreate} variant="teal" size="sm" className="space-x-1.5 shadow-sm font-semibold">
          <Plus className="w-4 h-4" />
          <span>Add Board Member</span>
        </Button>
      </div>

      {/* Board Members Table */}
      <div className="bg-white rounded-xl border border-academic-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between text-xs text-academic-muted font-medium">
          <span>Total: <strong>{members.length}</strong> editorial members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-academic-bg text-navy uppercase tracking-wider font-semibold border-b border-academic-border">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Name & Title</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Institution & Country</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-academic-muted">
                    No board members found. Click &quot;Add Board Member&quot; to create one.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m._id.toString()} className="hover:bg-academic-bg/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-royal whitespace-nowrap">
                      #{m.displayOrder || 0}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-serif font-bold text-navy text-sm">{m.name}</div>
                      {m.academicTitle && (
                        <div className="text-[11px] text-academic-muted mt-0.5">{m.academicTitle}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="royal">{m.role}</Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-navy">{m.institution}</div>
                      {m.country && (
                        <div className="text-[11px] text-academic-muted">{m.country}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-academic-muted max-w-xs truncate">
                      {m.specialization || "–"}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(m)}
                          className="h-8 px-2 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(m._id.toString(), m.name)}
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
          <div className="bg-white rounded-xl border border-academic-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-navy">
              {editingId ? "Edit Editorial Member" : "Add Board Member"}
            </h3>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-academic-text mb-1">
                    Full Name *
                  </label>
                  <Input
                    required
                    placeholder="Prof. Eleanor Vance, Ph.D."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-academic-text mb-1">
                    Academic Title / Chair
                  </label>
                  <Input
                    placeholder="Chair Professor of AI"
                    value={academicTitle}
                    onChange={(e) => setAcademicTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-academic-text mb-1">
                    Editorial Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
                  >
                    <option value="Editor-in-Chief">Editor-in-Chief</option>
                    <option value="Managing Editor">Managing Editor</option>
                    <option value="Associate Editor">Associate Editor</option>
                    <option value="Editorial Board Member">Editorial Board Member</option>
                    <option value="Advisory Board Member">Advisory Board Member</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-academic-text mb-1">
                    Display Order (Sorting)
                  </label>
                  <Input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-academic-text mb-1">
                    Institution / University *
                  </label>
                  <Input
                    required
                    placeholder="Massachusetts Institute of Technology"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-academic-text mb-1">
                    Country
                  </label>
                  <Input
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-academic-text mb-1">
                  Research Specialization
                </label>
                <Input
                  placeholder="Neural Computation, Ethics, Deep Learning"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
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
                  {loading ? "Saving..." : editingId ? "Update Member" : "Save Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
