import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    // Authorization: `Bearer ${import.meta.env.VITE_API_TJ_KEY}`,
  }
});