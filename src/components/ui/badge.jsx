import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-heading font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // PureTask Design System Semantic Variants
        success:
          "border-transparent bg-success text-white shadow hover:bg-success/90",
        system:
          "border-transparent bg-system text-white shadow hover:bg-system/90",
        warning:
          "border-transparent bg-warning text-white shadow hover:bg-warning/90",
        error:
          "border-transparent bg-error text-white shadow hover:bg-error/90",
        info:
          "border-transparent bg-info text-white shadow hover:bg-info/90",
        // Soft variants (light backgrounds)
        successSoft:
          "border-success-border bg-success-soft text-success-text hover:bg-success-soft/80",
        systemSoft:
          "border-system-border bg-system-soft text-system-text hover:bg-system-soft/80",
        warningSoft:
          "border-warning-border bg-warning-soft text-warning-text hover:bg-warning-soft/80",
        errorSoft:
          "border-error-border bg-error-soft text-error-text hover:bg-error-soft/80",
        infoSoft:
          "border-info-border bg-info-soft text-info-text hover:bg-info-soft/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
