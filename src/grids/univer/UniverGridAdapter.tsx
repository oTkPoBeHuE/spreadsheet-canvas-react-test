import { useEffect, useMemo, useRef } from 'react';

import {
  LocaleType,
  Univer,
  UniverInstanceType,
  type IWorkbookData,
  Workbook,
} from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverUIPlugin } from '@univerjs/ui';

import { GRID_COLUMNS } from '@/shared/data/columns';
import { compileFormula } from '@/shared/formula/compileFormula';
import { useGridData } from '@/shared/state/gridStore';

const APP_VERSION = '0.1.0';

export const UniverGridAdapter = () => {
  const { model, pagedRows } = useGridData();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const univerRef = useRef<Univer | null>(null);

  // Построим рабочую книгу из текущей страницы (видимых строк)
  const workbookData = useMemo(() => {
    const rows = pagedRows;

    const matrix = rows.map((row, pageRowIndex) =>
      GRID_COLUMNS.map((column) => {
        const cell = row.cells[column.id];
        const value = cell?.value ?? null;

        // Если исходная ячейка содержит формулу — транслируем в A1 для текущего индекса строки листа
        const compiled = cell?.formula ? compileFormula(cell.formula, pageRowIndex) : undefined;

        const result: { v?: string | number | boolean; f?: string } = {};
        if (compiled) {
          result.f = compiled.startsWith('=') ? compiled : `=${compiled}`;
        } else if (value !== null && value !== undefined) {
          result.v = typeof value === 'string' || typeof value === 'boolean' ? value : Number(value);
        }

        return result;
      }),
    );

    const sheetId = 'sheet1';
    return {
      id: 'workbook1',
      name: 'Dataset',
      appVersion: APP_VERSION,
      locale: LocaleType.EN_US,
      styles: {},
      sheetOrder: [sheetId],
      sheets: {
        [sheetId]: {
          id: sheetId,
          name: 'Sheet1',
          tabColor: '',
          hidden: 0,
          freeze: { xSplit: 0, ySplit: 1, startRow: 0, startColumn: 0 },
          rowCount: Math.max(100, matrix.length + 20),
          columnCount: GRID_COLUMNS.length + 2,
          zoomRatio: 1,
          scrollTop: 0,
          scrollLeft: 0,
          defaultColumnWidth: 100,
          defaultRowHeight: 28,
          mergeData: [],
          cellData: Object.fromEntries(
            matrix.map((row, r) => [r + 1, Object.fromEntries(row.map((cell, c) => [c + 1, cell]))]),
          ),
          rowData: {},
          columnData: Object.fromEntries(
            GRID_COLUMNS.map((col, c) => [c + 1, { w: col.width ?? 120 }]),
          ),
          rowHeader: { width: 46 },
          columnHeader: { height: 36 },
          showGridlines: 1,
          rightToLeft: 0,
        },
      },
    };
  }, [model.rowIndexLookup, pagedRows]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Инициализируем Univer + плагины
    const init = async () => {
      // Для PoC достаточно пустого пакета локалей — сервис будет инициализирован
      const univer = new Univer({ locale: LocaleType.EN_US });

      // Базовые плагины: рендерер, формулы, UI‑фрейм
      univer.registerPlugin(UniverRenderEnginePlugin);
      univer.registerPlugin(UniverFormulaEnginePlugin);
      univer.registerPlugin(UniverUIPlugin, {
        container: (containerRef.current ?? undefined) as HTMLElement | undefined,
        header: false,
        toolbar: false,
        footer: false,
        contextMenu: true,
        headerMenu: false,
        ribbonType: 'simple',
        popupRootId: 'univer-portal',
      });

      // Плагины таблиц и их UI
      univer.registerPlugin(UniverSheetsPlugin);
      univer.registerPlugin(UniverSheetsUIPlugin);

      // Плагины документов и их UI — требуются редактору ячеек (inline input)
      univer.registerPlugin(UniverDocsPlugin);
      univer.registerPlugin(UniverDocsUIPlugin);

      // Создаём книгу
      univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);

      univerRef.current = univer;
    };

    const timer = window.setTimeout(init, 0);
    return () => {
      window.clearTimeout(timer);
      const instance = univerRef.current;
      univerRef.current = null;
      if (instance) {
        // Откладываем dispose, чтобы не размонтировать React‑root синхронно во время рендера родителя
        window.setTimeout(() => instance.dispose(), 0);
      }
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-panel">
      <div ref={containerRef} className="relative h-[520px] w-full" />
    </div>
  );
};
