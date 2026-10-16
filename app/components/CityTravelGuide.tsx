import { cityGuide } from "../data/city-guide";
import EditorialText from "./EditorialText";
export default function CityTravelGuide({ language }: { language: "vi" | "en" }) {
  return <div className="mt-10 space-y-10">{cityGuide.map((section, i) => <section key={i}><h2 className="text-2xl font-semibold leading-snug">{section[language]}</h2><div className="mt-4 space-y-5">{section.paragraphs.map((p, j) => <p key={j} className="text-lg leading-9 text-slate-700"><EditorialText text={p[language]} language={language} /></p>)}</div></section>)}</div>;
}
