import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-navy text-white hover:bg-navy-light",
        royal: "border-transparent bg-royal/10 text-royal border-royal/20",
        teal: "border-transparent bg-teal/10 text-teal border-teal/20",
        success: "border-transparent bg-emerald-100 text-emerald-800 border-emerald-200",
        warning: "border-transparent bg-amber-100 text-amber-800 border-amber-200",
        destructive: "border-transparent bg-rose-100 text-rose-800 border-rose-200",
        secondary: "border-transparent bg-gray-100 text-gray-800",
        outline: "text-academic-text border-academic-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
