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

export interface Publication {
    id: string;
    title: string;
    titleEn?: string;
    authors: Author[];
    year: number;
    type: "Journal" | "Conference" | "Book" | "Thesis" | "Chapter" | "Patent";
    level: "National" | "International" | "Local";
    status: "Published" | "Accepted" | "Under Review" | "Draft";

    // Publication details
    abstract?: string;
    abstractEn?: string;
    keywords?: string[];
    keywordsEn?: string[];
    doi?: string;
    isbn?: string;
    issn?: string;

    // Journal/Conference specific
    journal?: string;
    conference?: string;
    publisher?: string;
    volume?: string;
    issue?: string;
    pages?: string;

    // Dates
    publishedDate?: Date;
    submissionDate?: Date;
    acceptanceDate?: Date;

    // Files and attachments
    attachments?: Attachment[];

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isPublic: boolean;

    // Additional fields
    citationCount?: number;
    impactFactor?: number;
    quartile?: "Q1" | "Q2" | "Q3" | "Q4";
    scopusId?: string;
    wosId?: string;
}

export interface Author {
    id?: string;
    name: string;
    nameEn?: string;
    email?: string;
    affiliation?: string;
    affiliationEn?: string;
    isCorresponding?: boolean;
    order: number;
    orcid?: string;
}

export interface Attachment {
    id: string;
    name: string;
    originalName: string;
    url: string;
    type: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
    uploadedBy: string;
    isPublic: boolean;
}

export interface PublicationSearchFilters {
    keyword?: string;
    author?: string;
    yearFrom?: number;
    yearTo?: number;
    type?: string | "All";
    level?: string | "All";
    status?: string | "All";
    isPublic?: boolean;
}

export interface PublicationCreateRequest {
    title: string;
    titleEn?: string;
    authors: Omit<Author, 'id'>[];
    year: number;
    type: Publication['type'];
    level: Publication['level'];
    abstract?: string;
    abstractEn?: string;
    keywords?: string[];
    keywordsEn?: string[];
    doi?: string;
    isbn?: string;
    issn?: string;
    journal?: string;
    conference?: string;
    publisher?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    publishedDate?: string;
    isPublic: boolean;
}

export interface PublicationUpdateRequest extends Partial<PublicationCreateRequest> {
    id: string;
}
