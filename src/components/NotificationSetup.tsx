import { useState } from 'react';
import { requestPermission, scheduleReminder } from '../utils/notifications';

export default function NotificationSetup({ onComplete }: { onComplete: () => void }) {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(19);
  const [done, setDone] = useState(false);

  async function handleEnable() {
    const granted = await requestPermission();
    if (granted) {
      scheduleReminder(hour);
    } else {
      localStorage.setItem('jeeforge_notifications', 'false');
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center animate-fade-in">
        <p className="text-success mb-4">Done!</p>
        <button
          onClick={onComplete}
          className="w-full px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-center">Daily Reminders</h2>
      <p className="text-gray-400 text-sm text-center">We'll remind you to study every day</p>

      <label className="flex items-center justify-between bg-surface border border-border rounded-xl p-4">
        <span>Remind me daily</span>
        <button
          onClick={() => setEnabled(!enabled)}
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle daily reminders"
          className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-accent' : 'bg-border'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} aria-hidden="true" />
        </button>
      </label>

      {enabled && (
        <div className="bg-surface border border-border rounded-xl p-4 animate-fade-in">
          <label htmlFor="reminder-time" className="text-sm text-gray-400">Reminder time</label>
          <input
            id="reminder-time"
            type="time"
            value={`${String(hour).padStart(2, '0')}:00`}
            onChange={(e) => setHour(parseInt(e.target.value))}
            className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2 text-white"
          />
        </div>
      )}

      <button
        onClick={enabled ? handleEnable : onComplete}
        className="w-full px-4 py-3 bg-accent hover:bg-accent/80 text-white rounded-lg font-semibold transition-colors"
      >
        {enabled ? 'Enable & Continue' : 'Skip'}
      </button>
    </div>
  );
}
