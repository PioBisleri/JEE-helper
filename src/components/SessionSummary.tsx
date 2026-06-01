interface SessionSummaryProps {
  summary: string;
  stats: {
    attempted: number;
    solvedClean: number;
    newConcepts: number;
  };
  onContinue: () => void;
  onEndSession: () => void;
}

export default function SessionSummary({ summary, stats, onContinue, onEndSession }: SessionSummaryProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 animate-fade-in text-center">
      <h3 className="text-xl font-semibold mb-4">Session Complete!</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-bg rounded-lg p-3">
          <p className="text-2xl font-bold text-accent">{stats.attempted}</p>
          <p className="text-xs text-gray-400">Attempted</p>
        </div>
        <div className="bg-bg rounded-lg p-3">
          <p className="text-2xl font-bold text-success">{stats.solvedClean}</p>
          <p className="text-xs text-gray-400">Solved Clean</p>
        </div>
        <div className="bg-bg rounded-lg p-3">
          <p className="text-2xl font-bold text-warning">{stats.newConcepts}</p>
          <p className="text-xs text-gray-400">New Concepts</p>
        </div>
      </div>

      <p className="text-gray-300 leading-relaxed mb-6">{summary}</p>

      <div className="flex gap-3">
        <button
          onClick={onContinue}
          className="flex-1 px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition-colors"
        >
          Continue Studying
        </button>
        <button
          onClick={onEndSession}
          className="flex-1 px-4 py-3 bg-surface border border-border hover:border-error text-gray-300 rounded-lg transition-colors"
        >
          End Session
        </button>
      </div>
    </div>
  );
}
