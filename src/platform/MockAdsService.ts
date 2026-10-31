import type { AdsService } from './contracts';
import type { PlacementId } from '../data/rewardedPlacements';
export interface MockAdView { remaining: number; cancel: () => void }
export class MockAdsService implements AdsService {
  view: MockAdView | null = null;
  onChange = () => {};
  initialized = false;
  async init(): Promise<void> { this.initialized = true; this.onChange(); }
  isRewardedReady(_id: PlacementId): boolean { return this.initialized && !this.view; }
  async show(_id: PlacementId, rewarded: () => void): Promise<boolean> {
    if (!this.initialized || this.view) return false;
    return new Promise(resolve => {
      let done = false; const start = performance.now();
      const finish = (earned: boolean) => {
        if (done) return; done = true; clearInterval(timer); this.view = null;
        if (earned) rewarded(); this.onChange(); resolve(earned);
      };
      this.view = { remaining: 3, cancel: () => finish(false) };
      const timer = setInterval(() => {
        if (!this.view) return;
        this.view.remaining = Math.max(0, 3 - (performance.now() - start) / 1000);
        if (this.view.remaining <= 0) finish(true); else this.onChange();
      }, 100);
      this.onChange();
    });
  }
  async privacyOptions(): Promise<boolean> { return false; }
}
