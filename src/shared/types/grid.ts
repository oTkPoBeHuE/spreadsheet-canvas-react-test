import type { HyperFormula } from 'hyperformula';

export type ColumnId =
  | 'account'
  | 'segment'
  | 'region'
  | 'owner'
  | 'mrr'
  | 'expansion'
  | 'churn'
  | 'churn_rate'
  | 'growth_target'
  | 'net_revenue'
  | 'forecast';

export type ColumnValueType = 'text' | 'number' | 'currency' | 'percentage';

export interface GridColumn {
  id: ColumnId;
  title: string;
  width?: number;
  type: ColumnValueType;
  align?: 'left' | 'center' | 'right';
  treeColumn?: boolean;
  isEditable?: boolean;
  namedExpression: string;
  defaultFormula?: string;
}

export type GridRowKind = 'region' | 'segment' | 'account';

export interface CellStyle {
  background?: string;
  color?: string;
}

export interface GridCell {
  columnId: ColumnId;
  value: number | string | boolean | null;
  formula?: string;
  style?: CellStyle;
  error?: string | null;
}

export interface GridRow {
  id: string;
  label: string;
  parentId?: string;
  depth: number;
  kind: GridRowKind;
  childrenIds: string[];
  isCollapsed: boolean;
  leafCount: number;
  cells: Record<ColumnId, GridCell>;
}

export interface GridModel {
  columns: GridColumn[];
  rows: Record<string, GridRow>;
  rootIds: string[];
  rowOrder: string[];
  rowIndexLookup: Record<string, number>;
  hyperFormula: HyperFormula;
}

export interface GridSelection {
  rowId: string;
  columnId: ColumnId;
}

export type PageSizeOption = 10 | 25 | 50;
