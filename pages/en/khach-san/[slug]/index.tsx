import EnglishSite from "@/app/components/EnglishSite";
import { englishProps } from "@/app/lib/english-page-props";
export default EnglishSite;
import type { GetStaticProps, GetStaticPaths } from "next";
import { englishInventory } from "@/app/lib/english-data";
export const getStaticPaths: GetStaticPaths = async () => ({ paths: (await englishInventory()).hotels.map(hotel => ({ params: { slug: hotel.slug } })), fallback: "blocking" });
export const getStaticProps: GetStaticProps = ({ params }) => typeof params?.slug === "string" ? englishProps(["khach-san", params.slug]) : Promise.resolve({ notFound: true });
