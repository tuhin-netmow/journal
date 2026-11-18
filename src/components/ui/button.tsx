import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-navy text-white hover:bg-navy-light shadow-sm",
        royal: "bg-royal text-white hover:bg-royal-dark shadow-sm",
        teal: "bg-teal text-white hover:bg-teal-dark shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline:
          "border border-academic-border bg-white hover:bg-academic-bg text-academic-text hover:text-navy shadow-xs",
        secondary: "bg-academic-bg text-academic-text hover:bg-gray-200",
        ghost: "hover:bg-academic-bg text-academic-text hover:text-navy",
        link: "text-royal underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, href, target, rel, children, ...props }, ref) => {
    const computedClass = cn(buttonVariants({ variant, size, className }));

    if (href) {
      const isMailOrTel = href.startsWith("mailto:") || href.startsWith("tel:");
      const isExternal = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");

      if (isMailOrTel) {
        return (
          <a href={href} className={computedClass}>
            {children}
          </a>
        );
      }

      if (isExternal) {
        return (
          <a
            href={href}
            target={target || "_blank"}
            rel={rel || "noopener noreferrer"}
            className={computedClass}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} target={target} rel={rel} className={computedClass}>
          {children}
        </Link>
      );
    }

    return (
      <button
        className={computedClass}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
