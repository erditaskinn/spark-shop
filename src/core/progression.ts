import { BALANCE } from '../data/balance';
import { zones } from '../data/content';
import { research } from '../data/research';
import { earn, income, researchCount } from './economy';
import { D, Decimal } from './numbers';
import { createState, random, type GameState } from './state';
export function unlockZone(s: GameState): boolean {
  const next = zones[s.zone + 1];
  if (!next || s.runEarnings.lt(next.goal)) return false;
  s.zone++; return true;
}
export function prestigeGain(s: GameState): number {
  const total = Math.min(1e12, Math.floor(s.lifetime.div(BALANCE.prestigeDivisor).sqrt().toNumber()));
  return Math.max(0, total - s.reputation);
}
export function prestige(s: GameState): boolean {
  const gain = prestigeGain(s); if (!gain) return false;
  s.reputation += gain; s.badges += Math.max(1, Math.ceil(Math.sqrt(gain))); s.prestiges++;
  s.money = D(BALANCE.startingMoney); s.runEarnings = D(0); s.zone = 0;
  s.stations = createState().stations; s.offline = D(0); s.offlineSeconds = 0;
  // Permanent automation research restarts the opening bench after prestige.
  if (researchCount(s, 4) >= 4) s.stations[0].manager = true;
  return true;
}
export function buyResearch(s: GameState, id: number): boolean {
  const node = research[id];
  if (!node || s.research.includes(id) || s.badges < node.cost || (node.prerequisite !== null && !s.research.includes(node.prerequisite))) return false;
  s.badges -= node.cost; s.research.push(id); return true;
}
export function offlineCap(s: GameState): number { return Math.min(BALANCE.maxOfflineHours, BALANCE.offlineHours + 2 * researchCount(s, 2)) * 3600; }
export function settleOffline(s: GameState, wallNow: number): Decimal {
  if (!Number.isFinite(wallNow)) return D(0);
  const start = s.savedAt, end = Math.max(start, wallNow);
  const seconds = Math.min(offlineCap(s), end - start);
  const boostedSeconds = Math.min(seconds, Math.max(0, s.boostUntil - start));
  const amount = income(s, true).mul(seconds + boostedSeconds);
  if (!s.pro) s.adIncome = s.adIncome.add(income(s, true).mul(boostedSeconds));
  s.offline = s.offline.add(amount); s.offlineSeconds += seconds;
  if (seconds > 0 && amount.gt(0)) s.offlineId++;
  s.now = end; s.savedAt = end; s.faultUntil = 0; s.faultAt = end + 25;
  return amount;
}
export function collectOffline(s: GameState, double = false): Decimal {
  const amount = s.offline.mul(double || s.pro ? 2 : 1);
  earn(s, amount); s.offline = D(0); s.offlineSeconds = 0; return amount;
}
export function updateFault(s: GameState): void {
  if (s.faultUntil && s.now >= s.faultUntil) s.faultUntil = 0;
  if (s.now >= s.faultAt) {
    s.faultComponent = Math.floor(random(s) * (s.zone >= 4 ? 5 : 4));
    s.faultUntil = s.now + 3; s.faultAt = s.now + 20 + random(s) * 20;
  }
}
export function catchFault(s: GameState): Decimal {
  if (!s.faultUntil || s.now >= s.faultUntil) return D(0);
  s.faultUntil = 0; s.faults++;
  const amount = income(s).mul(Math.min(BALANCE.faultCapMinutes * 60, BALANCE.faultSeconds + s.zone * 5));
  earn(s, amount); return amount;
}
