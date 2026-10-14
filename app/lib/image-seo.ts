export function slugifyImageName(value: string): string {
  return value.replace(/Doulbe/g, "Double").replace(/Windown/g, "Window").replace(/tiết kiếm/g, "tiết kiệm")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildSeoImageName(parts: string[], originalName: string, uniqueKey: string): string {
  const rawExtension = originalName.split(".").pop()?.toLowerCase() || "webp";
  const extension = rawExtension === "jfif" || rawExtension === "jpeg" ? "jpg" : rawExtension;
  if (!["jpg", "png", "webp", "avif", "gif", "svg"].includes(extension)) throw new Error("Định dạng ảnh không được hỗ trợ.");
  const description = slugifyImageName(parts.filter(Boolean).join(" ")).slice(0, 150).replace(/-$/, "") || "huyens-hotels-stays";
  const key = slugifyImageName(uniqueKey);
  if (!key) throw new Error("Ảnh cần mã riêng để tránh trùng tên.");
  return `${description}-${key}.${extension}`;
}
