export const BALANCE = {
  tick: 0.1, startingMoney: 11, payback: 85, managerFactor: 1.5,
  milestones: [25, 50, 100, 200, 300, 400, 500],
  zoneMilestones: [25, 50, 100],
  zoneGoals: [0, 2e5, 2e10, 2e15, 2e20], zoneMultiplier: 2,
  prestigeDivisor: 1.25e29, prestigeWorth: 100, reputationBonus: 0.02,
  offlineHours: 8, maxOfflineHours: 24, faultSeconds: 15,
  faultCapMinutes: 2, adGap: 30, boostMax: 8 * 3600,
} as const;
