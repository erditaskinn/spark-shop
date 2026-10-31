import { AdMob, AdmobConsentStatus, MaxAdContentRating, RewardAdPluginEvents } from '@capacitor-community/admob';
import { adsConfig, rewardedUnit } from '../config/ads.config';
import type { PlacementId } from '../data/rewardedPlacements';
import type { AdsService } from './contracts';
import { analytics } from './analytics';
interface ActiveAd { earned: boolean; started: boolean; reward: () => void; onStarted: () => void; finish: () => void }
export class AdMobAdsService implements AdsService {
  private ready = false; private loading = false; private consent = false; private initialized = false;
  private attached = false; private retry = 1; private retryTimer?: ReturnType<typeof setTimeout>;
  private active?: ActiveAd; private privacyRequired = false;
  private underAge = true;
  onChange = () => {};
  async init(underAge: boolean): Promise<void> {
    this.underAge = underAge;
    let info = await AdMob.requestConsentInfo({ tagForUnderAgeOfConsent: underAge, testDeviceIdentifiers: adsConfig.testDevices });
    if (info.status === AdmobConsentStatus.REQUIRED && info.isConsentFormAvailable) info = await AdMob.showConsentForm();
    this.privacyRequired = info.privacyOptionsRequirementStatus === 'REQUIRED';
    this.consent = info.canRequestAds;
    if (!this.consent) { this.ready = false; this.onChange(); return; }
    if (!this.initialized) {
      await AdMob.initialize({ initializeForTesting: !adsConfig.production, testingDevices: adsConfig.testDevices,
        tagForChildDirectedTreatment: false, tagForUnderAgeOfConsent: underAge, maxAdContentRating: MaxAdContentRating.Teen });
      this.initialized = true;
    }
    if (!this.attached) {
      await AdMob.addListener(RewardAdPluginEvents.Showed, () => {
        if (this.active && !this.active.started) { this.active.started = true; this.active.onStarted(); }
      });
      await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        if (!this.active || this.active.earned) return;
        this.active.earned = true; this.active.reward();
      });
      await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => { this.active?.finish(); });
      await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => { this.active?.finish(); });
      this.attached = true;
    }
    await this.preload();
  }
  isRewardedReady(_id: PlacementId): boolean { return this.ready && this.consent && !this.active; }
  private async preload(): Promise<void> {
    if (!this.consent || this.loading || this.ready) return;
    clearTimeout(this.retryTimer); this.loading = true;
    try {
      await AdMob.prepareRewardVideoAd({ adId: rewardedUnit(), isTesting: !adsConfig.production });
      this.ready = true; this.retry = 1;
    } catch {
      this.ready = false; analytics.track('ad_failed', { placement: 'preload' });
      this.retryTimer = setTimeout(() => { void this.preload(); }, Math.min(60, this.retry) * 1000);
      this.retry = Math.min(60, this.retry * 2);
    } finally { this.loading = false; this.onChange(); }
  }
  async show(id: PlacementId, rewarded: () => void, onStarted: () => void = () => {}): Promise<boolean> {
    if (!this.isRewardedReady(id)) return false;
    this.ready = false;
    return new Promise(resolve => {
      let finished = false;
      const finish = () => {
        if (finished) return; finished = true; clearTimeout(timeout);
        const earned = this.active?.earned === true; this.active = undefined;
        this.onChange(); void this.preload(); resolve(earned);
      };
      const timeout = setTimeout(finish, 180000);
      this.active = { earned: false, started: false, reward: rewarded, onStarted, finish };
      // The Promise result is intentionally ignored. Only Rewarded grants anything.
      void AdMob.showRewardVideoAd({ adId: rewardedUnit() }).catch(finish);
      this.onChange();
    });
  }
  async privacyOptions(): Promise<boolean> {
    if (!this.privacyRequired) return false;
    this.ready = false; clearTimeout(this.retryTimer); await AdMob.showPrivacyOptionsForm();
    const info = await AdMob.requestConsentInfo({ tagForUnderAgeOfConsent: this.underAge }); this.consent = info.canRequestAds;
    this.privacyRequired = info.privacyOptionsRequirementStatus === 'REQUIRED';
    if (this.consent) await this.preload(); this.onChange(); return true;
  }
}
