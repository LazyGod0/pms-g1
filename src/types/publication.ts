import { Timestamp } from "firebase/firestore";

export interface Author {
  name: string;
  affiliation?: string;
  email?: string;
  role?: string;
  authorType?: string;
}

export interface Attachment {
  name: string;
  url?: string;
  path?: string;
  size?: number;
  type?: string;
  uploadedAt?: Date;
}

export interface Publication {
  id: string;
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
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface SearchFiltersType {
  keyword?: string;
}
