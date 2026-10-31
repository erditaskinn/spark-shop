import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { game } from '../ui/controller';
import { uiBridge } from '../ui/App';
import { AdMobAdsService } from './AdMobAdsService';
import { PlayIapService } from './PlayIapService';
import { setServices } from './runtime';
import { scheduleNotification } from './notifications';
export async function installNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const ads = new AdMobAdsService(), iap = new PlayIapService();
  ads.onChange = () => game.emit(); iap.onChange = pro => { game.state.pro = pro; game.emit(); };
  setServices(ads, iap);
  await App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) game.resume(); else void game.background().then(() => scheduleNotification(game.state)).catch(() => {});
  });
  // Capacitor uses the AndroidX dispatcher, including Android 16 predictive back.
  await App.addListener('backButton', () => { if (!uiBridge.back()) void App.minimizeApp(); });
}
