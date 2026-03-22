# Spreadsheet-подобные движки (Canvas + React) — обзор на 2026 год

Дата: 2026‑03‑20

Цель: выбрать фронтенд‑движок под «эмулятор Excel» в React (без обязательного бэкенда), с приоритетом Canvas‑рендеринга, мощной системой формул и иерархиями строк.

## Требования
- React‑совместимость (без обязательного бэкенда; Node.js возможен).
- Canvas‑рендеринг (DOM/div — только как исключение).
- Формулы (чем больше — тем лучше), возможность адресации не по A1 (A32*B44), а по «именованным показателям» (например, churn*churn_rate).
- Сворачиваемость строк (outlining/expand/collapse), скрытие/группировка.
- Стилизация ячеек (цвета/форматирование) и редактирование.
- Производительность на больших объёмах, по возможности частичные апдейты.
- Nice to have: графики; импорт/экспорт Excel (.xlsx) и CSV.
- Предпочтительно: готовая библиотека И/ИЛИ проект, который можно форкнуть на GitHub.

## Краткие рекомендации
- Бесплатный «из коробки» и активно развиваемый: Univer (MIT)
  - Плагино‑ориентированная архитектура, богатая формульная подсистема, активная разработка, React‑интеграции. Именованные диапазоны позволяют формировать формулы вида churn*churn_rate, а не A1‑адресацию. Поддерживаются стили, редактирование, плагины для импорта/экспорта.
- Платный «всё включено» с Canvas и Excel‑совместимостью: SpreadJS (GrapeCity)
  - Коммерческий движок с мощной формульной моделью (400+ функций), Excel‑уровнем совместимости, встроенным импорт/экспортом (ExcelIO), графиками и производительным Canvas‑рендерингом.
- Конструктор под наш UI/архитектуру (Canvas + headless формулы): Glide Data Grid + HyperFormula (+ SheetJS для I/O)
  - Canvas‑таблица с высокой производительностью; добавляем HyperFormula для формул/именованных выражений, а SheetJS (xlsx) — для импорта/экспорта. Даёт максимальную кастомизацию под Tailwind/Radix UI и частичные обновления.
- Альтернатива (React‑совместимые форки, Canvas): FortuneSheet (fork Luckysheet)
  - Open‑source, Canvas‑рендеринг, много формул. Подходит как база для форка; однако требует больше интеграций и доводки.

## Почему Glide Data Grid, а не TanStack Table?

- Жёсткое требование Canvas. TanStack Table — headless‑таблица на DOM (div/табличная разметка), не Canvas. Glide Data Grid рендерит ячейки через Canvas, что лучше соответствует требованиям и даёт выигрыш на очень больших таблицах.
- Производительность на больших объёмах. Glide использует высокоэффективный Canvas‑рендер и виртуализацию по строкам/столбцам; он рисует только видимые участки и изменившиеся ячейки. У TanStack Table даже с виртуализацией остаётся накладная стоимость DOM‑нод и React reconciliation для каждой видимой ячейки.
- «Спредшит»‑семантика. Для сценария «эмулятор Excel» с покраской ячеек, кастомными редакторами и плотным UI Canvas упрощает реализацию богатого cell‑рендеринга без тысячи DOM‑элементов. Недостающие части (формулы, именованные выражения) добавляются через HyperFormula.
- Когда TanStack Table всё же уместен. Если требования Canvas нет, а нужен «грид» (не «спредшит») с классическими фичами и полной кастомизацией UI — TanStack Table остаётся отличным бесплатным вариантом (особенно под ваш Tailwind/Radix UI). В данном задании ключевое отличие — обязательный Canvas и акцент на спредшит‑поведение.

## Шорт‑лист (сводная таблица)

