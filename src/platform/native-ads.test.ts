import { expect, test, vi } from 'vitest';
const native = vi.hoisted(() => ({
  listeners: new Map<string, () => void>(),
  consent: vi.fn(async () => ({ status: 'REQUIRED', isConsentFormAvailable: true, canRequestAds: false, privacyOptionsRequirementStatus: 'REQUIRED' })),
  form: vi.fn(async () => ({ status: 'OBTAINED', canRequestAds: true, privacyOptionsRequirementStatus: 'REQUIRED' })),
  initialize: vi.fn(async () => {}), prepare: vi.fn(async () => ({})),
  show: vi.fn(async () => ({ amount: 1, type: 'coin' })),
}));
vi.mock('@capacitor-community/admob', () => ({
  AdMob: { requestConsentInfo: native.consent, showConsentForm: native.form, initialize: native.initialize,
    prepareRewardVideoAd: native.prepare, showRewardVideoAd: native.show,
    addListener: async (event: string, fn: () => void) => { native.listeners.set(event, fn); }, showPrivacyOptionsForm: async () => {} },
  AdmobConsentStatus: { REQUIRED: 'REQUIRED' }, MaxAdContentRating: { Teen: 'Teen' },
  RewardAdPluginEvents: { Showed: 'showed', Rewarded: 'rewarded', Dismissed: 'dismissed', FailedToShow: 'failed' },
}));
import { AdMobAdsService } from './AdMobAdsService';
test('UMP precedes loading; show result and dismissal never grant; duplicate events ignored', async () => {
  const ads = new AdMobAdsService(); await ads.init(true);
  expect(native.consent.mock.invocationCallOrder[0]).toBeLessThan(native.form.mock.invocationCallOrder[0]);
  expect(native.form.mock.invocationCallOrder[0]).toBeLessThan(native.initialize.mock.invocationCallOrder[0]);
  expect(native.initialize.mock.invocationCallOrder[0]).toBeLessThan(native.prepare.mock.invocationCallOrder[0]);
  const reward = vi.fn(), started = vi.fn(); const first = ads.show('boost', reward, started);
  native.listeners.get('showed')!(); native.listeners.get('showed')!();
  await Promise.resolve(); expect(started).toHaveBeenCalledTimes(1); expect(reward).not.toHaveBeenCalled();
  native.listeners.get('dismissed')!(); expect(await first).toBe(false); await Promise.resolve();
  const second = ads.show('boost', reward); native.listeners.get('rewarded')!(); native.listeners.get('rewarded')!();
  expect(reward).toHaveBeenCalledTimes(1); native.listeners.get('dismissed')!(); expect(await second).toBe(true);
});
test('failed loading remains unready and retries with backoff', async () => {
  vi.useFakeTimers(); native.prepare.mockRejectedValueOnce(new Error('offline'));
  const ads = new AdMobAdsService(); await ads.init(false); expect(ads.isRewardedReady('boost')).toBe(false);
  await vi.advanceTimersByTimeAsync(1000); expect(ads.isRewardedReady('boost')).toBe(true); vi.useRealTimers();
});
