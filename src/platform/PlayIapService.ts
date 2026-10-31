import { Purchases, type PurchasesPackage } from '@revenuecat/purchases-capacitor';
import type { IapService } from './contracts';
export class PlayIapService implements IapService {
  private configured = false; private product?: PurchasesPackage;
  onChange = (_pro: boolean) => {};
  async init(): Promise<boolean> {
    const key = import.meta.env.VITE_REVENUECAT_ANDROID_KEY as string | undefined;
    if (!key) return false;
    if (!this.configured) {
      await Purchases.configure({ apiKey: key });
      await Purchases.addCustomerInfoUpdateListener(info => { this.onChange(!!info.entitlements.active.pro); });
      this.configured = true;
    }
    const { customerInfo } = await Purchases.getCustomerInfo();
    // Bind this non-consumable product to entitlement "pro" and default offering.
    try { this.product = (await Purchases.getOfferings()).current?.availablePackages.find(p => p.product.identifier === 'spark_shop_pro'); }
    catch { this.product = undefined; }
    return !!customerInfo.entitlements.active.pro;
  }
  async price(): Promise<string | null> { return this.product?.product.priceString ?? null; }
  async purchase(): Promise<boolean> {
    if (!this.configured || !this.product) return false;
    const result = await Purchases.purchasePackage({ aPackage: this.product });
    return !!result.customerInfo.entitlements.active.pro;
  }
  async restore(): Promise<boolean> {
    if (!this.configured) await this.init(); if (!this.configured) return false;
    return !!(await Purchases.restorePurchases()).customerInfo.entitlements.active.pro;
  }
}
