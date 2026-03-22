import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { ExportedCellChange, ExportedChange } from 'hyperformula';
import { DetailedCellError } from 'hyperformula';

import { COLUMN_INDEX_LOOKUP, GRID_COLUMNS } from '@/shared/data/columns';
import { generateDataset } from '@/shared/data/generateDataset';
import { compileFormula } from '@/shared/formula/compileFormula';
import { formatCellValue } from '@/shared/utils/format';
import { parseLiteralInput } from '@/shared/utils/parseInput';
import { collectVisibleRowIds } from '@/shared/utils/tree';
import type { CellStyle, ColumnId, GridModel, GridRow, GridSelection, PageSizeOption } from '@/shared/types/grid';

type GridStoreValue = {
  model: GridModel;
  visibleRowIds: string[];
  pagedRows: GridRow[];
  pageSize: PageSizeOption;
  pageIndex: number;
  totalRows: number;
  totalPages: number;
  selection: GridSelection | null;
  rowTarget: number;
  isRecalculating: boolean;
  actions: {
    setPageSize: (size: PageSizeOption) => void;
    setPageIndex: (index: number) => void;
    toggleCollapse: (rowId: string) => void;
    editCell: (rowId: string, columnId: ColumnId, value: string | number | null) => void;
    setSelection: (selection: GridSelection | null) => void;
    applyStyle: (style: CellStyle) => void;
    regenerate: (rows: number) => void;
    buildCsv: (rowIds?: string[]) => string;
  };
};

const GridDataContext = createContext<GridStoreValue | undefined>(undefined);

const isCellChange = (change: ExportedChange): change is ExportedCellChange =>
  Object.hasOwn(change, 'address');

const applyChangesToRows = (model: GridModel, changes: ExportedChange[]) => {
  if (!changes.length) {
    return model.rows;
  }

  const nextRows: GridModel['rows'] = { ...model.rows };
  const touched = new Map<string, GridRow>();

  changes.forEach((change) => {
    if (!isCellChange(change)) {
      return;
    }

    const rowId = model.rowOrder[change.address.row];
    const column = model.columns[change.address.col];

    if (!rowId || !column) {
      return;
    }

    const sourceRow = touched.get(rowId) ?? {
      ...model.rows[rowId],
      cells: { ...model.rows[rowId].cells },
    };

    touched.set(rowId, sourceRow);
    nextRows[rowId] = sourceRow;

    const cell = { ...sourceRow.cells[column.id] };
    sourceRow.cells[column.id] = cell;

    const value = change.newValue;
    if (value instanceof DetailedCellError) {
      cell.value = null;
      cell.error = value.value;
    } else {
      cell.value = value;
      cell.error = null;
    }
  });

  return nextRows;
};