| Библиотека | Рендер | React | Формулы | Имена/Named refs | Сворачивание строк | Стили | Редактир. | Частичные апдейты | Графики | Excel I/O | CSV I/O | Производительность | Лицензия/стоимость |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Univer | Canvas/вирт. | Да | Широкие (ядро + плагины) | Да (Named ranges/expressions) | Да (группы/скрытие; плагинно) | Да | Да | Да (по id/диапазонам) | Плагины | Плагины (xlsx) | Да | Высокая (виртуализация) | MIT |
| SpreadJS | Canvas | Да (официальный wrapper) | 400+ Excel‑функций | Да (Named ranges, structured ref) | Да (outline/group) | Да (условное формат.) | Да | Да (transactional) | Да | Да (ExcelIO) | Да | Очень высокая | Коммерц. (лицензия) |
| FortuneSheet | Canvas | Да | Много (на базе Luckysheet) | Частично (через имен. диапазоны) | Частично (hide/группы) | Да | Да | Частично (через API) | Через плагины | Через SheetJS | Да | Высокая | MIT |
| Luckysheet | Canvas | Через обёртки | Много | Частично | Частично | Да | Да | Частично | Через плагины | Через SheetJS | Да | Высокая | MIT |
| Glide Data Grid + HyperFormula | Canvas (+ формулы headless) | Да | Очень много (HF) | Да (Named expressions в HF) | Реализуемо (кастом tree/outlines) | Да (custom renderers) | Да | Да (точечные setState) | Внешние (ECharts/Chart.js) | Через SheetJS | Да | Очень высокая | MIT + MIT |
| Handsontable (+HyperFormula) | DOM (div) | Да | Очень много (HF) | Да | Да (плагины) | Да | Да | Да | Встроенные/через плагины | CSV/3rd‑party | Да | Высокая | Коммерч. |
| x-data-spreadsheet | Canvas | Да (примеры) | Базовые | Частично | Базово | Да | Да | Частично | Плагины | Через SheetJS | Да | Средняя | MIT |

Примечания:
- Canvas требование: SpreadJS, Univer (в большинстве конфигураций), FortuneSheet/Luckysheet, Glide Data Grid — соответствуют. Handsontable рендерит через DOM, поэтому здесь как «исключение».
- Формулы с «именованными показателями»: в SpreadJS/Univer доступны именованные диапазоны/выражения. В связке HyperFormula можно определить Named Expressions и использовать формулы вида churn*churn_rate.
- Частичные апдейты: в SpreadJS — транзакции/дифф; в Univer/Glide — точечные обновления диапазонов/строк; в Luckysheet/FortuneSheet — через API скрытия/обновления диапазонов.

## Метрики и ссылки

- Univer
  - Stars (GitHub): ~12 610; Commits/нед (52w): ~19.5
  - npm last‑month: `@univerjs/core` 245 444; `@univerjs/sheets` 194 402
  - Bundle (min+gz): `@univerjs/core` ≈ 118 KB; `@univerjs/sheets` ≈ 325 KB
  - Docs: https://univer.ai/  GitHub: https://github.com/dream-num/univer  npm: https://www.npmjs.com/package/@univerjs/core
  - Формулы: Custom formula (гайд) — https://docs.univer.ai/guides/recipes/tutorials/custom-formula, API регистрации формул — https://reference.univer.ai/zh-CN/classes/FFormula#registerfunction

- SpreadJS (GrapeCity)
  - Stars: n/a (продуктовая страница)  Commits: n/a (вендор)
  - npm last‑month: `@grapecity/spread-sheets` 49 268; `@grapecity/spread-excelio` 34 109; `@grapecity/spread-sheets-react` 18 274
  - Bundle (min+gz): `@grapecity/spread-sheets` ≈ 1.46 MB
  - Docs: https://www.grapecity.com/spreadjs/docs/  npm: https://www.npmjs.com/package/@grapecity/spread-sheets
  - Формулы: Обзор/функции — https://www.grapecity.com/spreadjs/docs/latest/online/formula-functions.html, Кастомные функции — https://www.grapecity.com/spreadjs/docs/latest/online/custom-functions.html

- FortuneSheet (fork Luckysheet)
  - Stars: ~3 561; Commits/нед: n/a (GitHub API pending)
  - npm last‑month: `fortune-sheet` 268
  - Docs: https://github.com/ruilisi/fortune-sheet  npm: https://www.npmjs.com/package/fortune-sheet
  - Формулы: Документация проекта — https://ruilisi.github.io/fortune-sheet-docs/ (может быть частично устаревшей), Формульный парсер (fork) — https://github.com/handsontable/formula-parser, Список функций — см. Wiki Luckysheet: https://github.com/dream-num/Luckysheet/wiki

