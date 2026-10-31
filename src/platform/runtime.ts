import { game } from '../ui/controller';
import { collectOffline } from '../core/progression';
import { grantReward, markAdStarted, offerReward, type RewardContext } from '../core/rewards';
import { translate } from '../i18n';
import type { PlacementId } from '../data/rewardedPlacements';
import { MockAdsService } from './MockAdsService';
import { MockIapService } from './MockIapService';
import { muteAudio } from './audio';
import { analytics } from './analytics';
import { requestNotifications, scheduleNotification } from './notifications';
import type { AdsService, IapService } from './contracts';
import type { RewardActions } from '../ui/Rewards';
export const mockAds = new MockAdsService();
let ads: AdsService = mockAds, iap: IapService = new MockIapService();
let busy = false, initializing = false, initialized = false, retryAfter = 0;
export function setServices(adService: AdsService, iapService: IapService): void { ads = adService; iap = iapService; }
const notify = (key: string) => { game.error = key; game.emit(); };
export const actions: RewardActions = {
  ready: id => !busy && ads.isRewardedReady(id), price: null,
  offered(id) { analytics.track('ad_offered', { placement: id }); },
  watch: (id, context) => { void watch(id, context); },
  buyPro: () => { void purchase(); },
};
async function purchase(): Promise<void> {
  if (busy) return; busy = true;
  try { game.state.pro = await iap.purchase(); if (game.state.pro) { collectOffline(game.state); notify('shop.active'); } }
  catch { notify('error'); } finally { busy = false; await game.persist(); game.emit(); }
}
async function watch(id: PlacementId, context?: RewardContext): Promise<void> {
  if (busy || !ads.isRewardedReady(id)) return;
  const s = game.state, ticket = offerReward(s, id, context); if (!ticket) return;
  busy = true; muteAudio(true); markAdStarted(s, ticket); analytics.track('ad_started', { placement: id }); game.emit();
  try {
    const earned = await ads.show(id, () => {
      if (game.state !== s || !grantReward(s, ticket)) return;
      analytics.track('ad_rewarded', { placement: id }); void game.persist(); game.emit();
    });
    if (!earned) { analytics.track('ad_failed', { placement: id }); notify('adFailed'); }
    else notify('rewarded');
  } catch { analytics.track('ad_failed', { placement: id }); notify('adFailed'); }
  finally { busy = false; muteAudio(false); game.emit(); }
}
export async function initializeServices(): Promise<void> {
  if (initialized || initializing || Date.now() < retryAfter || game.state.settings.age === 'unknown') return;
  initializing = true;
  try {
    game.state.pro = await iap.init(); actions.price = await iap.price();
    if (game.state.pro) { collectOffline(game.state); game.state.boostUntil = Math.max(game.state.boostUntil, game.state.now + 7200); }
    await ads.init(game.state.settings.age === 'minor'); initialized = true;
  } catch { retryAfter = Date.now() + 60000; notify('adFailed'); }
  finally { initializing = false; game.emit(); }
}
export const settingsActions = {
  privacy: () => { void ads.privacyOptions().then(shown => { if (!shown) notify('settings.privacy.none'); }).catch(() => notify('error')); },
  restore: () => { void iap.restore().then(pro => { game.state.pro = pro; notify('shop.restore.done'); return game.persist(); }).catch(() => notify('error')); },
  notifications: () => { void (async () => {
    try {
      const s = game.state;
      if (s.settings.notifications) { s.settings.notifications = false; await scheduleNotification(s); }
      else if (!await requestNotifications(s)) notify('settings.notification.denied');
      await game.persist(); game.emit();
    } catch { notify('error'); }
  })(); },
};
mockAds.onChange = () => game.emit();
export function text(key: string): string { return translate(game.state.settings.language, key); }
