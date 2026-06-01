import ProgressBar from './ProgressBar';
import { storage } from '../utils/storage';
import type { Chapter } from '../types';

interface ChapterSelectorProps {
  subject: Chapter[];
  onChapterClick: (chapterId: string) => void;
}

export default function ChapterSelector({ subject, onChapterClick }: ChapterSelectorProps) {
  const chapters = subject || [];

  return (
    <div className="flex flex-col gap-3">
      {chapters.map((chapter: Chapter) => {
        const progress = storage.getChapterProgress(chapter.id);
        const conceptsLearned = storage.getConceptsLearned().filter((c: { chapterId: string }) => c.chapterId === chapter.id);

        return (
          <div
            key={chapter.id}
            className="bg-surface border border-border hover:border-accent/50 rounded-xl p-4 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{chapter.name}</h3>
              <button
                onClick={() => onChapterClick(chapter.id)}
                className="px-3 py-1 bg-accent hover:bg-accent/80 text-white text-xs rounded-lg transition-colors"
              >
                {progress.questionsAttempted > 0 ? 'Continue' : 'Start'}
              </button>
            </div>
            <ProgressBar value={progress.questionsAttempted} max={40} />
            <p className="text-gray-500 text-xs mt-1">
              {conceptsLearned.length} concepts learned
            </p>
          </div>
        );
      })}
    </div>
  );
}
