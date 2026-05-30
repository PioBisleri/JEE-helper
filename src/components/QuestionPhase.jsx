import OptionButton from './OptionButton';
import QuestionCard from './QuestionCard';

export default function QuestionPhase({
  question,
  onAnswer,
  onStuck,
  selectedOption,
  isCorrect,
  showHint,
  hint,
  wrongAttempts,
  onGetHint,
  onTryAgain,
  onNextQuestion,
  onScaffold,
}) {
  return (
    <div className="animate-fade-in">
      <QuestionCard
        question={question}
        onAnswer={onAnswer}
        onStuck={onStuck}
        selectedOption={selectedOption}
        isCorrect={isCorrect}
        showHint={showHint}
        hint={hint}
      />

      {selectedOption && isCorrect && (
        <div className="mt-4 bg-success/10 border border-success/30 rounded-xl p-4 animate-fade-in">
          <p className="text-success font-semibold mb-1">✅ Correct!</p>
          <p className="text-sm text-gray-300">{question.whyCorrect}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Object.entries(question.whyOthersWrong || {}).map(([key, val]) => (
              <div key={key} className="text-xs text-gray-500">
                <span className="font-semibold">{key}:</span> {val}
              </div>
            ))}
          </div>
          <button
            onClick={onNextQuestion}
            className="w-full mt-4 px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition-colors"
          >
            Next Question →
          </button>
        </div>
      )}

      {selectedOption && !isCorrect && !showHint && (
        <div className="mt-4 flex gap-3 animate-fade-in">
          <button
            onClick={onTryAgain}
            className="flex-1 px-4 py-3 bg-accent/20 border border-accent/50 text-accent rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onGetHint}
            className="flex-1 px-4 py-3 bg-surface border border-border text-gray-300 rounded-lg transition-colors"
          >
            Get Hint
          </button>
        </div>
      )}

      {selectedOption && !isCorrect && showHint && (
        <div className="mt-4 flex gap-3 animate-fade-in">
          <button
            onClick={onTryAgain}
            className="flex-1 px-4 py-3 bg-accent/20 border border-accent/50 text-accent rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onScaffold}
            className="flex-1 px-4 py-3 bg-surface border border-border text-gray-300 rounded-lg transition-colors"
          >
            I'm Still Stuck
          </button>
        </div>
      )}
    </div>
  );
}
