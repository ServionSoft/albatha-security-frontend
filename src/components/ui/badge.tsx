import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = {
  variant?: "default" | "success" | "danger" | "muted";
  className?: string;
  children: React.ReactNode;
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  const tone =
    variant === "success"
      ? "bg-[#E8F1EB] text-[var(--success)] border border-[#E0EEE6]"
      : variant === "danger"
        ? "bg-[#F6E8EA] text-[var(--danger)] border border-[#F0D1D7]"
        : variant === "muted"
          ? "bg-[var(--cream-muted)] text-[var(--text-secondary)] border border-[var(--border)]"
      : "bg-[#F4E8EE] text-[var(--primary)] border border-[#E4D1DB]";

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", tone, className)}>
      {children}
    </span>
  );
}

