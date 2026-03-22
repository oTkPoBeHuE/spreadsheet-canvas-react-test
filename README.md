# Multi‑Grid PoC

Демонстрационный проект, в котором общий адаптер данных подключается к нескольким канвас‑гридам. Первая вкладка использует связку **Glide Data Grid + HyperFormula** (формулы, outline, стилизация), остальные вкладки зарезервированы под Univer, SpreadJS, FortuneSheet и x-data-spreadsheet.

## Стек

- React 19 + TypeScript + Vite 8
- Tailwind CSS + Radix UI (Tabs/Popover)
- @glideapps/glide-data-grid (канвас‑рендер) + HyperFormula (формулы/именованные выражения)
- @tanstack/react-router для маршрутизации и вкладок
- Biome для lint/format, Vitest для unit‑тестов

## Скрипты

```bash
pnpm install        # установка зависимостей
pnpm dev            # dev-сервер Vite
pnpm build          # typecheck + прод-сборка
pnpm preview        # предпросмотр сборки
pnpm lint           # Biome lint
pnpm fix            # Biome auto-fix
pnpm test           # Vitest
```

## Архитектура

- `src/shared` — типы, генератор данных (faker + outline), утилиты формул, контекст стора.
- `src/grids` — список реализаций + адаптер Glide (остальные вкладки выводят карточки planned).
- `src/features/grid-showcase` — UI-надстройки (toolbar, пагинация, табы).
- `src/pages/GridShowcasePage` — страница с описанием колонок, тулбаром и вкладками.

## Что реализовано

- Генерация 100–5000 строк с иерархией Region → Segment → Account и дефолтными формулами (`churn_rate`, `net_revenue`, `forecast`).
- Обновление ячеек inline, пересчёт зависимостей через HyperFormula, поддержка `=A1` и именованных метрик (`=net_revenue*(1+growth_target)`).
- Пагинация (10/25/50), expand/collapse строк, выбор ячейки, окраска выбранной ячейки из тулбара, экспорт CSV.
- Индикация пересчёта и форма для изменения количества строк.

Планируемые адаптеры (Univer/SpreadJS/FortuneSheet/x-data-spreadsheet) уже присутствуют на вкладках с описанием статуса.
