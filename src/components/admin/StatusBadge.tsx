import React from "react";
import { Badge } from "@/components/ui/badge";
import { ManuscriptStatus } from "@/types";

interface StatusBadgeProps {
  status: ManuscriptStatus | "draft" | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "submitted":
      return <Badge variant="royal">Submitted</Badge>;
    case "under_review":
      return <Badge variant="warning">Under Review</Badge>;
    case "revision_requested":
      return <Badge variant="warning" className="bg-orange-100 text-orange-800 border-orange-200">Revision Requested</Badge>;
    case "accepted":
      return <Badge variant="success">Accepted</Badge>;
    case "published":
      return <Badge variant="teal">Published</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
