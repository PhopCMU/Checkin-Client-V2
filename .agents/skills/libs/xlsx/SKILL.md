---
name: xlsx
description: Guidance for using SheetJS (`xlsx`) when project needs lightweight Excel exports/imports.
---

When to use

- Quick client-side read/write of small spreadsheets (export/import).

Steps

- Add `xlsx` (sheetjs) and create a small wrapper in `src/services/exportService.ts`.

Pitfalls

- API surface is low-level; prefer `exceljs` for complex workbook features.

Minimal snippet

```ts
import * as XLSX from "xlsx";

export function exportXlsx(data, filename = "export.xlsx") {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
}
```

## Update notes
