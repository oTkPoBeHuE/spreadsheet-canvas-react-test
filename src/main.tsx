import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@glideapps/glide-data-grid/dist/index.css';
// Univer UI styles (required for layout/visibility)
import '@univerjs/ui/lib/index.css';
import '@univerjs/sheets-ui/lib/index.css';
import '@univerjs/docs-ui/lib/index.css';
// SpreadJS theme (React wrapper)
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
import './index.css';

import { AppRouter } from '@/app/router';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

createRoot(container).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
