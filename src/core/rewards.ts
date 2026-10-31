import { BALANCE } from '../data/balance';
import { placement, type PlacementId } from '../data/rewardedPlacements';
import { earn, income, researchCount } from './economy';
import { collectOffline } from './progression';
import { D, type Decimal } from './numbers';
import { random, type GameState } from './state';
export interface RewardContext { claim?: number; minutes?: number; ready?: boolean }
export interface RewardTicket { id: string; placement: PlacementId; amount: Decimal; offlineId: number; claim: number; day: number; lucky: number; started: boolean }
export const dayOf = (s: GameState) => Math.floor(s.now / 86400);
export function boostAwardSeconds(s: GameState): number {
  return Math.max(0, Math.min(BALANCE.boostMax - Math.max(0, s.boostUntil - s.now), 7200 * (1 + researchCount(s, 3) * 0.05)));
}
export function adEligible(s: GameState, id: PlacementId, context: RewardContext = {}): boolean {
  const p = placement(id), last = s.adTimes[id] ?? -1e12;
  if (!p.enabled || s.zone < p.zone || s.now - s.lastAd < BALANCE.adGap || s.now - last < p.cooldown) return false;
  if (id === 'chest' && s.now - (s.adTimes.freeChest ?? s.now) < 600) return false;
  if ((s.adCounts[`${dayOf(s)}:${id}`] ?? 0) >= p.dailyCap) return false;
  if (id === 'welcome' && s.offline.lte(0)) return false;
  if (id === 'boost' && boostAwardSeconds(s) < 60) return false;
  if ((id === 'login' || id === 'mission') && !context.ready) return false;
  // Long skips are contextual: a fresh prestige or saving for an expensive station.
  if ((id === 'skip1' || id === 'skip4') && s.prestiges === 0) return false;
  return true;
}
export function offerReward(s: GameState, id: PlacementId, context: RewardContext = {}): RewardTicket | null {
  if (!adEligible(s, id, context)) return null;
  return { id: `${Math.floor(s.now * 1000)}:${s.adsWatched}:${id}`, placement: id,
    amount: income(s).mul(60 * (context.minutes ?? placement(id).minutes)),
    offlineId: s.offlineId, claim: context.claim ?? -1, day: dayOf(s), lucky: -1, started: false };
}
export function markAdStarted(s: GameState, ticket: RewardTicket): void {
  ticket.started = true; s.lastAd = s.now;
}
export function grantReward(s: GameState, ticket: RewardTicket): boolean {
  if (!ticket.started || s.rewarded.includes(ticket.id)) return false;
  if (ticket.placement === 'welcome' && (s.offlineId !== ticket.offlineId || s.offline.lte(0))) return false;
  if (ticket.placement === 'login' && (s.loginDay === ticket.day || dayOf(s) !== ticket.day)) return false;
  if (ticket.placement === 'mission' && (s.missionClaims.includes(ticket.claim) || s.missionDay !== ticket.day)) return false;
  s.rewarded.push(ticket.id); if (s.rewarded.length > 256) s.rewarded.shift();
  s.adsWatched++; s.adTimes[ticket.placement] = s.now;
  const key = `${ticket.day}:${ticket.placement}`; s.adCounts[key] = (s.adCounts[key] ?? 0) + 1;
  // Bound the seven-day ledger; device-local anti-tamper is best effort, not a trusted server.
  for (const key of Object.keys(s.adCounts)) if (Number(key.split(':')[0]) < ticket.day - 7) delete s.adCounts[key];
  if (ticket.placement === 'welcome') {
    const extra = s.offline; collectOffline(s, true); s.adIncome = s.adIncome.add(extra);
  } else if (ticket.placement === 'boost') {
    s.boostUntil = Math.min(s.now + BALANCE.boostMax, Math.max(s.now, s.boostUntil) + 7200 * (1 + researchCount(s, 3) * 0.05));
  } else if (ticket.placement === 'lucky') {
    ticket.lucky = Math.floor(random(s) * 3);
    if (ticket.lucky === 0) s.badges++;
    else if (ticket.lucky === 1) s.boostUntil = Math.min(s.now + BALANCE.boostMax, Math.max(s.now, s.boostUntil) + 600);
    else { earn(s, ticket.amount); s.adIncome = s.adIncome.add(ticket.amount); }
  } else {
    earn(s, ticket.amount); s.adIncome = s.adIncome.add(ticket.amount);
    if (ticket.placement === 'chest') s.adTimes.freeChest = s.now;
    if (ticket.placement === 'mission') s.missionClaims.push(ticket.claim);
    if (ticket.placement === 'login') { s.loginDay = ticket.day; s.loginStreak = (s.loginStreak + 1) % 7; }
  }
  return true;
}
export function chestFree(s: GameState): boolean {
  if (s.now - (s.adTimes.freeChest ?? -1e12) < 600) return false;
  earn(s, income(s).mul(900)); s.adTimes.freeChest = s.now; return true;
}
export const noReward = () => D(0);
