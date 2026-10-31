import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { offlineCap } from '../core/progression';
import { translate } from '../i18n';
import type { GameState } from '../core/state';
export async function requestNotifications(s: GameState): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const permission = await LocalNotifications.requestPermissions(); s.settings.notifications = permission.display === 'granted';
  return s.settings.notifications;
}
export async function scheduleNotification(s: GameState): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
  if (!s.settings.notifications) return;
  const earliest = s.now + Math.max(offlineCap(s), 86400);
  // One outstanding notification; no repeating alarm, no exact-alarm permission.
  await LocalNotifications.schedule({ notifications: [{ id: 1, title: translate(s.settings.language, s.stations.some(st => st.manager) ? 'notification.cap' : 'notification.daily'), body: translate(s.settings.language, 'tagline'), schedule: { at: new Date(earliest * 1000), allowWhileIdle: false } }] });
}
