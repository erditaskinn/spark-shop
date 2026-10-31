import type { PlacementId } from '../data/rewardedPlacements';
export interface AdsService {
  init(underAge: boolean): Promise<void>; isRewardedReady(id: PlacementId): boolean;
  show(id: PlacementId, rewarded: () => void, started?: () => void): Promise<boolean>; privacyOptions(): Promise<boolean>;
}
export interface IapService { init(): Promise<boolean>; purchase(): Promise<boolean>; restore(): Promise<boolean>; price(): Promise<string | null> }
export interface CloudSaveService { upload(code: string): Promise<void>; download(): Promise<string | null> }
export class CloudSaveStub implements CloudSaveService {
  async upload(_code: string): Promise<void> { throw new Error('Cloud save is not connected'); }
  async download(): Promise<null> { return null; }
}
export interface Analytics { track(event: string, properties?: Record<string, string | number>): void }
