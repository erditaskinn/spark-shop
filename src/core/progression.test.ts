import { expect, test } from 'vitest';
import { createState } from './state';
import { D } from './numbers';
import { income, tick } from './economy';
import { buyResearch, catchFault, collectOffline, offlineCap, prestige, prestigeGain, settleOffline, unlockZone, updateFault } from './progression';
test('zone goals and old stations remain productive', () => {
  const s = createState(); expect(unlockZone(s)).toBe(false); s.runEarnings = D(2e5);
  expect(unlockZone(s)).toBe(true); expect(s.stations[0].owned).toBe(1); expect(s.zone).toBe(1);
});
test('prestige has exact incremental gain and preserves permanent items', () => {
  const s = createState(); s.lifetime = D(4e10); s.research = [0]; s.boostUntil = 80;
  expect(prestigeGain(s)).toBe(2); expect(prestige(s)).toBe(true);
  expect(s.reputation).toBe(2); expect(s.badges).toBe(2); expect(s.research).toEqual([0]);
  expect(prestige(s)).toBe(false); expect(s.boostUntil).toBe(80);
});
test('research prerequisites and cap', () => {
  const s = createState(); s.badges = 1000;
  expect(buyResearch(s, 17)).toBe(false); for (let id = 16; id < 24; id++) expect(buyResearch(s, id)).toBe(true);
  expect(offlineCap(s)).toBe(86400); expect(buyResearch(s, 16)).toBe(false);
});
test('offline limits clock rollback, accounts for boost expiry and cannot collect twice', () => {
  const s = createState(100); s.stations[0].manager = true; s.boostUntil = 160;
  const rate = income(s, true); settleOffline(s, 90); expect(s.offline.eq(0)).toBe(true);
  settleOffline(s, 100 + 90000); expect(s.offline.div(rate).toNumber()).toBeCloseTo(28860);
  const before = s.money; collectOffline(s, true); expect(s.money.gt(before)).toBe(true);
  expect(collectOffline(s).eq(0)).toBe(true); settleOffline(s, 90100); expect(s.offline.eq(0)).toBe(true);
});
test('offline equals long-run automated ticks within a cycle', () => {
  const a = createState(), b = createState(); a.stations[0].manager = true; b.stations[0].manager = true;
  for (let i = 0; i < 1000; i++) tick(a); settleOffline(b, 100); collectOffline(b);
  expect(a.money.toNumber()).toBeCloseTo(b.money.toNumber());
});
test('faults deterministic, three seconds and no miss penalty', () => {
  const a = createState(), b = createState(); a.now = b.now = 25; updateFault(a); updateFault(b);
  expect(a.faultAt).toBe(b.faultAt); expect(a.faultUntil).toBe(28);
  expect(catchFault(a).gt(0)).toBe(true); expect(catchFault(a).eq(0)).toBe(true);
  const money = b.money; b.now = 29; expect(catchFault(b).eq(0)).toBe(true); expect(b.money.eq(money)).toBe(true);
});