- Luckysheet
  - Stars: ~16 620; Commits/нед: n/a (GitHub API pending)
  - npm last‑month: `luckysheet` 9 436
  - Bundle (min+gz): ≈ 606 KB
  - Docs: https://mengshukeji.github.io/LuckysheetDocs/  GitHub: https://github.com/dream-num/Luckysheet  npm: https://www.npmjs.com/package/luckysheet
  - Формулы: Wiki проекта (рубрики по формулам/функциям) — https://github.com/dream-num/Luckysheet/wiki

- Glide Data Grid + HyperFormula (+ SheetJS)
  - Glide: Stars ~5 086; Commits/нед: ~2.1; npm last‑month: `@glideapps/glide-data-grid` 645 101
  - HyperFormula: npm last‑month `hyperformula` 991 491
  - Docs: https://github.com/glideapps/glide-data-grid  https://hyperformula.handsontable.com/
  - Формулы (HyperFormula): Built‑in functions — https://hyperformula.handsontable.com/guide/built-in-functions.html, Named expressions — https://hyperformula.handsontable.com/guide/named-expressions.html, API — https://hyperformula.handsontable.com/api/index.html

- Handsontable
  - Stars: ~21 837; Commits/нед: ~10.0; npm last‑month: `handsontable` 944 596; `@handsontable/react` 386 494
  - Bundle (min+gz): `handsontable` ≈ 352 KB
  - Docs: https://handsontable.com/docs/  GitHub: https://github.com/handsontable/handsontable  npm: https://www.npmjs.com/package/handsontable
  - Формулы: (через HyperFormula) Built‑in functions — https://hyperformula.handsontable.com/guide/built-in-functions.html, Named expressions — https://hyperformula.handsontable.com/guide/named-expressions.html

- x-data-spreadsheet
  - Stars: ~14 615; Commits/нед: ~0.0; npm last‑month: 28 176
  - Bundle (min+gz): ≈ 4 KB (core, потребуются плагины)
  - GitHub: https://github.com/myliang/x-spreadsheet  npm: https://www.npmjs.com/package/x-data-spreadsheet
  - Формулы: Базовая поддержка (см. README репозитория); для расширенных сценариев можно интегрировать HyperFormula: https://hyperformula.handsontable.com/

(Метрики собраны в день подготовки отчёта; со временем меняются.)

## Соответствие требованиям по пунктам

- Canvas‑рендеринг:
  - Да: SpreadJS, Univer, FortuneSheet/Luckysheet, Glide Data Grid. (Handsontable — DOM.)
- Формулы и именованные показатели:
  - SpreadJS/Univer: именованные диапазоны/выражения → формулы вроде `=churn*churn_rate` без A1‑адресации.
  - HyperFormula: Named Expressions/API — легко задать `churn := A2`, `churn_rate := B2`, и использовать `=churn*churn_rate`.
- Сворачивание строк (группы/outline):
  - SpreadJS: встроенные outline/группы строк/столбцов.
  - Univer: плагины/grouping; скрытие диапазонов; outline моделируется плагином.
  - FortuneSheet/Luckysheet: скрытие/группировка на уровне API; готовые панели могут потребовать доработок.
  - Glide+HF: реализуется в пользовательском слое (tree/outlines) поверх канвас‑рендера.
- Стилизация/редактирование:
  - Все кандидаты поддерживают редактирование и стили (условное форматирование — у SpreadJS/Univer/Handsontable; в DIY — кодом).
- Производительность/частичные апдейты:
  - SpreadJS/Univer/Glide — оптимизированы под большие наборы; есть возможности точечных обновлений/дифф‑применения.
- Графики:
  - SpreadJS — встроенные.
  - Univer — плагины/интеграции (внешние чарт‑библиотеки).
  - FortuneSheet/Luckysheet — скриптовые вставки или внешние чарт‑библиотеки.
  - Glide — внешние (ECharts/Recharts/Chart.js), можно внедрять мини‑чарты.
