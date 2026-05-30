import OptionButton from './OptionButton';

export default function ScaffoldPhase({
  phase,
  scaffoldL1,
  scaffoldL2,
  question,
  selectedOption,
  isCorrect,
  onL1Answer,
  onTryL1Again,
  onTryOriginal,
  onL1ToL2,
  onL2ToL1,
  onL2ToLadder,
}) {
  // Scaffold L1: Simpler question
  if (phase === 'scaffold1') {
    return (
      <div className="animate-fade-in">
        <p className="text-xs text-warning mb-3 font-semibold">🪜 SIMPLER QUESTION</p>
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-lg leading-relaxed mb-6">{scaffoldL1.question}</p>
          <div className="flex flex-col gap-3">
            {Object.entries(scaffoldL1.options).map(([key, val]) => {
              let state = 'default';
              if (selectedOption) {
                if (key === scaffoldL1.answer) state = 'correct';
                else if (key === selectedOption) state = 'wrong';
                else state = 'disabled';
              }
              return (
                <OptionButton
                  key={key}
                  label={key}
                  text={val}
                  state={state}
                  onClick={() => onL1Answer(key)}
                />
              );
            })}
          </div>
        </div>

        {selectedOption && isCorrect && (
          <div className="mt-4 bg-success/10 border border-success/30 rounded-xl p-4 animate-fade-in">
            <p className="text-success font-semibold mb-1">✅ Nicely done!</p>
            <p className="text-sm text-gray-300">{scaffoldL1.bridgeExplanation}</p>
            <button
              onClick={onTryOriginal}
              className="w-full mt-3 px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition-colors"
            >
              Try Original Again →
            </button>
          </div>
        )}

        {selectedOption && !isCorrect && (
          <div className="mt-4 flex gap-3 animate-fade-in">
            <button
              onClick={onTryL1Again}
              className="flex-1 px-4 py-3 bg-accent/20 border border-accent/50 text-accent rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onL1ToL2}
              className="flex-1 px-4 py-3 bg-surface border border-border text-gray-300 rounded-lg transition-colors"
            >
              Still Stuck
            </button>
          </div>
        )}
      </div>
    );
  }

  // Scaffold L2: Concept explanation
  if (phase === 'scaffold2' && scaffoldL2) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-accent mb-2">
          Understanding: {question?.primaryConcept}
        </h3>
        <p className="text-gray-300 leading-relaxed mb-4">{scaffoldL2.explanation}</p>

        <div className="bg-bg rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-500 mb-1">Analogy</p>
          <p className="text-sm text-gray-300">{scaffoldL2.analogy}</p>
        </div>

        <div className="bg-error/10 border border-error/20 rounded-lg p-3 mb-3">
          <p className="text-xs text-error mb-1">Common Mistake</p>
          <p className="text-sm text-gray-300">{scaffoldL2.commonMistake}</p>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-accent mb-1">JEE Connection</p>
          <p className="text-sm text-gray-300">{scaffoldL2.jeeConnection}</p>
        </div>

        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(scaffoldL2.videoSearchQuery || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-3 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors mb-3"
        >
          🎥 Watch on YouTube
        </a>

        <div className="flex gap-3">
          <button
            onClick={onL2ToL1}
            className="flex-1 px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition-colors"
          >
            I Understand, Try Again
          </button>
          <button
            onClick={onL2ToLadder}
            className="flex-1 px-4 py-3 bg-surface border border-border text-gray-300 rounded-lg transition-colors"
          >
            Still Confused
          </button>
        </div>
      </div>
    );
  }

  return null;
}
