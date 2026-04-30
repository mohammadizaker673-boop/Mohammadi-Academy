import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from './firebase';

export type FileType = 'image' | 'video' | 'pdf' | 'audio' | 'document';

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  downloadURL?: string;
  error?: string;
}

export interface FileValidation {
  maxSize: number; // in bytes
  allowedTypes: string[];
}

// File size limits (in MB)
export const FILE_LIMITS = {
  image: 10, // 10MB
  video: 500, // 500MB
  pdf: 50, // 50MB
  audio: 100, // 100MB
  document: 50, // 50MB
};

// Allowed MIME types
export const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  pdf: ['application/pdf'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

/**
 * Validate file before upload
 */
export function validateFile(file: File, fileType: FileType): { valid: boolean; error?: string } {
  const maxSizeBytes = FILE_LIMITS[fileType] * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${FILE_LIMITS[fileType]}MB`,
    };
  }

  if (!ALLOWED_TYPES[fileType].includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES[fileType].join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename with timestamp
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-');
  return `${nameWithoutExt}-${timestamp}-${randomStr}.${extension}`;
}

/**
 * Upload file to Firebase Storage with progress tracking
 */
export function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = generateFileName(file.name);
    const storageRef = ref(storage, `${path}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress({
            progress,
            status: 'uploading',
          });
        }
      },
      (error) => {
        if (onProgress) {
          onProgress({
            progress: 0,
            status: 'error',
            error: error.message,
          });
        }
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (onProgress) {
            onProgress({
              progress: 100,
              status: 'completed',
              downloadURL,
            });
          }
          resolve(downloadURL);
        } catch (error: any) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Upload file with validation
 */
export async function uploadFileWithValidation(
  file: File,
  fileType: FileType,
  folder: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const validation = validateFile(file, fileType);
  
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const path = `${folder}/${fileType}s`;
  const uploadPromise = uploadFile(file, path, onProgress);
  const timeoutMs = 30000;
  const timeoutPromise = new Promise<string>((_, reject) => {
    setTimeout(() => reject(new Error('Upload timed out. Please try again.')), timeoutMs);
  });
  return Promise.race([uploadPromise, timeoutPromise]);
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * List all files in a folder
 */
export async function listFiles(folderPath: string): Promise<string[]> {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    
    const urls = await Promise.all(
      result.items.map((itemRef) => getDownloadURL(itemRef))
    );
    
    return urls;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
}

/**
 * Get file size from URL
 */
export function getFileSizeFromUrl(file: File): string {
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  return `${sizeInMB} MB`;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Determine file type from MIME type
 */
export function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'document';
}
