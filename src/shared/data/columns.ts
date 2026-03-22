import type { ColumnId, GridColumn } from '@/shared/types/grid';

export const GRID_COLUMNS: GridColumn[] = [
  {
    id: 'account',
    title: 'Account / Group',
    type: 'text',
    width: 240,
    treeColumn: true,
    isEditable: true,
    namedExpression: 'account',
  },
  {
    id: 'segment',
    title: 'Segment',
    type: 'text',
    width: 140,
    isEditable: true,
    namedExpression: 'segment',
  },
  {
    id: 'region',
    title: 'Region',
    type: 'text',
    width: 120,
    isEditable: false,
    namedExpression: 'region',
  },
  {
    id: 'owner',
    title: 'Owner',
    type: 'text',
    width: 160,
    isEditable: true,
    namedExpression: 'owner',
  },
  {
    id: 'mrr',
    title: 'MRR',
    type: 'currency',
    width: 120,
    align: 'right',
    isEditable: true,
    namedExpression: 'mrr',
  },
  {
    id: 'expansion',
    title: 'Expansion',
    type: 'currency',
    width: 120,
    align: 'right',
    isEditable: true,
    namedExpression: 'expansion',
  },
  {
    id: 'churn',
    title: 'Churn',
    type: 'currency',
    width: 120,
    align: 'right',
    isEditable: true,
    namedExpression: 'churn',
  },
  {
    id: 'churn_rate',
    title: 'Churn %',
    type: 'percentage',
    width: 120,
    align: 'right',
    isEditable: true,
    namedExpression: 'churn_rate',
    defaultFormula: '=churn/mrr',
  },
  {
    id: 'growth_target',
    title: 'Growth Target %',
    type: 'percentage',
    width: 150,
    align: 'right',
    isEditable: true,
    namedExpression: 'growth_target',
  },
  {
    id: 'net_revenue',
    title: 'Net Revenue',
    type: 'currency',
    width: 150,
    align: 'right',
    isEditable: true,
    namedExpression: 'net_revenue',
    defaultFormula: '=mrr - churn + expansion',
  },
  {
    id: 'forecast',
    title: 'Forecast',
    type: 'currency',
    width: 150,
    align: 'right',
    isEditable: true,
    namedExpression: 'forecast',
    defaultFormula: '=net_revenue * (1 + growth_target)',
  },
];

export const COLUMN_INDEX_LOOKUP: Record<ColumnId, number> = GRID_COLUMNS.reduce(
  (acc, column, index) => {
    acc[column.id] = index;
    return acc;
  },
  {} as Record<ColumnId, number>,
);

export const NAMED_EXPRESSION_LOOKUP = new Map(
  GRID_COLUMNS.map((column) => [column.namedExpression.toLowerCase(), column.id]),
);
