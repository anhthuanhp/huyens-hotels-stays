import JournalCard from "./JournalCard";
import type { BlogPost, Language } from "./types";

type JournalGridProps = {
  posts: BlogPost[];
  language: Language;
};

export default function JournalGrid({ posts, language }: JournalGridProps) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <JournalCard key={post.id} post={post} language={language} />
      ))}
    </div>
  );
}
