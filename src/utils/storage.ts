import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/configs/firebase-config";

export const getFileDownloadURL = async (filePath: string): Promise<string> => {
  try {
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error("Error getting download URL:", error);
    throw new Error("Failed to get file download URL");
  }
};

export const downloadFile = async (filePath: string, fileName: string) => {
  try {
    const url = await getFileDownloadURL(filePath);
    
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading file:", error);
    alert("Failed to download file. Please try again.");
  }
};