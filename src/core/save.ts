import { createState, type GameState } from './state';
import { safeMoney } from './numbers';
const integer = (v: unknown, max = 1e12) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0;
export function serialize(s: GameState): string { return JSON.stringify(s); }
export function deserialize(text: string, now: number): GameState {
  const s = createState(now);
  try {
    const raw: unknown = JSON.parse(text);
    if (!raw || typeof raw !== 'object') return s;
    const r = raw as Record<string, unknown>;
    // v1 used cash; v2 stores money and separate lifetime/run earnings.
    for (const k of ['money', 'lifetime', 'runEarnings', 'offline', 'adIncome'] as const) s[k] = safeMoney(k === 'money' ? r.money ?? r.cash : r[k]);
    for (const k of ['zone', 'reputation', 'badges', 'prestiges', 'seed', 'boostUntil', 'savedAt', 'faultAt', 'faultUntil', 'faultComponent', 'faults', 'purchases', 'repairs', 'adsWatched', 'offlineSeconds', 'offlineId', 'tutorial', 'loginStreak'] as const) {
      if (r[k] !== undefined) s[k] = integer(r[k]);
    }
    s.zone = Math.min(4, s.zone); s.tutorial = Math.min(5, s.tutorial); s.loginStreak %= 7;
    s.now = Math.max(s.savedAt, now); s.boostUntil = Math.min(s.boostUntil, s.now + 8 * 3600);
    for (const k of ['loginDay', 'missionDay', 'lastAd'] as const) if (typeof r[k] === 'number' && Number.isFinite(r[k])) s[k] = r[k];
    if (Array.isArray(r.stations)) r.stations.slice(0, 30).forEach((v, i) => {
      if (!v || typeof v !== 'object') return;
      s.stations[i] = { owned: integer(v.owned, 10000), manager: v.manager === true,
        progress: Math.min(11.99, integer(v.progress)), running: v.running === true };
    });
    for (const [k, max] of [['research', 40], ['achievements', 50], ['missionClaims', 3]] as const) {
      const list = r[k]; if (Array.isArray(list)) s[k] = [...new Set(list.filter((v): v is number => Number.isInteger(v) && v >= 0 && v < max))];
    }
    if (Array.isArray(r.missionBase)) s.missionBase = [0, 1, 2].map(i => integer((r.missionBase as unknown[])[i]));
    if (Array.isArray(r.rewarded)) s.rewarded = r.rewarded.filter((v): v is string => typeof v === 'string').slice(-256);
    for (const k of ['adCounts', 'adTimes'] as const) if (r[k] && typeof r[k] === 'object') {
      for (const [id, v] of Object.entries(r[k] as object).slice(-100)) if (/^[a-z0-9:_-]+$/i.test(id)) s[k][id] = integer(v);
    }
    if (r.settings && typeof r.settings === 'object') {
      const x = r.settings as Record<string, unknown>;
      for (const k of ['sound', 'haptics', 'motion', 'notifications'] as const) if (typeof x[k] === 'boolean') s.settings[k] = x[k];
      if (x.language === 'en' || x.language === 'tr') s.settings.language = x.language;
      if (x.age === 'minor' || x.age === 'adult') s.settings.age = x.age;
    }
    // Pro is never trusted from an import; platform verifies it at launch.
    return s;
  } catch { return s; }
}
export interface SaveStorage { get(key: string): Promise<string | null>; set(key: string, value: string): Promise<void> }
export async function save(s: GameState, storage: SaveStorage): Promise<void> {
  const previous = await storage.get('save');
  if (previous) await storage.set('backup', previous);
  s.savedAt = s.now; await storage.set('save', serialize(s));
}
export async function load(storage: SaveStorage, now: number): Promise<GameState> {
  for (const key of ['save', 'backup']) {
    const raw = await storage.get(key);
    if (raw) try { const parsed: unknown = JSON.parse(raw); if (parsed && typeof parsed === 'object') return deserialize(raw, now); } catch { /* try backup */ }
  }
  return createState(now);
}
