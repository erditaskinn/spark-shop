import { expect, test } from 'vitest';
import { createState } from './state';
import { adEligible, boostAwardSeconds, grantReward, markAdStarted, offerReward } from './rewards';
import { D } from './numbers';
test('only rewarded callbacks grant once and impressions respect global gap', () => {
  const s = createState(); s.now = 600; const t = offerReward(s, 'chest')!; const before = s.money;
  expect(grantReward(s, t)).toBe(false); expect(s.money.eq(before)).toBe(true);
  markAdStarted(s, t); expect(adEligible(s, 'boost')).toBe(false);
  expect(grantReward(s, t)).toBe(true); const after = s.money;
  expect(grantReward(s, t)).toBe(false); expect(s.money.eq(after)).toBe(true);
  s.now = 631; expect(adEligible(s, 'boost')).toBe(true); expect(adEligible(s, 'chest')).toBe(false);
});
test('boost stacks within eight hours and daily caps enforced', () => {
  const s = createState(); s.boostUntil = 28000; const t = offerReward(s, 'boost')!;
  expect(boostAwardSeconds(s)).toBe(800);
  markAdStarted(s, t); grantReward(s, t); expect(s.boostUntil).toBe(28800);
  s.now = 7200; s.adCounts['0:boost'] = 4; expect(adEligible(s, 'boost')).toBe(false);
});
test('offline snapshot cannot be replayed on a later welcome', () => {
  const s = createState(); s.offline = D(100); s.offlineId = 1;
  const t = offerReward(s, 'welcome')!; markAdStarted(s, t); s.offlineId = 2;
  expect(grantReward(s, t)).toBe(false); expect(s.offline.eq(100)).toBe(true);
});
