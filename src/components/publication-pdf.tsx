// app/components/PublicationsPDF.tsx
"use client";

import { Publication } from "@/types/publication";
import React from "react";

interface DashboardData {
  publications: Publication[];
  stats: {
    total: number;
    journals: number;
    conferences: number;
    approved: number;
    rejected: number;
    intl: number;
    natl: number;
  };
  filters: {
    yearFrom: number;
    yearTo: number;
    type: string;
    level: string;
  };
}

export const PublicationsPDF = ({
  dashboardData,
}: {
  dashboardData: DashboardData;
}) => {
  // Only import react-pdf components on client side
  const [components, setComponents] = React.useState<any>(null);

  React.useEffect(() => {
    const loadComponents = async () => {
      if (typeof window !== "undefined") {
        const { Document, Page, Text, View, StyleSheet } = await import(
          "@react-pdf/renderer"
        );

        setComponents({ Document, Page, Text, View, StyleSheet });
      }
    };

    loadComponents();
  }, []);

  if (!components) {
    return null; // Return null during SSR
  }

  const { Document, Page, Text, View, StyleSheet } = components;

  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      padding: 30,
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

  const { publications, stats, filters } = dashboardData;

  // Calculate chart data
  const publicationsByYear = publications.reduce((acc, pub) => {
    const year = new Date(pub.date).getFullYear();
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const publicationsByType = publications.reduce((acc, pub) => {
    acc[pub.type] = (acc[pub.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const publicationsByLevel = publications.reduce((acc, pub) => {
    acc[pub.level] = (acc[pub.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Publications Dashboard Report</Text>
        <Text style={styles.subHeader}>
          Generated on {new Date().toLocaleDateString()} - Approved and Rejected
          Publications
        </Text>

        {/* Filters Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applied Filters</Text>
          <View style={styles.filtersContainer}>
            <Text style={styles.filterItem}>
              Year: {filters.yearFrom} - {filters.yearTo}
            </Text>
            <Text style={styles.filterItem}>Type: {filters.type}</Text>
            <Text style={styles.filterItem}>Level: {filters.level}</Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.journals}</Text>
              <Text style={styles.statLabel}>Journals</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.conferences}</Text>
              <Text style={styles.statLabel}>Conferences</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.approved}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>
        </View>

        {/* Charts Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publications Analysis</Text>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Publications by Year:</Text>
            {Object.entries(publicationsByYear)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([year, count]) => (
                <Text key={year} style={styles.chartData}>
                  {year}: {count} publications
                </Text>
              ))}
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Publications by Type:</Text>
            {Object.entries(publicationsByType).map(([type, count]) => (
              <Text key={type} style={styles.chartData}>
                {type}: {count} publications
              </Text>
            ))}
          </View>

          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Publications by Level:</Text>
            {Object.entries(publicationsByLevel).map(([level, count]) => (
              <Text key={level} style={styles.chartData}>
                {level}: {count} publications
              </Text>
            ))}
          </View>
        </View>
      </Page>

      {/* Publications Table on separate page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Publications Details</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {["Title", "Authors", "Type", "Level", "Status", "Date"].map(
              (head) => (
                <View style={styles.tableColHeader} key={head}>
                  <Text style={styles.tableCellHeader}>{head}</Text>
                </View>
              )
            )}
          </View>
          {publications.map((pub, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{pub.title}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{pub.authors.join(", ")}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{pub.type}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{pub.level}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{pub.status}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{pub.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
