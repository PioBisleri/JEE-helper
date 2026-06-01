export interface Profile {
  name: string;
  examDate: string;
  preferences: Preferences;
}

export interface Preferences {
  defaultMood: string;
  questionsPerSession: number;
  autoAdvance: boolean;
  notificationsEnabled: boolean;
  reminderTime: string;
  streakWarning: boolean;
  weeklyTestReminder: boolean;
}
