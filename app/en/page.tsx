import HomePage from "../page";
import { englishRouteMetadata } from "../lib/english-route-metadata";

export const revalidate = 60;
export async function generateMetadata() { return englishRouteMetadata([]); }
export default function EnglishHome() { return <HomePage />; }
