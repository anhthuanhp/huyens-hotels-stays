import { englishInformationMetadata } from "../../lib/seo";

export const metadata = englishInformationMetadata(
  "/trai-nghiem",
  "Things to do in Ho Chi Minh City",
  "Explore local activities and places to visit during your stay with Huyen's Hotels & Stays in Ho Chi Minh City.",
);

import { ExperiencePage } from "../../trai-nghiem/ExperiencePage";

export const revalidate = 60;

export default function EnglishExperiencePage() {
  return <ExperiencePage language="en" />;
}
