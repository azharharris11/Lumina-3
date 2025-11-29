
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * @param file The file object from input.
 * @param path The folder path in storage (e.g., 'avatars', 'receipts').
 * @param fileName Optional custom filename. If not provided, uses timestamp + original name.
 */
export const uploadFile = async (file: File | Blob, path: string, fileName?: string): Promise<string> => {
  if (!file) throw new Error("No file provided");

  const finalName = fileName || `${Date.now()}_${(file as File).name || 'file'}`;
  const fullPath = `${path}/${finalName}`;
  const storageRef = ref(storage, fullPath);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

/**
 * Converts a Data URL (base64) to a Blob object for uploading.
 */
export const dataURLtoBlob = (dataurl: string): Blob => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};
