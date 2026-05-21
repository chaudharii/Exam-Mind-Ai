// firebase/storage.ts
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
  getStorage,
} from "firebase/storage";
import app from "./config";

const storage = getStorage(app);

// Upload file with progress tracking
export function uploadFileWithProgress(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}

// Simple upload
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

// Upload syllabus PDF
export async function uploadSyllabus(uid: string, file: File): Promise<string> {
  const path = `syllabi/${uid}/${Date.now()}_${file.name}`;
  return uploadFile(file, path);
}

// Upload PYQ paper
export async function uploadPYQ(uid: string, file: File): Promise<string> {
  const path = `pyq/${uid}/${Date.now()}_${file.name}`;
  return uploadFile(file, path);
}

// Upload assignment PDF
export async function uploadAssignmentPDF(
  uid: string,
  blob: Blob,
  fileName: string
): Promise<string> {
  const storageRef = ref(storage, `assignments/${uid}/${Date.now()}_${fileName}`);
  const snapshot = await uploadBytes(storageRef, blob);
  return getDownloadURL(snapshot.ref);
}

// Delete file
export async function deleteFile(url: string): Promise<void> {
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}

// Get file download URL by path
export async function getFileURL(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}
