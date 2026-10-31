export const adsConfig = {
  production: import.meta.env.PROD && import.meta.env.VITE_ADMOB_PRODUCTION === 'true',
  rewardedUnitId: import.meta.env.VITE_REWARDED_UNIT_ID as string | undefined,
  testDevices: ((import.meta.env.VITE_ADMOB_TEST_DEVICES as string | undefined) ?? '').split(',').filter(Boolean),
  testRewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
};
export function rewardedUnit(): string {
  if (!adsConfig.production) return adsConfig.testRewardedUnitId;
  if (!adsConfig.rewardedUnitId || !/^ca-app-pub-\d{16}\/\d{10}$/.test(adsConfig.rewardedUnitId) || adsConfig.rewardedUnitId.includes('3940256099942544')) throw new Error('Production REWARDED_UNIT_ID must be configured');
  return adsConfig.rewardedUnitId;
}
