export enum role {
  admin = "Admin",
  staff = "Staff",
  lecturer = "Lecturer",
  normal = "Normal",
}

export type User = {
  id?: string;
  email: string;
  department: string;
  faculty: string;
  name: string;
  phone: string;
  role: role;
  createdAt?: any;
  updatedAt?: any;
}