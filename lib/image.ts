
/**
 * Tối ưu URL ảnh Supabase Storage cho ảnh cover.
 *
 * Ảnh gốc vẫn được giữ nguyên trong Storage.
 * Supabase sẽ tự resize/compress ảnh khi trình duyệt request.
 */
export function getHotelCoverUrl(
  url: string | null | undefined,
  width = 800,
  height = 600
): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    /*
     * Chỉ xử lý ảnh từ Supabase Storage.
     * Nếu URL là nguồn khác thì giữ nguyên.
     */
    if (
      !parsed.pathname.includes(
        "/storage/v1/object/public/"
      )
    ) {
      return url;
    }

    /*
     * Chuyển:
     *
     * /storage/v1/object/public/bucket/file.jpg
     *
     * thành:
     *
     * /storage/v1/render/image/public/bucket/file.jpg
     */
    parsed.pathname =
      parsed.pathname.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      );

    /*
     * Xóa các parameter cũ để tránh xung đột.
     */
    parsed.searchParams.delete("width");
    parsed.searchParams.delete("height");
    parsed.searchParams.delete("resize");
    parsed.searchParams.delete("quality");

    /*
     * Kích thước phù hợp cho cover card.
     *
     * 800x600 đủ cho:
     * - desktop
     * - tablet
     * - mobile
     * - màn hình Retina ở kích thước card thông thường
     */
    parsed.searchParams.set(
      "width",
      String(width)
    );

    parsed.searchParams.set(
      "height",
      String(height)
    );

    parsed.searchParams.set(
      "resize",
      "cover"
    );

    /*
     * Quality 75 giúp giảm đáng kể dung lượng
     * nhưng vẫn giữ chất lượng tốt cho ảnh khách sạn.
     */
    parsed.searchParams.set(
      "quality",
      "75"
    );

    return parsed.toString();
  } catch {
    /*
     * Nếu URL không hợp lệ thì giữ nguyên URL.
     */
    return url;
  }
}
