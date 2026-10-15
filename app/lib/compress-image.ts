// Browser-side compression keeps new storage objects inside the same image budget.
export async function compressImageForUpload(file: File): Promise<File> {
  const image = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Không thể xử lý ảnh trong trình duyệt này.");
    let width = Math.min(image.width, 1920);
    while (width > 0) {
      canvas.width = width;
      canvas.height = Math.max(1, Math.round(width * image.height / image.width));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.8, 0.65, 0.5, 0.35]) {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", quality));
        if (!blob || blob.type !== "image/webp") throw new Error("Trình duyệt không hỗ trợ WebP.");
        if (blob.size < 199_000) return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
      }
      if (width <= 64) break;
      width = Math.max(64, Math.floor(width * 0.75));
    }
    throw new Error("Không thể nén ảnh dưới 200KB. Hãy chọn ảnh khác.");
  } finally { image.close(); }
}
