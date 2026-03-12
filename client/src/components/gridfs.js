const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Returns the full URL to serve a GridFS image by its ID.
 */
export const getImageUrl = (fileId) => {
  return `${API_BASE}/api/feedback/image/${fileId}`;
};

/**
 * Converts a Blob URL (from canvas/cropper) into a File object
 * suitable for uploading via FormData.
 */
export const blobUrlToFile = async (blobUrl, filename = 'signature.jpeg') => {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
};