import { D, type Money } from './numbers';
import { BALANCE } from '../data/balance';
export interface Station { owned: number; manager: boolean; progress: number; running: boolean }
export interface Settings { language: 'en' | 'tr'; sound: boolean; haptics: boolean; motion: boolean; notifications: boolean; age: 'unknown' | 'minor' | 'adult' }
export interface GameState {
  version: 2; money: Money; lifetime: Money; runEarnings: Money; stations: Station[];
  zone: number; reputation: number; badges: number; prestiges: number; research: number[];
  now: number; savedAt: number; seed: number; boostUntil: number; pro: boolean;
  offline: Money; offlineSeconds: number; offlineId: number;
  faultAt: number; faultUntil: number; faultComponent: number; faults: number;
  purchases: number; repairs: number; adsWatched: number; adIncome: Money;
  lastAd: number; rewarded: string[]; adCounts: Record<string, number>; adTimes: Record<string, number>;
  achievements: number[]; missionDay: number; missionBase: number[]; missionClaims: number[];
  loginDay: number; loginStreak: number; tutorial: number; settings: Settings;
}
export function createState(now = 0): GameState {
  return { version: 2, money: D(BALANCE.startingMoney), lifetime: D(0), runEarnings: D(0),
    stations: Array.from({ length: 30 }, (_, i) => ({ owned: i === 0 ? 1 : 0, manager: false, progress: 0, running: false })),
    zone: 0, reputation: 0, badges: 0, prestiges: 0, research: [], now, savedAt: now, seed: 73821,
    boostUntil: 0, pro: false, offline: D(0), offlineSeconds: 0, offlineId: 0,
    faultAt: now + 25, faultUntil: 0, faultComponent: 0, faults: 0, purchases: 0, repairs: 0,
    adsWatched: 0, adIncome: D(0), lastAd: -1e12, rewarded: [], adCounts: {}, adTimes: {},
    achievements: [], missionDay: -1, missionBase: [0, 0, 0], missionClaims: [],
    loginDay: -1, loginStreak: 0, tutorial: 0,
    settings: { language: 'en', sound: true, haptics: true, motion: true, notifications: false, age: 'unknown' } };
}
export function random(s: GameState): number {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
