import { render } from 'preact';
import { App } from './ui/App';
import { game } from './ui/controller';
import './ui/styles.css';
import { actions, initializeServices, settingsActions } from './platform/runtime';
import { scheduleNotification } from './platform/notifications';
import { installNative } from './platform/native';
await game.init();
await installNative();
game.listeners.add(() => { void initializeServices(); });
render(<App actions={actions} settingsActions={settingsActions}/>, document.getElementById('app')!);
// A stable fixture handle for the local browser regression. Vite removes this
// branch entirely from Android/production builds.
if (import.meta.env.DEV) Object.assign(window, { __sparkTest: { game, actions } });
void initializeServices();
setInterval(() => game.update(), 100);
document.addEventListener('visibilitychange', () => { if (document.hidden) void game.background().then(() => scheduleNotification(game.state)).catch(() => {}); else game.resume(); });
