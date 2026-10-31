import { producers } from '../data/content';
import { buy, cost, hire, income, managerCost, startRepair, stationRate, tick } from '../core/economy';
import { collectOffline, prestige, prestigeGain, settleOffline, unlockZone, updateFault, catchFault } from '../core/progression';
import { adEligible, chestFree, grantReward, markAdStarted, offerReward } from '../core/rewards';
import { rewardedPlacements } from '../data/rewardedPlacements';
import { createState, type GameState } from '../core/state';
import { claimAchievement, claimLogin, claimMission, dailyMissions, loginReady, missionReady, refreshDaily } from '../core/meta';
import { achievements, loginCycle } from '../data/meta';
import { BALANCE } from '../data/balance';
import { buyResearch } from '../core/progression';
export interface SimResult { profile: string; zones: number[]; prestiges: number[]; firstPurchase: number; firstManager: number; longestStall: number; impressions: number[]; curve: string[]; adIncomeShare: number; lifetime: string }
export function botBuy(s: GameState): void {
  for (let rounds = 0; rounds < 50; rounds++) {
    let best = -1, score = Infinity, manager = false;
    for (const p of producers) {
      if (p.zone > s.zone || (p.tier > 2 && !s.stations[p.id - 2].owned)) continue;
      const st = s.stations[p.id];
      if (st.owned && !st.manager && s.money.gte(managerCost(s, p.id))) {
        const payback = managerCost(s, p.id).div(stationRate(s, p.id)).toNumber() * 0.2;
        if (payback < score) { best = p.id; score = payback; manager = true; }
      }
      const price = cost(s, p.id);
      if (s.money.lt(price) || st.owned >= 500) continue;
      const before = stationRate(s, p.id); st.owned++; const delta = stationRate(s, p.id).sub(before); st.owned--;
      const payback = price.div(delta).toNumber();
      if (payback < score) { best = p.id; score = payback; manager = false; }
    }
    if (best < 0) break;
    if (manager) hire(s, best); else buy(s, best, 1);
  }
  for (let id = 0; id < 30; id++) startRepair(s, id);
}
export function simulate(ads: boolean, mode: 'active' | 'sessions' = 'sessions'): SimResult {
  const s = createState(); s.settings.age = 'adult';
  const r: SimResult = { profile: ads ? 'typical ads' : 'no ads', zones: [0], prestiges: [], firstPurchase: -1, firstManager: -1, longestStall: 0, impressions: Array(7).fill(0), curve: [], adIncomeShare: 0, lifetime: '0' };
  const duration = mode === 'active' ? 7200 : 7 * 86400;
  let lastAction = 0, maxStall = 0, previousPurchases = 0, peakZone = 0;
  while (s.now < duration) {
    // Two five-minute check-ins per day. Pacing is measured separately in active onboarding.
    const sessionTime = s.now % 43200;
    if (mode === 'sessions' && sessionTime >= 300) {
      s.savedAt = s.now; settleOffline(s, Math.min(duration, s.now + 43200 - sessionTime));
      if (ads && adEligible(s, 'welcome')) { const t = offerReward(s, 'welcome')!; markAdStarted(s, t); grantReward(s, t); r.impressions[Math.min(6, Math.floor(s.now / 86400))]++; }
      else collectOffline(s);
      lastAction = s.now;
      if (s.now >= duration) break;
    }
    botBuy(s);
    refreshDaily(s);
    for (const a of achievements) claimAchievement(s, a.id);
    for (let id = 0; id < 40; id++) buyResearch(s, id);
    if (r.firstPurchase < 0 && s.purchases) r.firstPurchase = s.now;
    if (r.firstManager < 0 && s.stations.some(x => x.manager)) r.firstManager = s.now;
    if (s.purchases !== previousPurchases) { previousPurchases = s.purchases; lastAction = s.now; }
    if (unlockZone(s) && s.zone > peakZone) { peakZone = s.zone; r.zones[s.zone] = s.now; lastAction = s.now; }
    if (s.zone >= 4 && prestigeGain(s) >= Math.max(BALANCE.prestigeWorth, s.reputation * 0.5) && s.now - (r.prestiges.at(-1) ?? 0) > 600) {
      if (prestige(s)) { r.prestiges.push(s.now); lastAction = s.now; }
    }
    updateFault(s); catchFault(s);
    if (!ads) { if (loginReady(s)) claimLogin(s); for (let slot = 0; slot < 3; slot++) claimMission(s, slot); }
    if (ads) for (const p of rewardedPlacements) {
      const slot = [0, 1, 2].find(i => missionReady(s, i));
      const context = p.id === 'login' ? { ready: loginReady(s), minutes: loginCycle[s.loginStreak] * 2 } : p.id === 'mission' && slot !== undefined ? { ready: true, claim: slot, minutes: dailyMissions(s)[slot].minutes * 2 } : {};
      if (!adEligible(s, p.id, context)) continue;
      const t = offerReward(s, p.id, context)!; markAdStarted(s, t); grantReward(s, t);
      r.impressions[Math.min(6, Math.floor(s.now / 86400))]++; break;
    }
    chestFree(s);
    maxStall = Math.max(maxStall, s.now - lastAction);
    for (let k = 0; k < 10; k++) tick(s);
    if (Math.floor(s.now) % (mode === 'active' ? 600 : 43200) === 0) r.curve.push(`${Math.round(s.now)}s:${income(s).toString()}/s`);
  }
  r.longestStall = maxStall; r.lifetime = s.lifetime.toString();
  r.adIncomeShare = s.lifetime.gt(0) ? s.adIncome.div(s.lifetime).toNumber() : 0;
  return r;
}
