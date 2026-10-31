import { tick } from '../core/economy';
import { collectOffline, settleOffline, updateFault } from '../core/progression';
import { createState, type GameState } from '../core/state';
import { load, save } from '../core/save';
import { deviceLanguage } from '../i18n';
import { storage } from '../platform/storage';
export class GameController {
  state: GameState = createState(Date.now() / 1000);
  listeners = new Set<() => void>();
  paused = false; last = performance.now(); accumulator = 0; saveCounter = 0;
  error = ''; private saveQueue = Promise.resolve();
  async init(): Promise<void> {
    try {
      const exists = await storage.get('save'); this.state = await load(storage, Date.now() / 1000);
      if (!exists) this.state.settings.language = deviceLanguage();
      settleOffline(this.state, Date.now() / 1000);
    } catch { this.error = 'error'; }
    this.emit();
  }
  emit(): void { this.listeners.forEach(fn => fn()); }
  update(): void {
    const now = performance.now(), elapsed = Math.min(1, Math.max(0, (now - this.last) / 1000)); this.last = now;
    if (this.paused) return;
    this.accumulator += elapsed;
    while (this.accumulator >= 0.1) { tick(this.state); updateFault(this.state); this.accumulator -= 0.1; }
    this.saveCounter += elapsed;
    if (this.saveCounter >= 10) { this.saveCounter = 0; void this.persist(); }
    this.emit();
  }
  async persist(): Promise<void> {
    this.saveQueue = this.saveQueue.then(() => save(this.state, storage)).catch(() => { this.error = 'error'; });
    await this.saveQueue;
  }
  async background(): Promise<void> { if (this.paused) return; this.paused = true; await this.persist(); }
  resume(): void {
    if (!this.paused) return;
    settleOffline(this.state, Date.now() / 1000); if (this.state.pro) collectOffline(this.state);
    this.paused = false; this.last = performance.now(); this.accumulator = 0; this.emit();
  }
}
export const game = new GameController();
