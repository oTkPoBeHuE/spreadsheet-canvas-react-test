import { useEffect, useMemo, useRef } from 'react';
import { Workbook } from '@fortune-sheet/react';

import '@fortune-sheet/react/dist/index.css';

import { GRID_COLUMNS } from '@/shared/data/columns';
import { compileFormula } from '@/shared/formula/compileFormula';
import { useGridData } from '@/shared/state/gridStore';
import type { ColumnId } from '@/shared/types/grid';

type FortuneCellValue = {
  v?: string | number | boolean | null;
  f?: string; // formula, starting with '='
  bg?: string; // background color
  fc?: string; // font color
};

type FortuneCellData = {
  r: number;
  c: number;
  v: FortuneCellValue;
};

export const FortuneSheetGridAdapter = () => {
  const { pagedRows } = useGridData();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sheetData = useMemo(() => {
    const celldata: FortuneCellData[] = [];
    const columnlen: Record<number, number> = {};

    GRID_COLUMNS.forEach((col, c) => {
      columnlen[c] = (col.width ?? 120) + 8;
    });

    pagedRows.forEach((row, r) => {
      GRID_COLUMNS.forEach((column, c) => {
        const cell = row.cells[column.id];
        const v: FortuneCellValue = {};
        if (cell?.formula) {
          const compiled = compileFormula(cell.formula, r);
          v.f = compiled.startsWith('=') ? compiled : `=${compiled}`;
        } else if (cell && cell.value !== undefined && cell.value !== null) {
          v.v = cell.value as string | number | boolean;
        } else {
          v.v = '';
        }
        if (cell?.style?.background) v.bg = cell.style.background;
        if (cell?.style?.color) v.fc = cell.style.color;

        // Преформатируем поле account с метками уровня (косметика для PoC)
        if ((column.id as ColumnId) === 'account' && typeof v.v === 'string') {
          const caret = row.childrenIds.length > 0 ? (row.isCollapsed ? '▸' : '▾') : '•';
          const level = row.kind === 'region' ? 'REG' : row.kind === 'segment' ? 'SEG' : 'ACC';
          v.v = `${caret} [${level}] ${v.v}`;
        }

        celldata.push({ r, c, v });
      });
    });

    return [
      {
        name: 'Sheet1',
        celldata,
        config: { columnlen },
      },
    ];
  }, [pagedRows]);

  useEffect(() => {
    // FortuneSheet управляет собственным DOM внутри контейнера
    return () => {
      // Чистка не требуется — React размонтирует Workbook
    };
  }, []);

  return (
    <div ref={containerRef} className="rounded-2xl border border-slate-200 bg-white p-2 shadow-panel">
      <div className="h-[520px] w-full overflow-hidden">
        <Workbook data={sheetData as any} allowEdit showToolbar={false} showFormulaBar={false} />
      </div>
    </div>
  );
};
