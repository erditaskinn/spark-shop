import { BALANCE } from '../data/balance';
import { producers, managers } from '../data/content';
import { D, Decimal } from './numbers';
import type { GameState } from './state';
export type BuyMode = 1 | 10 | 100 | 'max';
export function researchCount(s: GameState, kind: number): number { return s.research.filter(id => Math.floor(id / 8) === kind).length; }
export function globalMultiplier(s: GameState): number {
  return (1 + s.reputation * BALANCE.reputationBonus) * BALANCE.zoneMultiplier ** s.zone *
    1.15 ** researchCount(s, 0) * (s.pro ? 1.5 : 1);
}
export function stationRate(s: GameState, id: number): Decimal {
  const p = producers[id], st = s.stations[id];
  if (!p || !st || p.zone > s.zone) return D(0);
  const milestones = BALANCE.milestones.filter(n => st.owned >= n).length;
  const zoneMilestones = [25, 50, 100].filter(n => s.stations.slice(p.zone * 6, p.zone * 6 + 6).every(x => x.owned >= n)).length;
  return D(p.baseCost).div(BALANCE.payback).mul(st.owned).mul(2 ** (milestones + zoneMilestones)).mul(globalMultiplier(s));
}
export function income(s: GameState, automated = false): Decimal {
  let total = D(0);
  for (let i = 0; i < 30; i++) if (!automated || s.stations[i].manager) total = total.add(stationRate(s, i));
  return total;
}
export function cost(s: GameState, id: number, count = 1): Decimal {
  const p = producers[id];
  if (!p || count < 1 || !Number.isFinite(count)) return D(Infinity);
  return D(p.baseCost).mul(0.97 ** researchCount(s, 1)).mul(Decimal.pow(p.growth, s.stations[id].owned))
    .mul(Decimal.pow(p.growth, count).sub(1)).div(p.growth - 1);
}
export function affordable(s: GameState, id: number): number {
  const p = producers[id];
  if (!p) return 0;
  const next = cost(s, id);
  let n = Math.max(0, Math.min(10000 - s.stations[id].owned, Math.floor(s.money.div(next).mul(p.growth - 1).add(1).log10() / Math.log10(p.growth))));
  while (n > 0 && cost(s, id, n).gt(s.money)) n--;
  return n;
}
export function buy(s: GameState, id: number, mode: BuyMode): boolean {
  if (!producers[id] || producers[id].zone > s.zone) return false;
  const count = mode === 'max' ? affordable(s, id) : mode;
  if (count <= 0 || s.stations[id].owned + count > 10000) return false;
  const price = cost(s, id, count);
  if (s.money.lt(price)) return false;
  s.money = s.money.sub(price); s.stations[id].owned += count; s.purchases += count;
  return true;
}
export function managerCost(s: GameState, id: number): Decimal { return D(managers[id]?.cost ?? Infinity).mul(0.9 ** researchCount(s, 4)); }
export function hire(s: GameState, id: number): boolean {
  const st = s.stations[id];
  if (!st || st.manager || !st.owned || producers[id].zone > s.zone || s.money.lt(managerCost(s, id))) return false;
  s.money = s.money.sub(managerCost(s, id)); st.manager = true; return true;
}
export function earn(s: GameState, amount: Decimal): void {
  if (amount.lt(0) || !Number.isFinite(amount.mantissa) || !Number.isFinite(amount.exponent)) return;
  s.money = s.money.add(amount); s.lifetime = s.lifetime.add(amount); s.runEarnings = s.runEarnings.add(amount);
}
export function startRepair(s: GameState, id: number): boolean {
  const st = s.stations[id];
  if (!st || !st.owned || st.manager || st.running || producers[id].zone > s.zone) return false;
  st.running = true; return true;
}
export function tick(s: GameState, dt = BALANCE.tick as number): void {
  if (!Number.isFinite(dt) || dt <= 0 || dt > 1) return;
  const boosted = s.boostUntil > s.now;
  s.now += dt;
  for (let i = 0; i < 30; i++) {
    const st = s.stations[i], p = producers[i];
    if (p.zone > s.zone || !st.owned || (!st.manager && !st.running)) continue;
    st.progress += dt;
    if (st.progress + 1e-8 >= p.seconds) {
      const cycles = Math.floor((st.progress + 1e-8) / p.seconds);
      earn(s, stationRate(s, i).mul(p.seconds * cycles * (boosted ? 2 : 1)));
      if (boosted && !s.pro) s.adIncome = s.adIncome.add(stationRate(s, i).mul(p.seconds * cycles));
      s.repairs += cycles; st.progress = st.manager ? Math.max(0, st.progress - cycles * p.seconds) : 0;
      if (!st.manager) st.running = false;
    }
  }
}
