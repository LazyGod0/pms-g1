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

export type Attachments = {
  files: string[];               // เก็บชื่อไฟล์/URL
};

export type SubmissionForm = {
  basics: Basics;
  authors: Author[];
  identifiers: Identifiers;
  attachments: Attachments;
};
