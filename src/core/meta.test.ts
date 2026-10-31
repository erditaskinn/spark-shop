import { expect, test } from 'vitest';
import { achievements, currentEvent, events, loginCycle, missionTemplates } from '../data/meta';
import { managers, producers, zones } from '../data/content';
import { research } from '../data/research';
import { createState } from './state';
import { claimAchievement, claimLogin, claimMission, dailyMissions, refreshDaily } from './meta';
test('requested content volumes', () => {
  expect([zones.length, producers.length, managers.length, research.length, achievements.length, missionTemplates.length, events.length, loginCycle.length]).toEqual([5, 30, 30, 40, 50, 20, 3, 7]);
});
test('daily goals deterministic, claims once and roll forward only', () => {
  const s = createState(); refreshDaily(s); expect(dailyMissions(s).length).toBe(3);
  s.purchases = 100; expect(claimMission(s, 0)).toBe(true); expect(claimMission(s, 0)).toBe(false);
  expect(claimLogin(s)).toBe(true); expect(claimLogin(s)).toBe(false);
  s.now = 86400; refreshDaily(s); expect(s.missionClaims).toEqual([]); expect(s.missionBase[0]).toBe(100);
  s.now = 0; refreshDaily(s); expect(s.missionDay).toBe(1);
});
test('achievement rewards once; event schedule rotates', () => {
  const s = createState(); s.purchases = 5; expect(claimAchievement(s, 0)).toBe(true); expect(claimAchievement(s, 0)).toBe(false);
  expect(s.badges).toBe(1); expect(currentEvent(0)).toBeNull(); expect(currentEvent(86400)?.id).toBe(0); expect(currentEvent(8 * 86400)?.id).toBe(1);
});
