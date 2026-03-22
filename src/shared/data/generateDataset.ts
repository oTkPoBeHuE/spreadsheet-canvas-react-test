import { faker } from '@faker-js/faker';
import { DetailedCellError, HyperFormula } from 'hyperformula';

import { GRID_COLUMNS } from '@/shared/data/columns';
import { compileFormula } from '@/shared/formula/compileFormula';
import type { CellStyle, ColumnId, GridCell, GridModel, GridRow, GridRowKind } from '@/shared/types/grid';

type GenerateDatasetOptions = {
  rowCount?: number;
  seed?: number;
};

const REGIONS = ['EMEA', 'NAMER', 'LATAM', 'APAC'];
const SEGMENTS = ['Enterprise', 'Growth', 'Scale', 'SMB'];

const currency = (value: number) => Math.round(value);
const percent = (value: number) => Number(value.toFixed(4));

const createEmptyCells = () =>
  GRID_COLUMNS.reduce(
    (acc, column) => {
      acc[column.id] = {
        columnId: column.id,
        value: null,
        formula: column.defaultFormula,
        style: undefined,
        error: null,
      };
      return acc;
    },
    {} as Record<ColumnId, GridCell>,
  );

const createRow = (params: {
  id: string;
  label: string;
  kind: GridRowKind;
  depth: number;
  parentId?: string;
  isCollapsed?: boolean;
  style?: CellStyle;
}): GridRow => {
  return {
    id: params.id,
    label: params.label,
    kind: params.kind,
    parentId: params.parentId,
    depth: params.depth,
    childrenIds: [],
    isCollapsed: params.isCollapsed ?? params.kind !== 'account',
    leafCount: params.kind === 'account' ? 1 : 0,
    cells: createEmptyCells(),
  };
};

const formatAccountLabel = () => {
  const company = faker.company.name();
  const suffix = faker.helpers.arrayElement(['LLC', 'Inc.', 'PLC', 'Group']);
  return `${company} ${suffix}`;
};

const ensureRegionRow = (
  region: string,
  rows: Record<string, GridRow>,
  rootIds: string[],
): GridRow => {
  const id = `region-${region.toLowerCase()}`;
  if (rows[id]) {
    return rows[id];
  }

  const row = createRow({
    id,
    label: `${region} Region`,
    kind: 'region',
    depth: 0,
    isCollapsed: false,
  });

  row.cells.account.value = row.label;
  row.cells.region.value = region;
  row.cells.segment.value = 'All segments';
  row.cells.owner.value = 'Regional LT';

  rows[id] = row;
  rootIds.push(id);
  return row;
};

const ensureSegmentRow = (
  segment: string,
  regionRow: GridRow,
  rows: Record<string, GridRow>,
): GridRow => {
  const id = `segment-${regionRow.id}-${segment.toLowerCase()}`;
  if (rows[id]) {
    return rows[id];
  }

  const row = createRow({
    id,
    label: `${segment} ${regionRow.cells.region.value}`,
    kind: 'segment',
    depth: 1,
    parentId: regionRow.id,
    isCollapsed: true,
  });
  row.cells.account.value = `${segment} cohort`;
  row.cells.segment.value = segment;
  row.cells.region.value = regionRow.cells.region.value;
  row.cells.owner.value = `${segment} director`;

  rows[id] = row;
  regionRow.childrenIds.push(id);
  return row;
};

const assignAccountValues = (
  row: GridRow,
  region: string,
  segment: string,
  owner: string,
) => {
  row.cells.account.value = row.label;
  row.cells.segment.value = segment;
  row.cells.region.value = region;
  row.cells.owner.value = owner;

  const base = faker.number.float({ min: 15000, max: 250000 });
  const mrr = currency(base);
  const churn = currency(mrr * faker.number.float({ min: 0.02, max: 0.25 }));
  const expansion = currency(mrr * faker.number.float({ min: 0.05, max: 0.4 }));
  const growthTarget = percent(faker.number.float({ min: 0.05, max: 0.3 }));

  row.cells.mrr.value = mrr;
  row.cells.churn.value = churn;
  row.cells.expansion.value = expansion;
  row.cells.growth_target.value = growthTarget;
};

