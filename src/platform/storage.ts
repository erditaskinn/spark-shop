import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { SaveStorage } from '../core/save';
export const storage: SaveStorage = {
  async get(key) { return Capacitor.isNativePlatform() ? (await Preferences.get({ key })).value : localStorage.getItem(`spark:${key}`); },
  async set(key, value) { if (Capacitor.isNativePlatform()) await Preferences.set({ key, value }); else localStorage.setItem(`spark:${key}`, value); },
};
