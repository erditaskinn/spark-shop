import type { GameState } from '../core/state';
export type T = (key: string) => string;
export interface ScreenProps { s: GameState; t: T; act: (fn: () => unknown, feedback?: string) => void }
