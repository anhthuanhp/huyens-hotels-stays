import BlogPage from "../../blog/page";
import { englishRouteMetadata } from "../../lib/english-route-metadata";

export const revalidate = 60;
export async function generateMetadata() { return englishRouteMetadata(["blog"]); }
export default function EnglishBlog() { return <BlogPage />; }
