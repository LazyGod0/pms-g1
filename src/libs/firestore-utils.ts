// src/libs/firestore-utils.ts
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
    Timestamp,
    serverTimestamp,
    runTransaction
} from 'firebase/firestore';
import { db } from '@/configs/firebase-config';
import { Publication, PublicationSearchFilters, PublicationCreateRequest, PublicationUpdateRequest } from '@/types/submission';

// โครงเอกสารตัวนับ
type CounterDoc = { tempSeq?: number };

/** คืนค่า id รูปแบบ temp0001, temp0002 ... ต่อผู้ใช้แต่ละคน */
export async function getNextTempId(uid: string): Promise<string> {
  const counterRef = doc(db, "users", uid, "submissions", "_counters");

  const nextNum = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);

    // หลีกเลี่ยง any โดยอ่านฟิลด์ที่ระบุชื่อชัดเจนและแคสต์เป็น type ที่กำหนดเอง
    let current = 0;
    if (snap.exists()) {
      const data = snap.data() as CounterDoc | undefined;
      current = typeof data?.tempSeq === "number" ? data.tempSeq : 0;
      // หรือจะใช้ snap.get('tempSeq') ก็ได้:
      // current = typeof snap.get("tempSeq") === "number" ? (snap.get("tempSeq") as number) : 0;
    }

    const next = current + 1;
    tx.set(counterRef, { tempSeq: next }, { merge: true });
    return next;
  });

  return `temp${String(nextNum).padStart(4, "0")}`;
}

