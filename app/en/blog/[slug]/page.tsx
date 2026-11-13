import BlogDetailPage from "../../../blog/[slug]/page";
import { englishRouteMetadata } from "../../../lib/english-route-metadata";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return englishRouteMetadata(["blog", slug]);
}
export default function EnglishBlogDetail(props: Props) { return <BlogDetailPage {...props} />; }
