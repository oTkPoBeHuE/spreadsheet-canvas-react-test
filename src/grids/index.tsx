import { ComingSoonCard } from '@/grids/ComingSoonCard';
import { GlideGridAdapter } from '@/grids/glide/GlideGridAdapter';
import { UniverGridAdapter } from '@/grids/univer/UniverGridAdapter';
import { FortuneSheetGridAdapter } from '@/grids/fortune/FortuneSheetGridAdapter';
import { SpreadJsGridAdapter } from '@/grids/spreadjs/SpreadJsGridAdapter';
import type { GridImplementation } from '@/grids/types';

const createPlanned = (title: string, description: string) => () =>
  <ComingSoonCard title={title} description={description} />;

export const GRID_IMPLEMENTATIONS: GridImplementation[] = [
  {
    id: 'glide',
    label: 'Glide Data Grid + HyperFormula',
    description:
      'Canvas grid powered by Glide Data Grid with inline formulas evaluated via HyperFormula.',
    status: 'ready',
    component: GlideGridAdapter,
  },
  {
    id: 'univer',
    label: 'Univer Sheets',
    description:
      'Spreadsheet‑движок Univer: формулы и редактирование .',
    status: 'ready',
    component: UniverGridAdapter,
  },
  {
    id: 'spreadjs',
    label: 'SpreadJS React Wrapper',
    description:
      '',
    status: 'ready',
    component: SpreadJsGridAdapter,
  },
  {
    id: 'fortune',
    label: 'FortuneSheet',
    description: 'Open-source Luckysheet fork with spreadsheet UX and formulas.',
    status: 'ready',
    component: FortuneSheetGridAdapter,
  },
  {
    id: 'xspreadsheet',
    label: 'x-data-spreadsheet',
    description: 'Lightweight canvas engine with basic formulas.',
    status: 'planned',
    component: createPlanned(
      'x-data-spreadsheet adapter',
      'The lightweight adapter will verify performance on constrained devices and reuse the shared toolbar actions.',
    ),
  },
];
