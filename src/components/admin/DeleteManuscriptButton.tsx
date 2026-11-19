"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getApiResponseError, getErrorMessage } from "@/lib/utils";

interface DeleteManuscriptButtonProps {
  id: string;
  submissionId: string;
}

export function DeleteManuscriptButton({ id, submissionId }: DeleteManuscriptButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !window.confirm(
        `Are you sure you want to permanently delete submission ${submissionId}? This will remove all author details, files, and any linked published article from the public archives.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to delete submission");
        throw new Error(errorMsg);
      }

      toast.success(`Manuscript ${submissionId} deleted successfully!`);
      router.refresh();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete manuscript"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={deleting}
      onClick={handleDelete}
      title={`Delete ${submissionId}`}
      className="h-8 w-8 p-0 text-academic-muted hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
    >
      {deleting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}
