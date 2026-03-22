import { useCallback, useEffect, useRef } from 'react';

import * as GC from '@grapecity/spread-sheets';
import { SpreadSheets } from '@grapecity/spread-sheets-react';

import { GRID_COLUMNS } from '@/shared/data/columns';
import { compileFormula } from '@/shared/formula/compileFormula';
import { useGridData } from '@/shared/state/gridStore';
import type { ColumnId, GridModel, GridRow } from '@/shared/types/grid';

const caretForRow = (row: GridRow) => {
  if (row.childrenIds.length > 0) {
    return row.isCollapsed ? '▸' : '▾';
  }
  return '•';
};

const getLevelBadge = (row: GridRow) => {
  switch (row.kind) {
    case 'region':
      return 'REG';
    case 'segment':
      return 'SEG';
    default:
      return 'ACC';
  }
};

const buildIndent = (row: GridRow, model: GridModel) => {
  if (row.depth === 0) {
    return '';
  }

  const ancestors: GridRow[] = [];
  let current = row.parentId ? model.rows[row.parentId] : undefined;

  while (current) {
    ancestors.unshift(current);
    current = current.parentId ? model.rows[current.parentId] : undefined;
  }

  const segments: string[] = [];
  ancestors.forEach((ancestor, index) => {
    const siblings = ancestor.parentId ? model.rows[ancestor.parentId]?.childrenIds ?? [] : model.rootIds;
    const ancestorIndex = siblings.indexOf(ancestor.id);
    const ancestorHasNext = ancestorIndex !== -1 && ancestorIndex < siblings.length - 1;
    const isLastAncestor = index === ancestors.length - 1;

    if (isLastAncestor) {
      const hasNextSibling = (() => {
        const parent = row.parentId ? model.rows[row.parentId] : undefined;
        if (!parent) return false;
        const selfIndex = parent.childrenIds.indexOf(row.id);
        return selfIndex !== -1 && selfIndex < parent.childrenIds.length - 1;
      })();
      segments.push(hasNextSibling ? '├── ' : '└── ');
    } else {
      segments.push(ancestorHasNext ? '│   ' : '    ');
    }
  });

  return segments.join('');
};

const fillSheetFromRows = (
  sheet: GC.Spread.Sheets.Worksheet,
  model: GridModel,
  rows: GridRow[],
) => {
  const SheetArea = GC.Spread.Sheets.SheetArea;

  // Размеры
  sheet.setRowCount(Math.max(50, rows.length + 10));
  sheet.setColumnCount(GRID_COLUMNS.length);

  // Заголовки
  GRID_COLUMNS.forEach((col, c) => {
    sheet.setValue(0, c, col.title, SheetArea.colHeader);
    sheet.setColumnWidth(c, (col.width ?? 120) + 8);
  });

  // Данные
  rows.forEach((row, r) => {
    GRID_COLUMNS.forEach((column, c) => {
      const cell = row.cells[column.id];
      const gcCell = sheet.getCell(r, c);

      // Стили
      if (cell?.style?.background) gcCell.backColor(cell.style.background);
      if (cell?.style?.color) gcCell.foreColor(cell.style.color);

      // Формула / значение
      if (cell?.formula) {
        const compiled = compileFormula(cell.formula, r);
        const formula = compiled.startsWith('=') ? compiled : `=${compiled}`;
        sheet.setFormula(r, c, formula);
      } else {
        const v = cell?.value;
        if (v === null || v === undefined) {
          sheet.setValue(r, c, '');
        } else if (typeof v === 'number') {
          sheet.setValue(r, c, v);
        } else if (typeof v === 'boolean') {
          sheet.setValue(r, c, v ? 'TRUE' : 'FALSE');
        } else {
          // Текстовое поле «account» с индентом/кареткой
          if (column.id === ('account' as ColumnId)) {
            const caret = caretForRow(row);
            const indent = buildIndent(row, model).replace(/ /g, '\u00A0');
            sheet.setValue(r, c, `${indent}${caret} [${getLevelBadge(row)}] ${v}`);
          } else {
            sheet.setValue(r, c, String(v));
          }
        }
      }
    });
  });

  // Можно вызвать авто‑подгон высоты при необходимости, но опустим для PoC
};

export const SpreadJsGridAdapter = () => {
  const { pagedRows, model } = useGridData();
  const workbookRef = useRef<GC.Spread.Sheets.Workbook | null>(null);

  const handleInit = useCallback((workbook: GC.Spread.Sheets.Workbook) => {
    workbookRef.current = workbook;
    const sheet = workbook.getActiveSheet();
    // Базовые настройки вида
    sheet.options.gridline = { showVerticalGridline: true, showHorizontalGridline: true } as any;
    sheet.defaults.rowHeight = 28;
    sheet.defaults.colWidth = 120;
    fillSheetFromRows(sheet, model, pagedRows);
  }, [model, pagedRows]);

  // Перерисовать при смене страницы/данных
  useEffect(() => {
    const wb = workbookRef.current;
    if (!wb) return;
    const sheet = wb.getActiveSheet();
    fillSheetFromRows(sheet, model, pagedRows);
  }, [model, pagedRows]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-panel">
      <SpreadSheets hostStyle={{ width: '100%', height: 520 }} workbookInitialized={handleInit} />
    </div>
  );
};
