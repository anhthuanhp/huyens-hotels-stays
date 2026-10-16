import EnglishSite from "@/app/components/EnglishSite";
import { englishProps } from "@/app/lib/english-page-props";
export default EnglishSite;
import type { GetStaticProps, GetStaticPaths } from "next";
import { englishInventory } from "@/app/lib/english-data";
export const getStaticPaths: GetStaticPaths = async () => ({ paths: (await englishInventory()).posts.map(post => ({ params: { slug: post.slug } })), fallback: "blocking" });
export const getStaticProps: GetStaticProps = ({ params }) => typeof params?.slug === "string" ? englishProps(["blog", params.slug]) : Promise.resolve({ notFound: true });