/** ตรวจสอบว่ามีผลงานตีพิมพ์ซ้ำกันหรือไม่ */
export async function checkDuplicatePublication(
  uid: string,
  title: string,
  year: string,
  excludeDocId?: string
): Promise<boolean> {
  try {
    // ตรวจสอบ input
    if (!uid || !title.trim() || !year.trim()) {
      console.warn("⚠️ Invalid input for duplicate check:", { uid, title, year });
      return false;
    }

    const normalizedTitle = title.trim().toLowerCase();
    const normalizedYear = year.trim();

    console.log("🔍 Checking duplicate publication:", {
      uid,
      normalizedTitle,
      normalizedYear,
      excludeDocId
    });

    const submissionsRef = collection(db, "users", uid, "submissions");

    // ดึงข้อมูลทั้งหมดแล้วตรวจสอบ manual เพื่อให้แน่ใจ
    const allSubmissions = await getDocs(submissionsRef);

    console.log("📊 Total documents found:", allSubmissions.size);

    let duplicateFound = false;
    const duplicates: any[] = [];

    allSubmissions.forEach((doc) => {
      // ข้าม document ที่ exclude (สำหรับกรณีแก้ไข)
      if (excludeDocId && doc.id === excludeDocId) {
        console.log("⏭️ Skipping excluded document:", doc.id);
        return;
      }

      const data = doc.data();

      // ตรวจสอบว่ามี basics และข้อมูลครบถ้วน
      if (!data.basics || !data.basics.title || !data.basics.year) {
        return;
      }

      const docTitle = data.basics.title.trim().toLowerCase();
      const docYear = data.basics.year.trim();

      console.log("📄 Checking document:", {
        id: doc.id,
        docTitle,
        docYear,
        normalizedTitle,
        normalizedYear,
        titleMatch: docTitle === normalizedTitle,
        yearMatch: docYear === normalizedYear,
        status: data.status
      });

      // ตรวจสอบการซ้ำซ้อน (case-insensitive สำหรับชื่อเรื่อง)
      if (docTitle === normalizedTitle && docYear === normalizedYear) {
        console.log("⚠️ Found duplicate:", {
          id: doc.id,
          title: data.basics.title,
          year: data.basics.year,
          status: data.status
        });

        duplicateFound = true;
        duplicates.push({
          id: doc.id,
          title: data.basics.title,
          year: data.basics.year,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      }
    });

    if (duplicateFound) {
      console.log("❌ DUPLICATE DETECTED!");
      console.log("⚠️ Total duplicates found:", duplicates.length);
      console.log("⚠️ Duplicate details:", duplicates);
      console.log("🚫 Blocking submission/save due to duplicate publication");
      return true;
    }

    console.log("✅ No duplicate found - safe to proceed");
    return false;

  } catch (error) {
    console.error("❌ Error checking duplicate publication:", error);
    // เปลี่ยนจาก return false เป็น throw error เพื่อให้รู้ว่ามีปัญหา
    throw new Error(`Failed to check duplicate: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** ตรวจสอบการซ้ำซ้อนในทุก collection ของระบบ */
export async function checkGlobalDuplicatePublication(
  title: string,
  year: string,
  excludeUid?: string
): Promise<{ isDuplicate: boolean; duplicateInfo?: { userId: string; docId: string } }> {
  try {
    // หากมี collection ส่วนกลางสำหรับผลงานที่ approved แล้ว
    // สามารถตรวจสอบได้ที่นี่

    // ตัวอย่างการตรวจสอบจาก collection หลัก (หากมี)
    // const globalQuery = query(
    //   collection(db, "publications"),
    //   where("title", "==", title),
    //   where("year", "==", year)
    // );

    return { isDuplicate: false };
  } catch (error) {
    console.error("Error checking global duplicate publication:", error);
    return { isDuplicate: false };
  }
}

// Collection reference
const PUBLICATIONS_COLLECTION = 'publications';

// Helper function to convert Firestore data to Publication type
export const convertFirestoreToPublication = (doc: any): Publication => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        publishedDate: data.publishedDate?.toDate(),
        submissionDate: data.submissionDate?.toDate(),
        acceptanceDate: data.acceptanceDate?.toDate(),
        attachments: data.attachments?.map((att: any) => ({
            ...att,
            uploadedAt: att.uploadedAt?.toDate() || new Date(),
        })) || [],
    } as Publication;
};

// Get all public publications
export const getPublicPublications = async (): Promise<Publication[]> => {
    try {
        const q = query(
            collection(db, PUBLICATIONS_COLLECTION),
            where('isPublic', '==', true),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const publications: Publication[] = [];

        querySnapshot.forEach((doc) => {
            publications.push(convertFirestoreToPublication(doc));
        });

        return publications;
    } catch (error) {
        console.error('Error fetching public publications:', error);
        throw error;
    }
};

// Search publications with filters
export const searchPublications = async (filters: PublicationSearchFilters): Promise<Publication[]> => {
    try {
        let q = query(
            collection(db, PUBLICATIONS_COLLECTION),
            where('isPublic', '==', filters.isPublic !== false)
        );

        // Apply Firestore filters
        if (filters.type && filters.type !== 'All') {
            q = query(q, where('type', '==', filters.type));
        }

        if (filters.level && filters.level !== 'All') {
            q = query(q, where('level', '==', filters.level));
        }

        if (filters.status && filters.status !== 'All') {
            q = query(q, where('status', '==', filters.status));
        }

        if (filters.yearFrom) {
            q = query(q, where('year', '>=', filters.yearFrom));
        }

        if (filters.yearTo) {
            q = query(q, where('year', '<=', filters.yearTo));
        }

        q = query(q, orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(q);
        let publications: Publication[] = [];

        querySnapshot.forEach((doc) => {
            publications.push(convertFirestoreToPublication(doc));
        });

        // Apply client-side filters for text search
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            publications = publications.filter(pub =>
                pub.title.toLowerCase().includes(keyword) ||
                pub.titleEn?.toLowerCase().includes(keyword) ||
                pub.abstract?.toLowerCase().includes(keyword) ||
                pub.abstractEn?.toLowerCase().includes(keyword) ||
                pub.keywords?.some(k => k.toLowerCase().includes(keyword)) ||
                pub.keywordsEn?.some(k => k.toLowerCase().includes(keyword)) ||
                pub.authors.some(author => author.name.toLowerCase().includes(keyword))
            );
        }

        if (filters.author) {
            const authorName = filters.author.toLowerCase();
            publications = publications.filter(pub =>
                pub.authors.some(author =>
                    author.name.toLowerCase().includes(authorName) ||
                    author.nameEn?.toLowerCase().includes(authorName)
                )
            );
        }

        return publications;
    } catch (error) {
        console.error('Error searching publications:', error);
        throw error;
    }
};

// Get publication by ID
export const getPublicationById = async (id: string): Promise<Publication | null> => {
    try {
        const docRef = doc(db, PUBLICATIONS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return convertFirestoreToPublication(docSnap);
    } catch (error) {
        console.error('Error fetching publication by ID:', error);
        throw error;
    }
};

// Create new publication
export const createPublication = async (data: PublicationCreateRequest, userId: string): Promise<string> => {
    try {
        const publicationData = {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            publishedDate: data.publishedDate ? Timestamp.fromDate(new Date(data.publishedDate)) : null,
            submissionDate: serverTimestamp(),
            status: 'Draft' as const,
            attachments: [],
            citationCount: 0,
        };

        const docRef = await addDoc(collection(db, PUBLICATIONS_COLLECTION), publicationData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating publication:', error);
        throw error;
    }
};

// Update publication
export const updatePublication = async (data: PublicationUpdateRequest): Promise<void> => {
    try {
        const { id, ...updateData } = data;
        const docRef = doc(db, PUBLICATIONS_COLLECTION, id);

        const updatePayload = {
            ...updateData,
            updatedAt: serverTimestamp(),
            publishedDate: updateData.publishedDate ? Timestamp.fromDate(new Date(updateData.publishedDate)) : undefined,
        };

        // Remove undefined values
        Object.keys(updatePayload).forEach(key => {
            if (updatePayload[key as keyof typeof updatePayload] === undefined) {
                delete updatePayload[key as keyof typeof updatePayload];
            }
        });

        await updateDoc(docRef, updatePayload);
    } catch (error) {
        console.error('Error updating publication:', error);
        throw error;
    }
};

// Delete publication
export const deletePublication = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, PUBLICATIONS_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting publication:', error);
        throw error;
    }
};

// Get publication statistics
export const getPublicationStats = async () => {
    try {
        const publicationsQuery = query(
            collection(db, PUBLICATIONS_COLLECTION),
            where('isPublic', '==', true)
        );

        const querySnapshot = await getDocs(publicationsQuery);
        const publications: Publication[] = [];

        querySnapshot.forEach((doc) => {
            publications.push(convertFirestoreToPublication(doc));
        });

        const stats = {
            total: publications.length,
            journal: publications.filter(p => p.type === 'Journal').length,
            conference: publications.filter(p => p.type === 'Conference').length,
            book: publications.filter(p => p.type === 'Book').length,
            thesis: publications.filter(p => p.type === 'Thesis').length,
            international: publications.filter(p => p.level === 'International').length,
            national: publications.filter(p => p.level === 'National').length,
            published: publications.filter(p => p.status === 'Published').length,
            underReview: publications.filter(p => p.status === 'Under Review').length,
        };

        return stats;
    } catch (error) {
        console.error('Error getting publication stats:', error);
        throw error;
    }
};
