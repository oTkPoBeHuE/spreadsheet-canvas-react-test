import type { ColumnId } from '@/shared/types/grid';

const currencyColumns: ColumnId[] = ['mrr', 'expansion', 'churn', 'net_revenue', 'forecast'];
const percentColumns: ColumnId[] = ['churn_rate', 'growth_target'];
const numericColumns: ColumnId[] = [...currencyColumns, ...percentColumns];

const sanitizeNumber = (value: string) => {
  const cleaned = value.replace(/[%,$\s]/g, '');
  return Number(cleaned);
};

export const isNumericColumn = (columnId: ColumnId) => numericColumns.includes(columnId);

export const parseLiteralInput = (columnId: ColumnId, rawValue: string | number | null) => {
  if (rawValue === null) {
    return null;
  }

  if (typeof rawValue === 'number') {
    return rawValue;
  }

  const trimmed = rawValue.trim();
  if (trimmed === '') {
    return null;
  }

  if (percentColumns.includes(columnId)) {
    const value = sanitizeNumber(trimmed);
    if (Number.isNaN(value)) {
      return trimmed;
    }
    return value / (trimmed.includes('%') ? 100 : 1);
  }

  if (numericColumns.includes(columnId)) {
    const value = sanitizeNumber(trimmed);
    return Number.isNaN(value) ? trimmed : value;
  }

  return trimmed;
};
