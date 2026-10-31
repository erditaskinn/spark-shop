import { expect, test } from 'vitest';
import { simulate } from './bot';
test('active onboarding pacing and no dead ends', () => {
  const r = simulate(false, 'active'); console.log('ACTIVE PACING', JSON.stringify(r));
  expect(r.firstPurchase).toBeLessThanOrEqual(5);
  expect(r.firstManager).toBeLessThanOrEqual(120 * 1.5);
  expect(r.zones[1]).toBeGreaterThanOrEqual(600); expect(r.zones[1]).toBeLessThanOrEqual(900 * 1.5);
  expect(r.prestiges[0]).toBeGreaterThan(0); expect(r.prestiges[0]).toBeLessThanOrEqual(3600 * 1.5);
  expect(r.longestStall).toBeLessThanOrEqual(600);
}, 60000);
test('seven-day two-check-in profiles and ad acceleration guard', () => {
  const free = simulate(false), ads = simulate(true); console.log('SEVEN DAYS', JSON.stringify({ free, ads }));
  expect(free.zones.length).toBe(5); expect(ads.zones.length).toBe(5);
  for (let i = 1; i < 5; i++) expect(free.zones[i] / ads.zones[i]).toBeLessThanOrEqual(2.5);
  expect(free.prestiges[0] / ads.prestiges[0]).toBeLessThanOrEqual(2.5);
  expect(ads.impressions.every(n => n <= 24)).toBe(true);
}, 60000);
