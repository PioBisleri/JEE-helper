import QuestionCard from './QuestionCard';
import type { Question } from '../types';

interface ReviewPhaseProps {
  question: Question;
  onAnswer: (option: string) => void;
  selectedOption: string | null;
  isCorrect: boolean;
  onNext: () => void;
  isLast: boolean;
}

export default function ReviewPhase({ question, onAnswer, selectedOption, isCorrect, onNext, isLast }: ReviewPhaseProps) {
  return (
    <div className="animate-fade-in">
      <p className="text-xs text-success mb-3 font-semibold">🔄 REVIEW MODE</p>
      <QuestionCard
        question={question}
        hideBookmark={true}
      />
      {selectedOption && (
        <div className="mt-4 space-y-3">
          {isCorrect ? (
            <p className="text-success text-sm">✅ Correct! Review interval updated.</p>
          ) : (
            <p className="text-error text-sm">
              Expected: {question.answer}. {question.whyCorrect}
            </p>
          )}
          <button
            onClick={onNext}
            className="w-full px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition-colors"
          >
            {isLast ? 'Start Chapter Questions' : 'Next Review'}
          </button>
        </div>
      )}
    </div>
  );
}
