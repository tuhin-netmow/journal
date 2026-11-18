import React from "react";
import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types";

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  switch (status) {
    case "paid":
      return <Badge variant="success">Paid</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "waived":
      return <Badge variant="teal">Waived</Badge>;
    case "not_required":
      return <Badge variant="secondary">Not Required</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
