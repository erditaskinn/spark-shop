import { expect, test, vi } from 'vitest';
import { MockAdsService } from './MockAdsService';
test('mock completes only after 3 seconds and cancel never rewards', async () => {
  vi.useFakeTimers(); const ads = new MockAdsService(); await ads.init(); const rewarded = vi.fn();
  const pending = ads.show('boost', rewarded); await vi.advanceTimersByTimeAsync(2999); expect(rewarded).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(101); expect(await pending).toBe(true); expect(rewarded).toHaveBeenCalledTimes(1);
  const cancel = ads.show('boost', rewarded); ads.view!.cancel(); expect(await cancel).toBe(false); expect(rewarded).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
