// src/libs/firestore-utils.ts
import { doc, runTransaction } from "firebase/firestore";
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
