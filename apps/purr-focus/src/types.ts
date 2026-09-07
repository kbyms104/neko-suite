export type SessionMode = 'focus' | 'break';

export type CatMotion = 'loafing' | 'sleeping' | 'kneading' | 'alert';

export interface TimerSettings {
  focusMinutes: number;
  breakMinutes: number;
  enablePurr: boolean;
  enableChime: boolean;
  clickThrough: boolean;
}
