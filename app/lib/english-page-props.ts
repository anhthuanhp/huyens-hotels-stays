import { englishPage } from "./english-data";
export async function englishProps(parts: string[]) { const data = await englishPage(parts); return data ? { props: { data }, revalidate: 60 } : { notFound: true as const, revalidate: 60 }; }
