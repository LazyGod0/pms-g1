import {
  collectionGroup,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/configs/firebase-config';

/** === Filters from the Report page === */
export type ReportFilters = {
  yearFrom: number;
  yearTo: number;
  //faculty: string;  // "All Faculties" | "<faculty name>"
  type: string;     // "All" | "Journal" | "Conference" | ...
  level: string;    // "All" | "National" | "International" | ...
};

/** === Row shape expected by your components === */
export type Publication = {
  id: string;              // submission id (sid)
  uid: string;             // parent user id
  path: string;            // full firestore path users/{uid}/submissions/{sid}

  title: string;
  year: number | null;
  type: string | null;
  level: string | null;

  // faculty: string | null;
  department: string | null;

  status: 'Submitted' | 'Approved' | 'Rejected' | 'Unknown';

  date?: Date;             // used by charts/tables; from submittedAt or createdAt
  authors?: Array<{ name?: string; email?: string }>;
};

// --- utils ---
const tsToDate = (t?: Timestamp | null) =>
  t && typeof (t as any).toDate === 'function' ? (t as Timestamp).toDate() : undefined;

const toNum = (v: any): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const mapStatus = (raw?: string): Publication['status'] => {
  switch ((raw ?? '').toLowerCase()) {
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'submitted': return 'Submitted';
    default: return 'Unknown';
  }
};

/**
 * Fetch submissions across all users and map to `Publication[]`
 * in the exact shape your components expect.
 *
 * NOTE on indexes:
 *  Equality filters on basics.type/level/faculty with orderBy('basics.year')
 *  may require a composite index. If Firestore shows an index error link,
 *  click it to create the index.
 */
export async function fetchPublications(filters: ReportFilters): Promise<Publication[]> {
  const constraints: QueryConstraint[] = [];

  // Push selective equality filters server-side where possible
  if (filters.type !== 'All') {
    constraints.push(where('basics.type', '==', filters.type));
  }
  if (filters.level !== 'All') {
    constraints.push(where('basics.level', '==', filters.level));
  }
  // if (filters.faculty !== 'All Faculties') {
  //   constraints.push(where('faculty', '==', filters.faculty));
  // }

  // Order by year (may be string in some docs; we'll coerce later)
  constraints.push(orderBy('basics.year', 'desc'));

  const q = query(collectionGroup(db, 'submissions'), ...constraints);
  const snap = await getDocs(q);
  console.log(snap)
  const rows: Publication[] = snap.docs.map((ds) => {
    // users/{uid}/submissions/{sid}
    const seg = ds.ref.path.split('/');
    const uid = seg[1] || '';
    const sid = seg[3] || '';

    const d: any = ds.data() || {};
    const basics = d.basics || {};
    const date = tsToDate(d.submittedAt) ?? tsToDate(d.createdAt);

    return {
      id: sid,
      uid,
      path: ds.ref.path,

      title: basics.title ?? d.title ?? 'Untitled',
      year: toNum(basics.year),
      type: basics.type ?? null,
      level: basics.level ?? null,

      // faculty: d.faculty ?? null,
      department: d.department ?? null, // ← If department lives on the user doc, see note below.

      status: mapStatus(d.status),

      date,
      authors: Array.isArray(d.authors)
        ? d.authors.map((a: any) => ({ name: a?.name, email: a?.email }))
        : undefined,
    };
  });
  console.log(rows)
  // Client-side year range filter (robust to mixed types)
  const filtered = rows.filter((r) => {
    const inYear = r.year !== null && r.year >= filters.yearFrom && r.year <= filters.yearTo;
    // const inFaculty =
    //   filters.faculty === 'All Faculties' || (r.faculty ?? '') === filters.faculty;
    const inType = filters.type === 'All' || (r.type ?? '') === filters.type;
    const inLevel = filters.level === 'All' || (r.level ?? '') === filters.level;
    return inYear && inType && inLevel;
  });

  // Stable sort (desc year, then title)
  filtered.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));

  return filtered;
}

/* ============================
   If department is on the parent user doc
   ============================
   1) Add this helper:

import { doc, getDoc } from 'firebase/firestore';

async function getUserDepartment(uid: string): Promise<string | null> {
  const userSnap = await getDoc(doc(db, 'users', uid));
  return (userSnap.exists() ? (userSnap.data() as any)?.department : null) ?? null;
}

   2) After building `rows`, do:

for (const r of rows) {
  if (!r.department) {
    r.department = await getUserDepartment(r.uid);
  }
}

   This adds one extra read per unique user (you can cache results by uid
   if needed).
*/
