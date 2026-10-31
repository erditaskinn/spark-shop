import { achievements, loginCycle, missionTemplates } from '../data/meta';
import { earn, income } from './economy';
import { dayOf } from './rewards';
import type { GameState } from './state';
export const missionCounters = (s: GameState) => [s.purchases, s.repairs, s.faults];
export function refreshDaily(s: GameState): void {
  const day = dayOf(s); if (day <= s.missionDay) return;
  s.missionDay = day; s.missionClaims = []; s.missionBase = missionCounters(s);
}
export function dailyMissions(s: GameState) {
  const day = Math.max(0, s.missionDay);
  return [missionTemplates[day % 7], missionTemplates[7 + (day * 3 + 1) % 7], missionTemplates[14 + (day * 5 + 2) % 6]];
}
export function missionProgress(s: GameState, slot: number): number {
  const mission = dailyMissions(s)[slot]; return mission ? Math.max(0, missionCounters(s)[mission.kind] - s.missionBase[mission.kind]) : 0;
}
export function missionReady(s: GameState, slot: number): boolean {
  const mission = dailyMissions(s)[slot]; return !!mission && !s.missionClaims.includes(slot) && missionProgress(s, slot) >= mission.goal;
}
export function claimMission(s: GameState, slot: number): boolean {
  if (!missionReady(s, slot)) return false;
  earn(s, income(s).mul(dailyMissions(s)[slot].minutes * 60)); s.missionClaims.push(slot); return true;
}
export function loginReady(s: GameState): boolean { return dayOf(s) > s.loginDay; }
export function claimLogin(s: GameState): boolean {
  if (!loginReady(s)) return false;
  earn(s, income(s).mul(loginCycle[s.loginStreak] * 60)); s.loginDay = dayOf(s); s.loginStreak = (s.loginStreak + 1) % 7; return true;
}
export function achievementProgress(s: GameState, id: number): number {
  const a = achievements[id]; return a ? [s.purchases, s.repairs, s.faults, s.zone + 1, s.reputation][a.kind] : 0;
}
export function claimAchievement(s: GameState, id: number): boolean {
  const a = achievements[id]; if (!a || s.achievements.includes(id) || achievementProgress(s, id) < a.goal) return false;
  s.achievements.push(id); s.badges += a.badges; return true;
}
