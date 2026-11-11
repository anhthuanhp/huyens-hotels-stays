"use client";

import BoltExperienceClient from "./bolt/components/ExperienceClient";
import type { ExperienceClientProps } from "./bolt/types/experience";

export default function ExperienceClient(props: ExperienceClientProps) {
  return <BoltExperienceClient {...props} />;
}
