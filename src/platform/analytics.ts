import type { Analytics } from './contracts';
export class LocalAnalytics implements Analytics {
  events: { time: number; event: string; properties: Record<string, string | number> }[] = [];
  track(event: string, properties: Record<string, string | number> = {}): void {
    this.events.push({ time: Date.now(), event, properties }); this.events = this.events.slice(-500);
    try { localStorage.setItem('spark:analytics', JSON.stringify(this.events)); } catch { /* Diagnostics must not block play. */ }
  }
}
export class FirebaseAnalyticsStub implements Analytics { track(_event: string, _properties?: Record<string, string | number>): void { /* Wire a reviewed Firebase implementation here. */ } }
export const analytics = new LocalAnalytics();
