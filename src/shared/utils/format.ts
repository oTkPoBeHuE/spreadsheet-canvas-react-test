import type { GridCell, GridColumn } from '@/shared/types/grid';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

export const formatCellValue = (column: GridColumn, cell: GridCell) => {
  if (cell.error) {
    return cell.error;
  }

  if (cell.value === null || cell.value === undefined) {
    return '';
  }

  if (typeof cell.value === 'boolean') {
    return cell.value ? 'TRUE' : 'FALSE';
  }

  if (typeof cell.value === 'string') {
    return cell.value;
  }

  switch (column.type) {
    case 'currency':
      return currencyFormatter.format(Number(cell.value));
    case 'percentage':
      return percentFormatter.format(Number(cell.value));
    case 'number':
      return numberFormatter.format(Number(cell.value));
    default:
      return String(cell.value);
  }
};