- Импорт/экспорт:
  - SpreadJS: ExcelIO (xlsx) + CSV.
  - Univer: плагины/пример с xlsx/csv (через SheetJS/плагины экосистемы).
  - FortuneSheet/Luckysheet: JSON/CSV; xlsx через SheetJS.
  - Glide DIY: SheetJS для xlsx/csv.

## Архитектурные варианты

1) SpreadJS (коммерческий all‑in‑one)
- Плюсы: максимум Excel‑совместимости, Canvas, формулы 400+, импорт/экспорт xlsx, графики, outline, условное форматирование, частичные обновления.
- Минусы: стоимость лицензии; vendor lock‑in.

2) Univer (MIT, модульный)
- Плюсы: активная разработка, хорошая производительность, плагины, именованные диапазоны, возможность адаптировать адресацию под KPI‑имена, интеграция с React, меньше vendor lock‑in.
- Минусы: для некоторых enterprise‑фич может потребоваться доработка или плагины/экосистема.

3) Canvas DIY: Glide Data Grid + HyperFormula + SheetJS
- Плюсы: полная кастомизация (Tailwind/Radix UI), канвас‑производительность, именованные выражения (HF), свободный импорт/экспорт (SheetJS), точечные апдейты.
- Минусы: больше интеграционной работы (outlines, toolbar, форматирование, UI действий), ответственность за краевые случаи совместимости Excel.

## Лицензирование и стоимость (кратко)

- Univer — MIT (бесплатно). Можно использовать в коммерческих проектах. Дополнительные плагины/интеграции — open source/сообщества или свои.
- SpreadJS (GrapeCity) — коммерческая лицензия (per‑developer/per‑app, есть trial). Отличается максимальной Excel‑совместимостью, ExcelIO, встроенными графиками и outline. Подходит, когда нужен «готовый Excel в браузере» и SLA. Pricing: https://www.grapecity.com/spreadjs/pricing
- Handsontable — коммерческая лицензия для грида. Формульный движок HyperFormula — GPLv3 или коммерческая лицензия. Для проприетарных приложений без открытого исходного кода HyperFormula потребует коммерческую лицензию Handsontable. Pricing: https://handsontable.com/pricing, HyperFormula docs: https://hyperformula.handsontable.com/
- FortuneSheet — MIT (бесплатно). Импорт/экспорт .xlsx через сторонний плагин (fortuneexcel). Подходит как база для форка/кастомизации.
- Luckysheet — MIT (бесплатно). Активный OSS, Canvas‑рендер; часть документации/ресурсов может требовать адаптации.
- Glide Data Grid — MIT (бесплатно). Это только канвас‑таблица; формулы/Excel I/O добавляются отдельными библиотеками.
- HyperFormula — GPLv3/Commercial. Бесплатно при совместимости с GPLv3; для закрытого коммерческого ПО — коммерческая лицензия у Handsontable. Лицензия и API: https://hyperformula.handsontable.com/
- SheetJS (xlsx) — Apache‑2.0 (Community). Подходит для импорта/экспорта .xlsx/.csv. Есть SheetJS Pro с расширенным функционалом/поддержкой. npm: https://www.npmjs.com/package/xlsx

Когда использовать бесплатную vs платную версии
- Бесплатные (Univer, Glide + HyperFormula под GPL, Luckysheet/FortuneSheet, SheetJS CE): подходят, если
  - можно работать с MIT/Apache‑2.0/GPL‑совместимыми условиями, и
  - вы готовы интегрировать формулы (HF), I/O (SheetJS) и дописать UI/outline.
- Платные (SpreadJS, Handsontable/HyperFormula Commercial): выбирайте, если
  - нужна гарантированная Excel‑совместимость «как в десктопе», готовые графики и outline из коробки,
  - важны SLA/поддержка, предсказуемые релизы, и
  - нежелательны юридические риски GPL в проприетарном коде.

## Лицензии и цены (детально)

Важно: суммы и условия меняются. Ниже — типы лицензий/разница планов и ссылки на официальные страницы. Для актуальных цифр переходите по ссылкам.

- Univer (MIT)
  - Лицензия: MIT (бесплатно, можно в коммерческих проектах, без обязательств раскрывать код).
  - Платных планов у ядра нет; возможны сторонние плагины/услуги.
  - Когда подходит: нужен Canvas‑спредшит с формулами, без vendor lock‑in и юр. рисков GPL.

