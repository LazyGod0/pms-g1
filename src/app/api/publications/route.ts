import { NextRequest, NextResponse } from "next/server";
import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { db } from "@/configs/firebase-config";

interface Author {
  name: string;
  affiliation?: string;
  email?: string;
  role?: string;
  authorType?: string;
}

interface Attachment {
  name: string;
  path?: string;
  size?: number;
  type?: string;
  uploadedAt?: Date;
}

interface Publication {
  id: string;
  userId: string; // 👈 เพิ่ม userId
  title: string;
  authors: Author[];
  year: number;
  type: "Journal" | "Conference";
  level: "National" | "International";
  status: "draft" | "submitted" | "approved" | "rejected" | "published";
  abstract: string;
  keywords: string[];
  doi: string;
  url: string;
  references: string[];
  attachments: Attachment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export async function POST(request: NextRequest) {
  try {
    const q = query(
      collectionGroup(db, "submissions"),
      where("status", "==", "approved")
    );
    const publications: Publication[] = [];
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Extract userId จาก path
      const pathParts = doc.ref.path.split("/");
      const userId = pathParts[1]; // "users/{userId}/submissions/{submissionId}"

      // Process attachments
      const processedAttachments: Attachment[] = (
        data.attachments?.files || []
      ).map((file: any) => ({
        name: file.name || file.fileName || "Unknown File",
        path: `publications/${doc.id}/${file.name || file.fileName}`,
        size: file.size || 0,
        type: file.type || file.mimeType || "application/octet-stream",
        uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date(),
      }));

      // Structure the data
      const publication: Publication = {
        id: doc.id,
        userId, // 👈 เก็บ userId ไว้ใน object
        title: data.basics?.title || "Untitled",
        authors: data.authors || [],
        year: parseInt(data.basics?.year || "") || new Date().getFullYear(),
        type: data.basics?.type || "Journal",
        level: data.basics?.level || "National",
        status: data.status || "draft",
        abstract: data.basics?.abstract || "",
        keywords: data.basics?.keywords || [],
        doi: data.identifiers?.doi || "",
        url: data.identifiers?.url || "",
        references: data.identifiers?.references || [],
        attachments: processedAttachments,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      publications.push(publication);
    });

    return NextResponse.json(
      {
        success: true,
        data: publications,
        total: publications.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching publications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
