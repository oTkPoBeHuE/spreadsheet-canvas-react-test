import type { ComponentType } from 'react';

export type GridImplementationStatus = 'ready' | 'planned';

export interface GridImplementation {
  id: string;
  label: string;
  description: string;
  status: GridImplementationStatus;
  component: ComponentType;
}
