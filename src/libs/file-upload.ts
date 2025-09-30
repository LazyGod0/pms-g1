// src/libs/file-upload.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/configs/firebase-config";

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
  path: string;
  uploadedAt: string;
}

export interface UploadProgress {
  progress: number;
  fileName: string;
  status: 'uploading' | 'completed' | 'error';
}

/**
 * อัปโหลดไฟล์ไปยัง Firebase Storage
 */
export async function uploadPublicationFile(
  file: File,
  uid: string,
  submissionId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  try {
    // ตรวจสอบขนาดไฟล์ (สูงสุด 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`ไฟล์ ${file.name} มีขนาดเกิน 10MB (ขนาดปัจจุบัน: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    // ตรวจสอบชนิดไฟล์
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`ชนิดไฟล์ ${file.type} ไม่ได้รับอนุญาต กรุณาอัปโหลดไฟล์ PDF, DOC, DOCX, ZIP, JPG, PNG หรือ TXT`);
    }

    // สร้าง path สำหรับเก็บไฟล์
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `publications/${uid}/${submissionId}/${timestamp}_${sanitizedFileName}`;

    // สร้าง reference
    const fileRef = ref(storage, filePath);

    // แจ้งเริ่มอัปโหลด
    if (onProgress) {
      onProgress({
        progress: 0,
        fileName: file.name,
        status: 'uploading'
      });
    }

    // อัปโหลดไฟล์
    console.log(`📤 Uploading file: ${file.name} to ${filePath}`);
    const snapshot = await uploadBytes(fileRef, file);

    // แจ้งอัปโหลดสำเร็จ 50%
    if (onProgress) {
      onProgress({
        progress: 50,
        fileName: file.name,
        status: 'uploading'
      });
    }

    // ดึง download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // แจ้งเสร็จสิ้น
    if (onProgress) {
      onProgress({
        progress: 100,
        fileName: file.name,
        status: 'completed'
      });
    }

    const uploadedFile: UploadedFile = {
      name: file.name,
      url: downloadURL,
      size: file.size,
      type: file.type,
      path: filePath,
      uploadedAt: new Date().toISOString()
    };

    console.log(`✅ File uploaded successfully:`, uploadedFile);
    return uploadedFile;

  } catch (error) {
    console.error(`❌ Upload error for ${file.name}:`, error);

    if (onProgress) {
      onProgress({
        progress: 0,
        fileName: file.name,
        status: 'error'
      });
    }

    throw error;
  }
}

/**
 * อัปโหลดหลายไฟล์พร้อมกัน
 */
export async function uploadMultipleFiles(
  files: File[],
  uid: string,
  submissionId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile[]> {
  const uploadedFiles: UploadedFile[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const uploadedFile = await uploadPublicationFile(
        file,
        uid,
        submissionId,
        (progress) => {
          if (onProgress) {
            // คำนวณ progress รวม
            const overallProgress = {
              ...progress,
              progress: Math.round(((i * 100) + progress.progress) / files.length)
            };
            onProgress(overallProgress);
          }
        }
      );
      uploadedFiles.push(uploadedFile);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`${file.name}: ${errorMsg}`);
      console.error(`Failed to upload ${file.name}:`, error);
    }
  }

  if (errors.length > 0) {
    throw new Error(`ไฟล์บางไฟล์อัปโหลดไม่สำเร็จ:\n${errors.join('\n')}`);
  }

  return uploadedFiles;
}

/**
 * ลบไฟล์จาก Firebase Storage
 */
export async function deletePublicationFile(filePath: string): Promise<void> {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    console.log(`🗑️ File deleted successfully: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error deleting file ${filePath}:`, error);
    throw error;
  }
}

/**
 * ลบหลายไฟล์พร้อมกัน
 */
export async function deleteMultipleFiles(filePaths: string[]): Promise<void> {
  const deletePromises = filePaths.map(path => deletePublicationFile(path));
  await Promise.all(deletePromises);
}

/**
 * ตรวจสอบขนาดไฟล์ที่อนุญาต
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * ตรวจสอบชนิดไฟล์ที่อนุญาต
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'text/plain'
  ];
  return allowedTypes.includes(file.type);
}

/**
 * แปลงขนาดไฟล์เป็นสตริง
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
