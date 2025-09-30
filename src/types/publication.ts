// =============================
// File: /types/publication.ts
// =============================]
import { ReportFilters } from "@/libs/StaffReport/dataSource";
import { MOCK_PUBLICATIONS } from "@/libs/StaffReport/mockData";

export type PubType = 'Journal' | 'Conference';
export type PubLevel = 'National' | 'International';
export type PubStatus = 'Approved' | 'Pending Review' | 'Needs Fix' | 'Rejected' | 'Draft';

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  faculty: string;
  department: string;
  type: PubType;
  level: PubLevel;
  status: PubStatus;
  date: string; // ISO
  year: number;
};

export async function fetchPublications(filters: ReportFilters): Promise<Publication[]> {
  // TODO: replace with Firestore query. For now filter the mock.
  const { yearFrom = 2020, yearTo = 2024, type = 'All', level = 'All' } = filters;
  return MOCK_PUBLICATIONS.filter((p) => (
    p.year >= yearFrom && p.year <= yearTo &&
    (type === 'All' || p.type === type) &&
    (level === 'All' || p.level === level)
  ));
}