export const GridDataProvider = ({
  children,
  initialRowCount = 100,
}: {
  children: ReactNode;
  initialRowCount?: number;
}) => {
  const [model, setModel] = useState(() => generateDataset({ rowCount: initialRowCount }));
  const [pageSize, setPageSize] = useState<PageSizeOption>(25);
  const [pageIndex, setPageIndex] = useState(0);
  const [selection, setSelection] = useState<GridSelection | null>(null);
  const [rowTarget, setRowTarget] = useState(initialRowCount);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current && typeof window !== 'undefined') {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const scheduleRecalculationEnd = useCallback(() => {
    setIsRecalculating(true);
    if (typeof window === 'undefined') {
      setIsRecalculating(false);
      return;
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setIsRecalculating(false), 220);
  }, []);

  const visibleRowIds = useMemo(() => collectVisibleRowIds(model), [model]);

  const totalRows = visibleRowIds.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages]);

  const pagedRows = useMemo(() => {
    const start = pageIndex * pageSize;
    const slicedIds = visibleRowIds.slice(start, start + pageSize);
    return slicedIds.map((id) => model.rows[id]);
  }, [model.rows, pageIndex, pageSize, visibleRowIds]);

  const toggleCollapse = useCallback((rowId: string) => {
    setModel((prev) => {
      const target = prev.rows[rowId];
      if (!target || !target.childrenIds.length) {
        return prev;
      }

      return {
        ...prev,
        rows: {
          ...prev.rows,
          [rowId]: {
            ...target,
            isCollapsed: !target.isCollapsed,
          },
        },
      };
    });
  }, []);

  const editCell = useCallback(
    (rowId: string, columnId: ColumnId, rawInput: string | number | null) => {
      setModel((prev) => {
        const row = prev.rows[rowId];
        if (!row) {
          return prev;
        }

        const rowIndex = prev.rowIndexLookup[rowId];
        const columnIndex = COLUMN_INDEX_LOOKUP[columnId];

        if (rowIndex === undefined || columnIndex === undefined) {
          return prev;
        }

        const trimmed = typeof rawInput === 'string' ? rawInput.trim() : rawInput;
        const isFormula = typeof trimmed === 'string' && trimmed.startsWith('=');
        const literalValue = isFormula ? null : parseLiteralInput(columnId, rawInput);
        const hfInput = isFormula ? compileFormula(trimmed as string, rowIndex) : literalValue;

        const nextRows = {
          ...prev.rows,
          [rowId]: {
            ...row,
            cells: {
              ...row.cells,
              [columnId]: {
                ...row.cells[columnId],
                formula: isFormula ? (trimmed as string) : undefined,
                value: isFormula ? null : literalValue,
              },
            },
          },
        };

        const changes = prev.hyperFormula.setCellContents(
          { sheet: 0, row: rowIndex, col: columnIndex },
          [[hfInput ?? null]],
        );

        return {
          ...prev,
          rows: applyChangesToRows({ ...prev, rows: nextRows }, changes),
        };
      });
      scheduleRecalculationEnd();
    },
    [scheduleRecalculationEnd],
  );

  const applyStyle = useCallback(
    (style: CellStyle) => {
      if (!selection) {
        return;
      }
      setModel((prev) => {
        const row = prev.rows[selection.rowId];
        if (!row) {
          return prev;
        }

        return {
          ...prev,
          rows: {
            ...prev.rows,
            [row.id]: {
              ...row,
              cells: {
                ...row.cells,
                [selection.columnId]: {
                  ...row.cells[selection.columnId],
                  style: { ...row.cells[selection.columnId].style, ...style },
                },
              },
            },
          },
        };
      });
    },
    [selection],
  );

  const regenerate = useCallback(
    (rowsCount: number) => {
      const nextModel = generateDataset({ rowCount: rowsCount });
      setModel(nextModel);
      setPageIndex(0);
      setRowTarget(rowsCount);
      setSelection(null);
      scheduleRecalculationEnd();
    },
    [scheduleRecalculationEnd],
  );

  const buildCsv = useCallback(
    (rowIds?: string[]) => {
      const ids = rowIds?.length ? rowIds : visibleRowIds;
      const header = GRID_COLUMNS.map((column) => column.title).join(',');
      const rowsCsv = ids
        .map((rowId) => {
          const row = model.rows[rowId];
          if (!row) {
            return '';
          }
          const values = GRID_COLUMNS.map((column) => {
            const cell = row.cells[column.id];
            const formatted = cell ? formatCellValue(column, cell) : '';
            const safe = formatted.replace(/"/g, '""');
            return `"${safe}"`;
          });
          return values.join(',');
        })
        .filter(Boolean)
        .join('\n');

      return `${header}\n${rowsCsv}`;
    },
    [model.rows, visibleRowIds],
  );

  const value: GridStoreValue = {
    model,
    visibleRowIds,
    pagedRows,
    pageSize,
    pageIndex,
    totalRows,
    totalPages,
    selection,
    rowTarget,
    isRecalculating,
    actions: {
      setPageSize: (size) => {
        setPageSize(size);
        setPageIndex(0);
      },
      setPageIndex,
      toggleCollapse,
      editCell,
      setSelection,
      applyStyle,
      regenerate,
      buildCsv,
    },
  };

  return <GridDataContext.Provider value={value}>{children}</GridDataContext.Provider>;
};

export const useGridData = () => {
  const ctx = useContext(GridDataContext);
  if (!ctx) {
    throw new Error('useGridData must be used inside GridDataProvider');
  }
  return ctx;
};
