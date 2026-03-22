import DataEditor, {
  GridCellKind,
  type EditableGridCell,
  type GridCell,
  type TextCell,
  type GridColumn as GlideColumn,
  type Item,
} from '@glideapps/glide-data-grid';
import { useCallback, useMemo } from 'react';

import { GRID_COLUMNS } from '@/shared/data/columns';
import { useGridData } from '@/shared/state/gridStore';
import type { CellStyle, ColumnId, GridModel, GridRow } from '@/shared/types/grid';
import { formatCellValue } from '@/shared/utils/format';

const TREE_INDENT = 18;
const DEPTH_BACKGROUND = ['#eef4ff', '#f5f7fb', '#ffffff'];

const getRowTheme = (depth: number, style?: CellStyle) => {
  const theme: Record<string, string> = {};
  const fallback = DEPTH_BACKGROUND[Math.min(depth, DEPTH_BACKGROUND.length - 1)] ?? '#ffffff';

  theme.bgCell = style?.background ?? fallback;

  if (style?.color) {
    theme.textDark = style.color;
  }

  return theme;
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

const caretForRow = (row: GridRow) => {
  if (row.childrenIds.length > 0) {
    return row.isCollapsed ? '▸' : '▾';
  }
  return '•';
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
        if (!parent) {
          return false;
        }
        const selfIndex = parent.childrenIds.indexOf(row.id);
        return selfIndex !== -1 && selfIndex < parent.childrenIds.length - 1;
      })();
      segments.push(hasNextSibling ? '├── ' : '└── ');
    } else {
      segments.push(ancestorHasNext ? '│   ' : '    ');
    }
  });

  return segments.join('').replace(/ /g, '\u00A0');
};

export const GlideGridAdapter = () => {
  const { pagedRows, actions, model } = useGridData();

  const columns = useMemo<GlideColumn[]>(
    () =>
      GRID_COLUMNS.map((column) => ({
        title: column.title,
        width: column.width ?? 160,
        id: column.id,
      })),
    [],
  );

  const getRowAndColumn = useCallback(
    (cell: Item): { row: GridRow; columnId: ColumnId } | null => {
      const [col, rowIndex] = cell;
      const row = pagedRows[rowIndex];
      const column = GRID_COLUMNS[col];

      if (!row || !column) {
        return null;
      }

      return { row, columnId: column.id };
    },
    [pagedRows],
  );

  const getCellContent = useCallback(
    ([col, row]: Item): GridCell => {
      const rowData = pagedRows[row];
      const column = GRID_COLUMNS[col];

      if (!rowData || !column) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          data: '',
          displayData: '',
        };
      }

      const cell = rowData.cells[column.id];
      const formatted = cell ? formatCellValue(column, cell) : '';
      const themeOverride = getRowTheme(rowData.depth, cell?.style);
      const baseCell: Partial<GridCell> = {
        themeOverride,
        readonly: !column.isEditable,
        contentAlign: column.align ?? 'left',
        activationBehaviorOverride: column.isEditable ? 'single-click' : undefined,
      };

      const editingValue =
        cell?.formula ??
        (cell?.value === null || cell?.value === undefined ? '' : String(cell.value));

      if (column.id === 'account') {
        const caret = caretForRow(rowData);
        const indent = buildIndent(rowData, model);
        const badge = getLevelBadge(rowData);
        const displayData = `${indent}${caret} [${badge}] ${cell?.value ?? ''}`;

        const textCell: TextCell = {
          ...baseCell,
          kind: GridCellKind.Text,
          allowOverlay: !!column.isEditable,
          displayData,
          data: editingValue as string,
        };
        return textCell;
      }

      const textCell: TextCell = {
        ...baseCell,
        kind: GridCellKind.Text,
        allowOverlay: !!column.isEditable,
        displayData: formatted,
        data: editingValue as string,
      };
      return textCell;
    },
    [model, pagedRows],
  );

  const handleCellClicked = useCallback(
    (cell: Item, event: any) => {
      const result = getRowAndColumn(cell);
      if (!result) {
        return;
      }

      const { row, columnId } = result;

      if (columnId === 'account' && row.childrenIds.length > 0) {
        const toggleHitArea = row.depth * TREE_INDENT + TREE_INDENT;
        if (event.localEventX <= toggleHitArea) {
          event.preventDefault();
          actions.toggleCollapse(row.id);
          return;
        }
      }

      actions.setSelection({ rowId: row.id, columnId });
    },
    [actions, getRowAndColumn],
  );

  const handleCellEdited = useCallback(
    (cell: Item, newValue: EditableGridCell) => {
      const ctx = getRowAndColumn(cell);
      if (!ctx) {
        return;
      }

      const raw: unknown = (newValue as any).data;
      const payload = raw === null || raw === undefined
        ? null
        : typeof raw === 'number' || typeof raw === 'string'
          ? raw
          : String(raw);
      actions.editCell(ctx.row.id, ctx.columnId, payload);
    },
    [actions, getRowAndColumn],
  );

  const handleCellActivated = useCallback(
    (cell: Item) => {
      const ctx = getRowAndColumn(cell);
      if (ctx) {
        actions.setSelection({ rowId: ctx.row.id, columnId: ctx.columnId });
      }
    },
    [actions, getRowAndColumn],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-panel">
      <DataEditor
        className="min-h-[520px]"
        columns={columns}
        rows={pagedRows.length}
        rowMarkers="number"
        overscrollY={48}
        getCellContent={getCellContent}
        onCellClicked={handleCellClicked}
        onCellActivated={handleCellActivated}
        onCellEdited={handleCellEdited}
        rowSelectionBlending="exclusive"
        columnSelect="single"
        rowSelect="multi"
        rangeSelect="rect"
        smoothScrollY
        height={520}
      />
    </div>
  );
};
