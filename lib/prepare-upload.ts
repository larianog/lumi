const MAX_IMAGE_SIDE = 1600;

/**
 * Browser-side: shrink photos before upload. Phone pictures are often 4–12 MB,
 * and the vision model reads a worksheet just as well at ~1600px. PDFs go as-is.
 */
export async function prepareUploadFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) return file;
    // JPEG has no alpha: paint white first so transparent PNGs (screenshots,
    // exported PDFs) don't become black text on a black background.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'licao';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch {
    // Formats the browser cannot decode (e.g. HEIC on some browsers) go unchanged;
    // the server rejects unsupported types with a clear message.
    return file;
  }
}
