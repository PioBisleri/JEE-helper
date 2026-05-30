import { storage } from '../utils/storage';

/**
 * WeeklyTest — displays test history, scores, and weak concepts summary.
 * Integrated into StatsPage.
 */
export default function WeeklyTest() {
  const weeklyData = storage.getWeeklyData();
  const testHistory = weeklyData.testHistory || [];
  const currentWeekConcepts = weeklyData.currentWeekConcepts || [];

  if (testHistory.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="font-semibold mb-3">Weekly Test Summary</h3>

      {currentWeekConcepts.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
          <p className="text-xs text-warning font-semibold mb-2">⚠️ Focus Areas This Week</p>
          <div className="flex flex-wrap gap-2">
            {currentWeekConcepts.map(c => (
              <span key={c} className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-lg">{c}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {testHistory.slice(-4).map((t, i) => (
          <div key={i} className="flex items-center justify-between bg-bg rounded-lg p-3">
            <div>
              <p className="text-sm font-semibold text-gray-300">{t.score}/{t.total}</p>
              <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
            </div>
            <div className={`text-lg font-bold ${t.score >= 7 ? 'text-success' : t.score >= 4 ? 'text-warning' : 'text-error'}`}>
              {Math.round((t.score / t.total) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