const aggregateRow = (
  row: GridRow,
  rows: Record<string, GridRow>,
): {
  mrr: number;
  churn: number;
  expansion: number;
  growthTargetTotal: number;
  leaves: number;
} => {
  if (!row.childrenIds.length) {
    row.leafCount = 1;
    return {
      mrr: Number(row.cells.mrr.value ?? 0),
      churn: Number(row.cells.churn.value ?? 0),
      expansion: Number(row.cells.expansion.value ?? 0),
      growthTargetTotal: Number(row.cells.growth_target.value ?? 0),
      leaves: 1,
    };
  }

  let mrr = 0;
  let churn = 0;
  let expansion = 0;
  let growthTargetTotal = 0;
  let leaves = 0;

  row.childrenIds.forEach((childId) => {
    const child = rows[childId];
    const childTotals = aggregateRow(child, rows);
    mrr += childTotals.mrr;
    churn += childTotals.churn;
    expansion += childTotals.expansion;
    growthTargetTotal += childTotals.growthTargetTotal;
    leaves += childTotals.leaves;
  });

  row.leafCount = leaves;
  row.cells.mrr.value = currency(mrr);
  row.cells.churn.value = currency(churn);
  row.cells.expansion.value = currency(expansion);
  row.cells.growth_target.value = leaves === 0 ? 0 : percent(growthTargetTotal / leaves);

  return { mrr, churn, expansion, growthTargetTotal, leaves };
};

const sortChildren = (rows: Record<string, GridRow>) => {
  Object.values(rows).forEach((row) => {
    row.childrenIds.sort((a, b) => rows[a].label.localeCompare(rows[b].label));
  });
};

const buildRowOrder = (rootIds: string[], rows: Record<string, GridRow>) => {
  const order: string[] = [];

  const visit = (rowId: string) => {
    order.push(rowId);
    const row = rows[rowId];
    row.childrenIds.forEach(visit);
  };

  rootIds.forEach(visit);
  return order;
};

const buildRowIndexLookup = (rowOrder: string[]) => {
  return rowOrder.reduce(
    (acc, rowId, index) => {
      acc[rowId] = index;
      return acc;
    },
    {} as Record<string, number>,
  );
};

const buildSheetMatrix = (rowOrder: string[], rows: Record<string, GridRow>) => {
  return rowOrder.map((rowId, rowIndex) => {
    const row = rows[rowId];
    return GRID_COLUMNS.map((column) => {
      const cell = row.cells[column.id];
      if (!cell) {
        return null;
      }

      if (cell.formula) {
        return compileFormula(cell.formula, rowIndex);
      }

      return cell.value ?? null;
    });
  });
};

const applySheetValues = (rows: Record<string, GridRow>, rowOrder: string[], hf: HyperFormula) => {
  const sheetValues = hf.getSheetValues(0);

  rowOrder.forEach((rowId, rowIndex) => {
    const row = rows[rowId];
    GRID_COLUMNS.forEach((column, columnIndex) => {
      const cell = row.cells[column.id];
      const computed = sheetValues[rowIndex]?.[columnIndex] ?? null;

      if (computed instanceof DetailedCellError) {
        cell.error = computed.value;
        cell.value = null;
        return;
      }

      cell.error = null;
      cell.value = computed;
    });
  });
};

export const generateDataset = (options: GenerateDatasetOptions = {}): GridModel => {
  const count = Math.max(10, options.rowCount ?? 100);
  faker.seed(options.seed ?? 2026);

  const rows: Record<string, GridRow> = {};
  const rootIds: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const region = faker.helpers.arrayElement(REGIONS);
    const segment = faker.helpers.arrayElement(SEGMENTS);
    const owner = faker.person.fullName();

    const accountRow = createRow({
      id: `account-${index + 1}`,
      label: formatAccountLabel(),
      kind: 'account',
      depth: 2,
    });

    assignAccountValues(accountRow, region, segment, owner);
    rows[accountRow.id] = accountRow;

    const regionRow = ensureRegionRow(region, rows, rootIds);
    const segmentRow = ensureSegmentRow(segment, regionRow, rows);
    accountRow.parentId = segmentRow.id;
    segmentRow.childrenIds.push(accountRow.id);
  }

  sortChildren(rows);
  rootIds.sort((a, b) => rows[a].label.localeCompare(rows[b].label));
  rootIds.forEach((rootId) => {
    aggregateRow(rows[rootId], rows);
  });

  const rowOrder = buildRowOrder(rootIds, rows);
  const rowIndexLookup = buildRowIndexLookup(rowOrder);
  const matrix = buildSheetMatrix(rowOrder, rows);
  const hyperFormula = HyperFormula.buildFromArray(matrix, { licenseKey: 'gpl-v3' });

  applySheetValues(rows, rowOrder, hyperFormula);

  return {
    columns: GRID_COLUMNS,
    rows,
    rootIds,
    rowOrder,
    rowIndexLookup,
    hyperFormula,
  };
};
