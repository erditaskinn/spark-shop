export type PlacementId = 'welcome' | 'boost' | 'chest' | 'skip1' | 'skip4' | 'login' | 'mission' | 'lucky' | 'research';
export interface Placement { id: PlacementId; type: 'offline' | 'boost' | 'income' | 'lucky' | 'claim'; minutes: number; cooldown: number; dailyCap: number; zone: number; enabled: boolean }
export const rewardedPlacements: Placement[] = [
  { id: 'welcome', type: 'offline', minutes: 0, cooldown: 60, dailyCap: 2, zone: 0, enabled: true },
  { id: 'boost', type: 'boost', minutes: 120, cooldown: 3600, dailyCap: 4, zone: 0, enabled: true },
  { id: 'chest', type: 'income', minutes: 45, cooldown: 600, dailyCap: 2, zone: 0, enabled: true },
  { id: 'skip1', type: 'income', minutes: 60, cooldown: 14400, dailyCap: 1, zone: 0, enabled: true },
  { id: 'skip4', type: 'income', minutes: 240, cooldown: 43200, dailyCap: 1, zone: 2, enabled: true },
  { id: 'login', type: 'claim', minutes: 10, cooldown: 86400, dailyCap: 1, zone: 0, enabled: true },
  { id: 'mission', type: 'claim', minutes: 10, cooldown: 60, dailyCap: 3, zone: 0, enabled: true },
  { id: 'lucky', type: 'lucky', minutes: 10, cooldown: 3600, dailyCap: 2, zone: 1, enabled: true },
  { id: 'research', type: 'income', minutes: 0, cooldown: 0, dailyCap: 0, zone: 0, enabled: false },
];
export const placement = (id: PlacementId) => rewardedPlacements.find(p => p.id === id)!;
