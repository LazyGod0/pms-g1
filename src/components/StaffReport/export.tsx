// =============================
// File: /utils/export.ts
// =============================
import { Publication } from "@/types/publication";

export function exportCSV(rows: Publication[]) {
  const header = [
    "Title",
    "Authors",
    "Type",
    "Level",
    "Status",
    "Date",
  ];
  const lines = rows.map((r) => [
    r.title,
    r.authors.join(" | "),
    r.type,
    r.level,
    r.status,
    r.date,
  ]);
  const csv = [header, ...lines]
    .map((row) =>
      row.map((s) => `"${String(s).replaceAll('"', '""')}"`).join(",")
    )
    .join("\n");

  // Add BOM for proper UTF-8 encoding
  const BOM = "\uFEFF";
  const csvWithBOM = BOM + csv;

  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "publications.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF() {
  // Simple print as PDF fallback (works in most browsers)
  window.print();
}
