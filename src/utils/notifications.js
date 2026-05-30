export async function requestPermission() {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function scheduleReminder(hourOfDay) {
  localStorage.setItem('jeeforge_reminder_hour', hourOfDay);
  localStorage.setItem('jeeforge_notifications', 'true');
}

export function fireNotification(title, body) {
  const enabled = localStorage.getItem('jeeforge_notifications') !== 'false';
  if (!enabled || Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body: body,
      icon: '/favicon.svg'
    });
  } catch (e) {
    console.warn('[Nexus JEE Notifications] Failed to fire local notification:', e);
  }
}

export function fireAchievementUnlock(badgeName, badgeEmoji) {
  fireNotification(
    'Achievement Unlocked!',
    `${badgeName}: You unlocked a new milestone badge!`
  );
}

export function fireDailyChallengeAlert(chapterName) {
  fireNotification(
    'Daily Challenge Ready',
    `Today's challenge from "${chapterName}" is waiting. Double XP (+30 XP) if you solve it today!`
  );
}

export function checkAndFireReminder() {
  const prefs = JSON.parse(localStorage.getItem('jeeforge_preferences') || '{}');
  const enabled = prefs.notificationsEnabled !== false;
  if (!enabled || Notification.permission !== 'granted') return;

  const today = new Date().toDateString();
  const lastFired = localStorage.getItem('jeeforge_last_reminder');
  if (lastFired === today) return;

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  
  const reminderTime = prefs.reminderTime || '19:00';
  const [remHour, remMin] = reminderTime.split(':').map(Number);
  
  if (currentHour < remHour || (currentHour === remHour && currentMinute < remMin)) return;

  const streak = JSON.parse(localStorage.getItem('jeeforge_streak') || '{}');
  const lastStudied = streak.lastStudied;

  if (lastStudied !== today) {
    fireNotification(
      'Nexus JEE Daily Reminder',
      streak.current > 1
        ? `Don't break your ${streak.current}-day streak! Open Nexus JEE and study.`
        : "You haven't studied today. Even 20 minutes compounds over time."
    );
    localStorage.setItem('jeeforge_last_reminder', today);
  }
}

export function fireWeeklyTestReminder() {
  const prefs = JSON.parse(localStorage.getItem('jeeforge_preferences') || '{}');
  const enabled = prefs.weeklyTestReminder !== false;
  if (!enabled || Notification.permission !== 'granted') return;

  fireNotification(
    'Weekly Test Ready',
    'Your weekly test is available. See how much you actually retained this week.'
  );
}
