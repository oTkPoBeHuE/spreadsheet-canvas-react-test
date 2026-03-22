import type { GridModel, GridRow } from '@/shared/types/grid';

const collectRowIds = (row: GridRow, rows: Record<string, GridRow>, acc: string[]) => {
  acc.push(row.id);
  if (row.isCollapsed) {
    return;
  }

  row.childrenIds.forEach((childId) => {
    const child = rows[childId];
    if (child) {
      collectRowIds(child, rows, acc);
    }
  });
};

export const collectVisibleRowIds = (model: GridModel) => {
  const result: string[] = [];
  model.rootIds.forEach((rootId) => {
    const row = model.rows[rootId];
    if (row) {
      collectRowIds(row, model.rows, result);
    }
  });
  return result;
};
