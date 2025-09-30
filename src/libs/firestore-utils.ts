// src/libs/firestore-utils.ts
import { doc, runTransaction, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/configs/firebase-config";

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
