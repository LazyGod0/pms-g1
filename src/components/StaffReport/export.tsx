// =============================
// File: /utils/export.ts
// =============================
import { Publication } from "@/types/publication";
import {
  pdf,
  Font,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export function exportCSV(rows: Publication[]) {
  const header = ["Title", "Authors", "Type", "Level", "Status", "Date"];
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

export async function exportPDF(
  rows: Publication[],
  stats: {
    total: number;
    journals: number;
    conferences: number;
    approved: number;
    rejected: number;
    intl: number;
    natl: number;
  },
  filters: {
    yearFrom: number;
    yearTo: number;
    type: string;
    level: string;
  }
) {
  // Ensure we're on client-side
  if (typeof window === "undefined") return;

  try {
    Font.register({
      family: "Sarabun",
      fonts: [
        { src: "/fonts/Sarabun-Regular.ttf", fontWeight: "normal" },
        { src: "/fonts/Sarabun-Bold.ttf", fontWeight: "bold" },
      ],
    });

    // Helper function to format date
    const formatDate = (date: any) => {
      if (!date) return "N/A";
      if (date instanceof Date) return date.toLocaleDateString();
      if (typeof date === "string") return new Date(date).toLocaleDateString();
      return String(date);
    };

    // Helper function to format authors
    const formatAuthors = (authors: any) => {
      if (!authors) return "N/A";
      if (Array.isArray(authors)) return authors.join(", ");
      return String(authors);
    };

    // Calculate chart data - Fixed publicationsByYear
    const publicationsByYear = rows.reduce((acc, pub) => {
      let year: number;

      year = pub.year;

      // Only count if year is valid
      if (!isNaN(year) && year > 1900) {
        acc[year] = (acc[year] || 0) + 1;
      }

      return acc;
    }, {} as Record<number, number>);

    const publicationsByType = rows.reduce((acc, pub) => {
      const type = pub.type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const publicationsByLevel = rows.reduce((acc, pub) => {
      const level = pub.level || "Unknown";
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const styles = StyleSheet.create({
      page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        padding: 30,
        fontFamily: "Sarabun", // 👈 apply globally
        fontSize: 10, // optional default size
      },
      header: {
        fontSize: 20,
        marginBottom: 10,
        textAlign: "center",
        fontWeight: "bold",
      },
      subHeader: {
        fontSize: 12,
        marginBottom: 20,
        textAlign: "center",
        color: "#666",
      },
      section: {
        marginBottom: 20,
      },
      sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
      },
      filtersContainer: {
        flexDirection: "row",
        marginBottom: 15,
        padding: 10,
        backgroundColor: "#f8f9fa",
        borderRadius: 5,
      },
      filterItem: {
        marginRight: 15,
        fontSize: 10,
      },
      statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
      },
      statCard: {
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 5,
        minWidth: 80,
        alignItems: "center",
      },
      statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1976d2",
      },
      statLabel: {
        fontSize: 10,
        color: "#666",
        marginTop: 2,
      },
      table: {
        display: "flex",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
      },
      tableRow: {
        flexDirection: "row",
      },
      tableColHeader: {
        width: "16.66%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        backgroundColor: "#e3f2fd",
        padding: 5,
      },
      tableCol: {
        width: "16.66%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5,
      },
      tableCellHeader: {
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center",
      },
      tableCell: {
        fontSize: 8,
        textAlign: "left",
      },
      chartSection: {
        marginBottom: 20,
      },
      chartTitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 8,
      },
      chartData: {
        fontSize: 10,
        marginBottom: 5,
      },
    });

    // Create the PDF document inline
    const MyDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>รายงานแดชบอร์ดผลงานตีพิมพ์</Text>
          <Text style={styles.subHeader}>
            สร้างเมื่อ {new Date().toLocaleDateString()} -
            ผลงานตีพิมพ์ที่อนุมัติและไม่อนุมัติ
          </Text>

          {/* ส่วนกรองข้อมูล */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ตัวกรองที่เลือก</Text>
            <View style={styles.filtersContainer}>
              <Text style={styles.filterItem}>
                ปี: {filters.yearFrom} - {filters.yearTo}
              </Text>
              <Text style={styles.filterItem}>ประเภท: {filters.type}</Text>
              <Text style={styles.filterItem}>ระดับ: {filters.level}</Text>
            </View>
          </View>

          {/* ส่วนสถิติ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>สถิติภาพรวม</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>ทั้งหมด</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.journals}</Text>
                <Text style={styles.statLabel}>วารสาร</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.conferences}</Text>
                <Text style={styles.statLabel}>การประชุมวิชาการ</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.approved}</Text>
                <Text style={styles.statLabel}>อนุมัติ</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.rejected}</Text>
                <Text style={styles.statLabel}>ไม่อนุมัติ</Text>
              </View>
            </View>
          </View>

          {/* ส่วนการวิเคราะห์ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>การวิเคราะห์ผลงานตีพิมพ์</Text>

            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>ผลงานตีพิมพ์ตามปี:</Text>
              {Object.entries(publicationsByYear).length > 0 ? (
                Object.entries(publicationsByYear)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([year, count]) => (
                    <Text key={year} style={styles.chartData}>
                      {year}: {count} เรื่อง
                    </Text>
                  ))
              ) : (
                <Text style={styles.chartData}>ไม่มีข้อมูล</Text>
              )}
            </View>

            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>ผลงานตีพิมพ์ตามประเภท:</Text>
              {Object.entries(publicationsByType).map(([type, count]) => (
                <Text key={type} style={styles.chartData}>
                  {type}: {count} เรื่อง
                </Text>
              ))}
            </View>

            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>ผลงานตีพิมพ์ตามระดับ:</Text>
              {Object.entries(publicationsByLevel).map(([level, count]) => (
                <Text key={level} style={styles.chartData}>
                  {level}: {count} เรื่อง
                </Text>
              ))}
            </View>
          </View>
        </Page>

        {/* ตารางผลงานตีพิมพ์ในอีกหน้า */}
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>รายละเอียดผลงานตีพิมพ์</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {[
                "ชื่อเรื่อง",
                "ผู้เขียน",
                "ประเภท",
                "ระดับ",
                "สถานะ",
                "วันที่",
              ].map((head) => (
                <View style={styles.tableColHeader} key={head}>
                  <Text style={styles.tableCellHeader}>{head}</Text>
                </View>
              ))}
            </View>
            {rows.map((pub, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {pub.title || "ไม่มีข้อมูล"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {formatAuthors(pub.authors)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {pub.type || "ไม่มีข้อมูล"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {pub.level || "ไม่มีข้อมูล"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {pub.status || "ไม่มีข้อมูล"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{formatDate(pub.date)}</Text>
                </View>
              </View>
            ))}
          </View>
        </Page>
      </Document>
    );

    const asPdf = pdf(<MyDocument />);
    const blob = await asPdf.toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard-report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    alert("Failed to export PDF. Please try again.");
  }
}
