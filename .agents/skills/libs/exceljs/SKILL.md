---
name: exceljs
description: Exporting spreadsheets using `exceljs` in client-side code.
---

When to use

- Export structured tabular data to `.xlsx` files for users.

Steps

1. Create `src/services/exportService.ts` to build workbook and rows.
2. Trigger download from a UI action.

Pitfalls

- Large datasets may be slow on the client; consider server-side export for large exports.

Minimal snippet

```ts
import ExcelJS from "exceljs";

export async function exportTable(rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Sheet1");
  ws.addRows(rows);
  const buf = await wb.xlsx.writeBuffer();
  // create blob/download
}
```

## Update notes