- SpreadJS (GrapeCity)
  - Лицензия: коммерческая (EULA). Обычно per‑developer с годом апдейтов/поддержки; рантайм чаще всего royalty‑free (смотрите EULA).
  - Состав: Spread.Sheets (ядро), Spread.ExcelIO (xlsx I/O), Charts и др. компоненты.
  - Разница планов: завязана на количество разработчиков/приложений, поддержку, обновления, включённые модули.
  - Когда использовать: максимум Excel‑совместимости (400+ функций, outline, условное форматирование, графики), готовый ExcelIO и SLA.
  - Pricing/Buy: https://www.grapecity.com/spreadjs/pricing  https://www.grapecity.com/spreadjs/buy

- Handsontable и HyperFormula
  - Handsontable (grid): коммерческая лицензия (по разработчикам/организациям). Pricing: https://handsontable.com/pricing
  - HyperFormula (движок формул): dual‑license — GPLv3 ИЛИ коммерческая. Для закрытого проприетарного ПО без публикации исходников обычно требуется коммерческая лицензия (обсуждайте с Handsontable). Документация: https://hyperformula.handsontable.com/
  - Когда использовать платную: если хотите встроить формулы в закрытый продукт без GPL‑обязательств; если нужен коммерческий SLA.
  - Когда бесплатную: для OSS‑проектов под GPLv3‑совместимой лицензией, R&D, прототипов.

- Glide Data Grid
  - Лицензия: MIT (бесплатно). Только Canvas‑таблица, без формул/ExcelIO «из коробки».
  - Дополняется: HyperFormula (формулы, см. лицензию выше) и SheetJS (Apache‑2.0) для I/O.
  - Когда подходит: нужен Canvas и полный контроль UI/логики при минимальных юр. рисках и нулевой цене движка.

- FortuneSheet (fork Luckysheet)
  - Лицензия: MIT (бесплатно). Формулы на базе форка handsontable/formula‑parser.
  - XLSX: плагин community (fortuneexcel). Степень поддержки Excel/фич может отличаться от SpreadJS.
  - Когда подходит: как база для форка/кастомизации, если устраивает уровень совместимости и готовность дорабатывать.

- Luckysheet
  - Лицензия: MIT (бесплатно). Canvas‑рендер, широкий набор формул.
  - Документация/локализация: часть материалов на китайском/английском; актуальность статей может варьироваться.
  - Когда подходит: OSS‑движок с широким функционалом, если приемлемо инвестировать в интеграцию/локализацию.

- SheetJS (xlsx)
  - Лицензия: Apache‑2.0 (Community Edition в npm — пакет `xlsx`). Подходит для импорта/экспорта XLSX/CSV/ODS и др.
  - Есть SheetJS Pro (платно) с расширенной функциональностью/поддержкой (пароль‑protected книги, расширенные форматы, стриминг и т. п.) — уточняйте на сайте.
  - npm (CE): https://www.npmjs.com/package/xlsx

### Юридические заметки (когда бесплатная недостаточна)
- GPLv3 (HyperFormula): если используете HyperFormula и распространяете закрытое приложение без покупки коммерческой лицензии, вы обязаны распространять исходники под GPLv3. Чтобы этого избежать, берут коммерческую лицензию Handsontable.
- Коммерческие EULA (SpreadJS/Handsontable): учитывайте ограничение на «количество разработчиков/приложений», обновления/поддержку и условия дистрибуции. Для встроенных продуктов/SDK может требоваться отдельная оговорка.

## Сводная таблица лицензий/стоимости

