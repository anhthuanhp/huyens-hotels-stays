import EnglishSite from "@/app/components/EnglishSite";
import { englishProps } from "@/app/lib/english-page-props";
export default EnglishSite;
export const getStaticProps = () => englishProps(["blog"]);
