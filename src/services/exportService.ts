// Minimal export service stubs used by skills/examples.
// These are intentionally lightweight placeholders — install and wire the chosen library
// (exceljs or xlsx) when implementing production exports.

export async function exportXlsx(rows: any[], filename = "export.xlsx") {
  // Placeholder: implement with SheetJS (xlsx) or exceljs.
  // Example using SheetJS or exceljs can be added here.
  console.warn(
    "exportXlsx called — implement with xlsx or exceljs for real exports",
  );
  return Promise.resolve();
}

export async function exportExceljs(rows: any[], filename = "export.xlsx") {
  console.warn(
    "exportExceljs called — implement with exceljs for real exports",
  );
  return Promise.resolve();
}
