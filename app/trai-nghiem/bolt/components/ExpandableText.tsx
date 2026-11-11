import { useState } from 'react';
import { useLanguage } from '../lib/use-language';
import { experienceCopy } from './experience-copy';

const COLLAPSE_THRESHOLD = 260;

type ExpandableTextProps = {
  text: string;
};

export default function ExpandableText({ text }: ExpandableTextProps) {
  const { language } = useLanguage();
  const copy = experienceCopy[language];
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > COLLAPSE_THRESHOLD;

  return (
    <div>
      <p
        className={`whitespace-pre-line text-base leading-[1.75] text-ink/85 ${
          isLong && !expanded ? 'line-clamp-5' : ''
        }`}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-pine hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {expanded ? copy.readLess : copy.readMore}
        </button>
      )}
    </div>
  );
}
