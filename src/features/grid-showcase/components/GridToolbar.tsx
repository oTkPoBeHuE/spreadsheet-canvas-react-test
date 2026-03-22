import * as Popover from '@radix-ui/react-popover';
import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

import { FileDown, Loader2, Palette, RefreshCw } from 'lucide-react';

type GridToolbarProps = {
  rowTarget: number;
  isRecalculating: boolean;
  onRowCountSubmit: (count: number) => void;
  onExportCsv: () => void;
  onApplyStyle: (color: string) => void;
};

const COLOR_SWATCHES = ['#fef3c7', '#e0f2fe', '#fae8ff', '#dcfce7', '#fee2e2'];

export const GridToolbar = ({
  rowTarget,
  isRecalculating,
  onRowCountSubmit,
  onExportCsv,
  onApplyStyle,
}: GridToolbarProps) => {
  const [value, setValue] = useState(String(rowTarget));
  const [debounced, setDebounced] = useState(value);

  useDebounce(() => setDebounced(value), 200, [value]);
  useEffect(() => {
    setValue(String(rowTarget));
    setDebounced(String(rowTarget));
  }, [rowTarget]);

  const parsed = Number(debounced);
  const canSubmit = Number.isInteger(parsed) && parsed >= 10 && parsed <= 20000;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) {
            onRowCountSubmit(parsed);
          }
        }}
      >
        <label className="text-sm font-medium text-slate-500" htmlFor="row-count">
          Rows to generate
        </label>
        <input
          id="row-count"
          type="number"
          min={10}
          max={20000}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          disabled={!canSubmit}
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </button>
        {isRecalculating && <Loader2 className="h-4 w-4 animate-spin text-brand-500" />}
      </form>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-500 hover:text-brand-600"
        >
          <FileDown className="h-4 w-4" />
          Export CSV
        </button>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-500 hover:text-brand-600"
            >
              <Palette className="h-4 w-4" />
              Cell style
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="rounded-xl border border-slate-200 bg-white p-3 shadow-panel" sideOffset={8}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Highlight cell
              </p>
              <div className="mt-2 flex gap-2">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-8 w-8 rounded-lg border border-slate-200"
                    style={{ backgroundColor: color }}
                    onClick={() => onApplyStyle(color)}
                  />
                ))}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
};
