import QuestionCard from './QuestionCard';

export default function ReviewPhase({ question, onAnswer, selectedOption, isCorrect, onNext, isLast }) {
  return (
    <div className="animate-fade-in">
      <p className="text-xs text-success mb-3 font-semibold">🔄 REVIEW MODE</p>
      <QuestionCard
        question={question}
        onAnswer={onAnswer}
        onStuck={() => {}}
        selectedOption={selectedOption}
        isCorrect={isCorrect}
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
