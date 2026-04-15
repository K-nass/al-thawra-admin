import React from "react";

type BadgeVariant = "default" | "success" | "error" | "warning" | "info" | "primary";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-success-background text-success-hover";
      case "error":
        return "bg-error-background text-error-hover";
      case "warning":
        return "bg-warning-background text-warning-hover";
      case "primary":
        return "bg-primary/10 text-primary";
      case "info":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${getVariantStyles()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
