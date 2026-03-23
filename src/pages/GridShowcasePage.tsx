import * as Tabs from '@radix-ui/react-tabs';
import { useMemo } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';

import { GRID_IMPLEMENTATIONS } from '@/grids';
import { GridToolbar } from '@/features/grid-showcase/components/GridToolbar';
import { PaginationControls } from '@/features/grid-showcase/components/PaginationControls';
import { useGridData } from '@/shared/state/gridStore';

const downloadTextAsFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const GridShowcasePage = () => {
  const {
    model,
    pagedRows,
    pageIndex,
    pageSize,
    totalPages,
    totalRows,
    rowTarget,
    isRecalculating,
    actions,
  } = useGridData();

  const params = useParams({ from: '/$grid' });
  const navigate = useNavigate();
  const activeTab = useMemo(() => {
    const id = (params as any)?.grid as string | undefined;
    const exists = GRID_IMPLEMENTATIONS.some((g) => g.id === id);
    return exists ? (id as string) : GRID_IMPLEMENTATIONS[0]?.id ?? 'glide';
  }, [params]);

  const rangeLabel = useMemo(() => {
    if (totalRows === 0) {
      return 'Rows 0-0 of 0';
    }
    const start = pageIndex * pageSize + 1;
    const end = start + pagedRows.length - 1;
    return `Rows ${start}-${end} of ${model.rowOrder.length}`;
  }, [model.rowOrder.length, pageIndex, pagedRows.length, pageSize, totalRows]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
          Multi-grid PoC
        </p>
        <h1 className="text-4xl font-bold text-slate-900">Canvas spreadsheet adapters</h1>
      </header>

      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {model.columns.map((column) => (
          <div
            key={column.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-panel"
          >
            <div>
              <p className="font-semibold text-slate-900">{column.title}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{column.type}</p>
            </div>
            {column.defaultFormula && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                {column.defaultFormula}
              </span>
            )}
          </div>
        ))}
      </div>

      <GridToolbar
        rowTarget={rowTarget}
        isRecalculating={isRecalculating}
        onRowCountSubmit={actions.regenerate}
        onExportCsv={() => downloadTextAsFile(actions.buildCsv(), 'grid-data.csv')}
        onApplyStyle={(color) => actions.applyStyle({ background: color })}
      />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-25 p-4 shadow-panel">
        <Tabs.Root
          value={activeTab}
          onValueChange={(val) => navigate({ to: '/$grid', params: { grid: val } })}
        >
          <Tabs.List className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
            {GRID_IMPLEMENTATIONS.map((impl) => (
              <Tabs.Trigger
                key={impl.id}
                value={impl.id}
                disabled={impl.status === 'planned'}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === impl.id
                    ? 'bg-brand-500 text-white shadow'
                    : 'bg-white text-slate-600 hover:bg-brand-50 hover:text-brand-600'
                } ${impl.status === 'planned' ? 'opacity-50' : ''}`}
              >
                {impl.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {GRID_IMPLEMENTATIONS.map((impl) => (
            <Tabs.Content key={impl.id} value={impl.id} className="mt-4">
              <p className="mb-3 text-sm text-slate-500">{impl.description}</p>
              <impl.component />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>

      <PaginationControls
        pageIndex={pageIndex}
        totalPages={totalPages}
        totalRows={totalRows}
        pageSize={pageSize}
        onPageSizeChange={actions.setPageSize}
        onPrev={() => actions.setPageIndex(Math.max(0, pageIndex - 1))}
        onNext={() => actions.setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
        pageRangeLabel={rangeLabel}
      />
    </div>
  );
};
