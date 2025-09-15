export const ACTIVE_STEP = 0; // 0: Basics, 1: Authors, 2: Identifiers, 3: Attachments
interface Author {
  name: string;
  affiliation?: string;
  email?: string;
}

export const MOCK = {
  basics: {
    title: "",
    year: "",
    type: "",
    level: "",
    keywords: [] as string[],
    abstract: "",
  },
  authors: [] as Author[],
  identifiers: {
    doi: "",
    url: "",
    references: [] as string[],
  },
  files: [] as File[],
};
export const PROGRESS_BY_STEP = [0, 25, 50, 75];
export const PROGRESS = PROGRESS_BY_STEP[ACTIVE_STEP];
