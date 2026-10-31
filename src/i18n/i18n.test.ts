import { expect, test } from 'vitest';
import en from './en.json';
import tr from './tr.json';
import { producers } from '../data/content';
test('all strings translated and exact titles', () => {
  expect(Object.keys(en).sort()).toEqual(Object.keys(tr).sort());
  for (const key of Object.keys(en)) expect(tr[key as keyof typeof tr].length).toBeGreaterThan(0);
  expect(en['game.title']).toBe('Spark Shop: Idle Repair Empire'); expect(tr['game.title']).toBe(en['game.title']);
  for (const p of producers) expect(en[p.key as keyof typeof en]).toBeTruthy();
});
