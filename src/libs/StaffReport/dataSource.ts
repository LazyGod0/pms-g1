// =============================
// File: /lib/dataSource.ts
// A tiny adapter so you can swap mock <-> Firestore later easily
// =============================
import { Publication } from '@/types/publication';
import { MOCK_PUBLICATIONS } from './mockData';


export type ReportFilters = {
    yearFrom?: number;
    yearTo?: number;
    faculty?: string;
    type?: 'All' | 'Journal' | 'Conference';
    level?: 'All' | 'National' | 'International';
};


export async function fetchPublications(filters: ReportFilters): Promise<Publication[]> {
    // TODO: replace with Firestore query. For now filter the mock.
    const { yearFrom = 2020, yearTo = 2024, faculty, type = 'All', level = 'All' } = filters;
    return MOCK_PUBLICATIONS.filter((p) => (
        p.year >= yearFrom && p.year <= yearTo &&
        (!faculty || faculty === 'All Faculties' || p.faculty === faculty) &&
        (type === 'All' || p.type === type) &&
        (level === 'All' || p.level === level)
    ));
}