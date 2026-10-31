import { BALANCE } from './balance';
export const zones = [1980, 1990, 2000, 2010, 2020].map((era, id) => ({
  id, era, goal: BALANCE.zoneGoals[id], key: `zone.${id}`,
}));
export const producers = Array.from({ length: 30 }, (_, id) => {
  const zone = Math.floor(id / 6), tier = id % 6;
  return { id, zone, tier, key: `station.${id}`, baseCost: 10 * 14 ** tier * 1e5 ** zone,
    growth: 1.07 + tier * 0.016, seconds: 2 + tier * 2 };
});
export const managers = producers.map(p => ({ id: p.id, key: `manager.${p.id}`, cost: p.baseCost * BALANCE.managerFactor }));
