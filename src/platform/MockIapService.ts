import type { IapService } from './contracts';
export class MockIapService implements IapService {
  async init(): Promise<boolean> { return localStorage.getItem('spark:mockPro') === 'true'; }
  async purchase(): Promise<boolean> { localStorage.setItem('spark:mockPro', 'true'); return true; }
  async restore(): Promise<boolean> { return this.init(); }
  async price(): Promise<string> { return 'DEMO'; }
}
