export const achievements = Array.from({ length: 50 }, (_, id) => {
  const kind = Math.floor(id / 10), rank = id % 10;
  const goals = [5 * 2 ** rank, 10 * 3 ** rank, 1 + rank * 5, 1 + Math.floor(rank / 2), [1, 2, 5, 10, 25, 50, 100, 500, 1000, 5000][rank]];
  return { id, kind, rank: rank + 1, goal: goals[kind], badges: 1 + Math.floor(rank / 3), key: `achievement.${kind}` };
});
export const missionTemplates = Array.from({ length: 20 }, (_, id) => {
  const kind = id < 7 ? 0 : id < 14 ? 1 : 2, rank = id - (kind === 0 ? 0 : kind === 1 ? 7 : 14);
  return { id, kind, goal: [5 + rank * 3, 10 + rank * 10, 1 + rank][kind], minutes: 0.25 + rank * 0.05, key: `mission.${kind}` };
});
export const loginCycle = [0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.75];
export const events = [
  { id: 0, key: 'event.0', income: 2, managed: 1, faultInterval: 30 },
  { id: 1, key: 'event.1', income: 1.25, managed: 1, faultInterval: 40 },
  { id: 2, key: 'event.2', income: 1, managed: 1.5, faultInterval: 40 },
];
export function currentEvent(now: number) {
  const day = Math.floor(now / 86400), weekday = (day + 4) % 7;
  return weekday === 0 || weekday >= 5 ? events[Math.floor(day / 7) % 3] : null;
}
