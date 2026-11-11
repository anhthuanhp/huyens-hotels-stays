import { ImageOff, ArrowRight } from 'lucide-react';
import type { Lang } from './types';
import { copy, pick } from './copy';

type Props = { lang: Lang };

export function RoomsEmptyState({ lang }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-pine/20 bg-sage/50 px-6 py-16 text-center sm:py-20">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pine/5 text-pine">
        <ImageOff className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <div className="space-y-1.5">
        <h3 className="font-serif text-xl font-semibold text-ink sm:text-2xl">{pick(copy.empty.title, lang)}</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-mist">{pick(copy.empty.description, lang)}</p>
      </div>
      <a
        href="/tim-phong"
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-pinedeep"
      >
        {lang === 'vi' ? 'T\u00ECm ph\u00F2ng' : 'Find a room'}
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </a>
    </div>
  );
}
