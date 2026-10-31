import { render } from 'preact';
import { App } from './ui/App';
import { game } from './ui/controller';
import './ui/styles.css';
await game.init();
render(<App actions={{ ready: () => false, watch: () => {}, buyPro: () => {}, price: null }} settingsActions={{ privacy: () => {}, restore: () => {}, notifications: () => {} }}/>, document.getElementById('app')!);
setInterval(() => game.update(), 100);
document.addEventListener('visibilitychange', () => { if (document.hidden) void game.background(); else game.resume(); });
