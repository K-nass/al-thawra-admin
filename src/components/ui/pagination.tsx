import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  itemsFrom?: number;
  itemsTo?: number;
  totalCount?: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function Pagination({
  pageNumber,
  totalPages,
  itemsFrom,
  itemsTo,
  totalCount,
  onPageChange,
  className = ""
}: PaginationProps) {
  const { t } = useTranslation();

  return (
    <div className={`mt-4 flex items-center justify-between ${className}`}>
      {/* Items Count Summary */}
      <div className="text-sm text-slate-500 font-medium hidden sm:block">
        {totalCount !== undefined ? (
          <>
            {itemsFrom}–{itemsTo} <span className="mx-1 text-slate-300">/</span> {totalCount}
          </>
        ) : null}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-1 sm:flex-none justify-between sm:justify-start items-center space-x-2 rtl:space-x-reverse">
        <button
          onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
          disabled={pageNumber <= 1}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-surface-muted hover:bg-slate-200 text-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          <span className="hidden sm:inline">{t("roles.previous", "Previous")}</span>
        </button>
        
        <span className="text-sm font-medium text-slate-700 min-w-[3rem] text-center">
          {pageNumber} <span className="mx-0.5 text-slate-400">/</span> {Math.max(1, totalPages)}
        </span>
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
          disabled={pageNumber >= totalPages}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-surface-muted hover:bg-slate-200 text-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="hidden sm:inline">{t("roles.next", "Next")}</span>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
