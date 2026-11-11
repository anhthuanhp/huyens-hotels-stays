import { AlertTriangle, BookOpen } from 'lucide-react';
import { useLanguage } from '../lib/use-language';
import { experienceCopy } from './experience-copy';

type ExperienceStatusProps = {
  variant: 'error' | 'empty';
};

export default function ExperienceStatus({ variant }: ExperienceStatusProps) {
  const { language } = useLanguage();
  const copy = experienceCopy[language];
  const isError = variant === 'error';
  const Icon = isError ? AlertTriangle : BookOpen;

  return (
    <div
      role={isError ? 'alert' : undefined}
      className="flex flex-col items-center rounded-sm border border-ink/10 bg-sage px-6 py-14 text-center sm:py-20"
    >
      <Icon size={32} aria-hidden="true" className={isError ? 'text-amber-700' : 'text-accent'} />
      <h3 className="mt-5 font-serif text-3xl font-semibold text-ink">
        {isError ? copy.errorTitle : copy.emptyTitle}
      </h3>
      <p className="mt-3 max-w-md text-base leading-[1.75] text-muted">
        {isError ? copy.errorBody : copy.emptyBody}
      </p>
    </div>
  );
}
