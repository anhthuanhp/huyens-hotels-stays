import EnglishSite from "@/app/components/EnglishSite";
import { englishProps } from "@/app/lib/english-page-props";
export default EnglishSite;
import type { GetStaticProps, GetStaticPaths } from "next";
import { englishInventory } from "@/app/lib/english-data";
export const getStaticPaths: GetStaticPaths = async () => { const data = await englishInventory(); return { paths: data.rooms.map(room => ({ params: { slug: data.hotels.find(h => h.id === room.hotel_id)!.slug, roomSlug: room.slug } })), fallback: "blocking" }; };
export const getStaticProps: GetStaticProps = ({ params }) => typeof params?.slug === "string" && typeof params?.roomSlug === "string" ? englishProps(["khach-san", params.slug, "phong", params.roomSlug]) : Promise.resolve({ notFound: true });
