export type Author = {
  name: string;
  affiliation: string;
  email: string;
  role?: "Author" | "Co-Author" | "Corresponding";
  authorType?: "Internal" | "External";
};

export type Basics = {
  title: string;                 // *
  type: "Journal" | "Conference" | ""; // *
  level: "National" | "International" | ""; // *
  year: string;                  // *
  abstract: string;              // *
  keywords: string[];            // *
};

export type ReferenceItem = {
  title: string;                 // *
  authors: string;               // *
  year: string;                  // *
  link?: string;                 // doi หรือ url
};

export type Identifiers = {
  doi?: string;
  url?: string;
  references?: ReferenceItem[];
};

export type AttachedFile = {
  name: string;                  // ชื่อไฟล์ต้นฉบับ
  url: string;                   // Download URL จาก Firebase Storage
  size: number;                  // ขนาดไฟล์ในไบต์
  type: string;                  // MIME type
  path: string;                  // path ใน Firebase Storage สำหรับการลบ
  uploadedAt: string;            // วันที่อัปโหลด (ISO string)
};

export type Attachments = {
  files: AttachedFile[];         // เก็บข้อมูลไฟล์ที่สมบูรณ์
};

export type SubmissionForm = {
  basics: Basics;
  authors: Author[];
  identifiers: Identifiers;
  attachments: Attachments;
};
