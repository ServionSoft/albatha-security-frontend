"use client";

import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <div className="text-xs text-[var(--text-secondary)]">
        Page <strong className="text-[var(--text)]">{page}</strong> of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={prevDisabled}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "h-10 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-sm font-semibold",
            prevDisabled && "opacity-50 pointer-events-none",
          )}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={nextDisabled}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "h-10 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 text-sm font-semibold text-white",
            nextDisabled && "opacity-50 pointer-events-none",
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}

