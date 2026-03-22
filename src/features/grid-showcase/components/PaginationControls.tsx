import { ArrowLeft, ArrowRight } from 'lucide-react';

import type { PageSizeOption } from '@/shared/types/grid';

type PaginationControlsProps = {
  pageIndex: number;
  totalPages: number;
  totalRows: number;
  pageSize: PageSizeOption;
  onPageSizeChange: (size: PageSizeOption) => void;
  onPrev: () => void;
  onNext: () => void;
  pageRangeLabel: string;
};

const PAGE_SIZES: PageSizeOption[] = [10, 25, 50];

export const PaginationControls = ({
  pageIndex,
  totalPages,
  totalRows,
  pageSize,
  onPageSizeChange,
  onPrev,
  onNext,
  pageRangeLabel,
}: PaginationControlsProps) => (
  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-panel">
    <div>
      <p className="text-sm font-semibold text-slate-700">{pageRangeLabel}</p>
      <p className="text-xs text-slate-500">{totalRows} visible rows</p>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Rows per page
        </span>
        <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
          {PAGE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onPageSizeChange(size)}
              className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                size === pageSize ? 'bg-white text-brand-600 shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={pageIndex === 0}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-slate-600">
          Page {pageIndex + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={pageIndex >= totalPages - 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
);
