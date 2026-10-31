import { describe, expect, test } from 'vitest';
import { createState } from './state';
import { D, format } from './numbers';
import { affordable, buy, cost, hire, startRepair, tick } from './economy';
import { deserialize, load, save, serialize } from './save';
describe('station economy', () => {
  test('first purchase immediately; manual cycles and managers', () => {
    const s = createState(); expect(buy(s, 0, 1)).toBe(true); expect(s.money.gte(0)).toBe(true);
    expect(startRepair(s, 0)).toBe(true); for (let i = 0; i < 20; i++) tick(s);
    expect(s.lifetime.gt(0)).toBe(true); expect(s.stations[0].running).toBe(false);
    s.money = D(1000); expect(hire(s, 0)).toBe(true); expect(hire(s, 0)).toBe(false);
    for (let i = 0; i < 20; i++) tick(s); expect(s.repairs).toBe(2);
  });
  test('geometric bulk costs and max cannot overspend', () => {
    const s = createState(); s.money = D(100000);
    const n = affordable(s, 0); expect(cost(s, 0, n).lte(s.money)).toBe(true);
    expect(cost(s, 0, n + 1).gt(s.money)).toBe(true); expect(buy(s, 0, 'max')).toBe(true);
    expect(s.money.gte(0)).toBe(true); expect(buy(s, 6, 1)).toBe(false);
  });
  test('huge numbers and formatting', () => { expect(format(D('1e15'))).toBe('1aa'); expect(format(1230)).toBe('1.23K'); });
});
describe('save safety', () => {
  test('repairs a zero-income dead end and clamps corrupted daily clocks', () => {
    const s = deserialize('{"money":0,"stations":[{"owned":0}],"lastAd":999999999,"missionDay":99999}', 100);
    expect(s.stations[0].owned).toBe(1); expect(s.lastAd).toBe(100); expect(s.missionDay).toBe(0);
    startRepair(s, 0); for (let i = 0; i < 20; i++) tick(s); expect(s.money.gt(0)).toBe(true);
  });
  test('migrates and repairs corrupt fields, ignores imported entitlement', () => {
    const s = deserialize('{"version":1,"cash":"123","zone":999,"reputation":-2,"stations":[{"owned":-8}],"pro":true}', 10);
    expect(s.money.eq(123)).toBe(true); expect(s.zone).toBe(4); expect(s.reputation).toBe(0);
    expect(s.stations[0].owned).toBe(0); expect(s.pro).toBe(false);
    expect(deserialize('bad', 10).money.eq(11)).toBe(true);
    expect(deserialize('{"money":"NaN"}', 0).money.eq(0)).toBe(true);
  });
  test('round trip and previous backup recovery', async () => {
    const map = new Map<string, string>(); const storage = { get: async (k: string) => map.get(k) ?? null, set: async (k: string, v: string) => { map.set(k, v); } };
    const s = createState(10); await save(s, storage); s.money = D('1e50'); await save(s, storage);
    expect(deserialize(serialize(s), 12).money.eq('1e50')).toBe(true);
    map.set('save', 'broken'); expect((await load(storage, 11)).money.eq(11)).toBe(true);
  });
});
