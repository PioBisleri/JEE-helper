const ANALYTICS_KEY = 'jeeforge_analytics_events';
const MAX_EVENTS = 500;
const MAX_AGE_DAYS = 30;

export interface AnalyticsEvent {
  id: string;
  event: string;
  properties: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

let sessionId: string;
try {
  sessionId = sessionStorage.getItem('nexus_session_id') || crypto.randomUUID();
  sessionStorage.setItem('nexus_session_id', sessionId);
} catch {
  sessionId = String(Date.now());
}

function getEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: AnalyticsEvent[]) {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch {
    // Storage full — evict oldest
    const trimmed = events.slice(-Math.floor(MAX_EVENTS / 2));
    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
    } catch {
      // Give up silently
    }
  }
}

export function track(event: string, properties: Record<string, unknown> = {}) {
  const events = getEvents();
  events.push({
    id: crypto.randomUUID(),
    event,
    properties,
    timestamp: Date.now(),
    sessionId,
  });

  // Evict old events
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const filtered = events.filter(e => e.timestamp > cutoff);

  // Enforce max count
  const trimmed = filtered.length > MAX_EVENTS
    ? filtered.slice(-MAX_EVENTS)
    : filtered;

  saveEvents(trimmed);
}

export function getAnalyticsEvents(): AnalyticsEvent[] {
  return getEvents();
}

export function clearOldAnalytics(olderThanDays: number = MAX_AGE_DAYS) {
  const events = getEvents();
  const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
  saveEvents(events.filter(e => e.timestamp > cutoff));
}