| Библиотека | Лицензия | Бесплатная | Платная опция | Типичные условия |
|---|---|---|---|---|
| Univer | MIT | Да (коммерческое использование разрешено) | Нет (ядро) | Плагины/услуги — отдельно/сообщество |
| SpreadJS | Коммерческая (EULA) | Нет | Да (per‑developer/per‑app; trial) | Включение модулей (Sheets/ExcelIO/Charts) и поддержка зависят от плана |
| Handsontable | Коммерческая | Нет | Да (по разработчикам/организации) | Отличия по поддержке/SLA, условиям использования |
| HyperFormula | GPLv3 или коммерческая | Да (только при GPLv3‑совместимой модели) | Да (коммерческая) | Для закрытых продуктов обычно требуется коммерческая |
| Glide Data Grid | MIT | Да | Нет | Только таблица (Canvas) — формулы/I/O внешними либами |
| FortuneSheet | MIT | Да | Нет | XLSX — community‑плагин (fortuneexcel) |
| Luckysheet | MIT | Да | Нет | OSS, документация местами устаревает |
| SheetJS (xlsx) | Apache‑2.0 (CE) | Да | Да (Pro) | Pro — расширенные форматы/поддержка |

Ссылки на платные планы/лицензии
- SpreadJS Pricing/Buy: https://www.grapecity.com/spreadjs/pricing, https://www.grapecity.com/spreadjs/buy
- Handsontable Pricing: https://handsontable.com/pricing
- HyperFormula (лицензирование через Handsontable): https://hyperformula.handsontable.com/
- SheetJS Pro: https://sheetjs.com/pro/

## Платные планы: ориентиры по фичам и условиям

- SpreadJS (GrapeCity)
  - Модули: Spread.Sheets (ядро/рендер), Spread.ExcelIO (xlsx I/O), Charts, Designer и пр.
  - Что проверить в плане: включён ли ExcelIO и Charts; количество разработчиков; срок обновлений/поддержки (обычно 12 мес.); условия деплоя (per‑app/перепродажа/встраивание).
  - Кому подойдёт платный: когда важна Excel‑совместимость (формулы 400+, outline, условное форматирование), встроенные графики и гарантированный SLA.

- Handsontable + HyperFormula
  - Handsontable: фичи грида обычно одинаковые по планам; отличаются seats/поддержка/SLA/условия размещения.
  - HyperFormula: dual‑license (GPLv3/Commercial). Для закрытых коммерческих продуктов — коммерческая лицензия HF.
  - Кому подойдёт платный: требуется лицензировать формулы без GPL в закрытом коде, нужен контрактная поддержка.

- SheetJS
  - CE (Apache‑2.0): базовый импорт/экспорт XLSX/CSV/ODS.
  - Pro: дополнительные форматы/функции, корпоративная поддержка. Уточняйте на странице Pro.

Примечание: точные фич‑матрицы у вендоров меняются; перед закупкой сверяйтесь с их «Compare plans»/EULA и подтверждайте состав модулей (особенно ExcelIO/Charts у SpreadJS и лицензионную модель HyperFormula).

## Пример: именованные показатели в HyperFormula

Идея: сопоставить метрики с ячейками и использовать формулы без A1‑адресов.

```ts
import { HyperFormula } from 'hyperformula'

const hf = HyperFormula.buildEmpty({ licenseKey: 'gpl-v3' })
// Регистрация именованных выражений
hf.addNamedExpression('churn', '=Sheet1!A2')
hf.addNamedExpression('churn_rate', '=Sheet1!B2')
// Формула в целевой ячейке может быть: =churn*churn_rate
```

В Univer/SpreadJS аналог достигается через Named Ranges/Names.

## Выбор под наш проект
- Если приоритет — минимальные риски и максимум возможностей «как в Excel»: SpreadJS.
- Если приоритет — MIT, активная разработка и Canvas без vendor lock‑in: Univer.
- Если приоритет — кастомный UX с нашей дизайн‑системой и контролируемая кодовая база: Glide Data Grid + HyperFormula (+ SheetJS).

## Что форкать при необходимости
- Univer (dream-num/univer) — активный монорепозиторий, плагины, модульность.
- FortuneSheet (ruilisi/fortune-sheet) — React‑совместимый Canvas‑форк Luckysheet.
- Glide Data Grid (glideapps/glide-data-grid) — канвас‑ядро таблицы; форк пригоден для глубокой кастомизации.

---

Готов дать PoC для двух путей на выбор:
- Univer (MIT): иерархии строк, именованные метрики, базовые форматы, 100k+ строк, CSV/xlsx I/O.
- Glide+HyperFormula: канвас‑редактор с именованными формулами, outline, частичными апдейтами и интеграцией с текущими чарт‑компонентами.
