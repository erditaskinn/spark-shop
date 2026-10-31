import { useEffect, useState } from 'preact/hooks';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { translate } from '../i18n';
import { catchFault, collectOffline } from '../core/progression';
import { income } from '../core/economy';
import { chestFree } from '../core/rewards';
import { format } from '../core/numbers';
import { playSound } from '../platform/audio';
import { game } from './controller';
import { Board } from './Board';
import { Stations } from './Stations';
import { Prestige, Research, Zones } from './ProgressionScreens';
import { Settings, type SettingsActions } from './Settings';
import { AdButton, Offline, Shop, type RewardActions } from './Rewards';
import { Goals } from './Goals';
import { MockVideo } from './MockVideo';
import { currentEvent } from '../data/meta';
import { Icon, type IconName } from './Icon';
import { Wallet } from './Wallet';
export type Screen = 'main' | 'zones' | 'research' | 'prestige' | 'more' | 'missions' | 'shop' | 'settings';
const icons: Record<'main' | 'zones' | 'research' | 'prestige' | 'more', IconName> = { main: 'wrench', zones: 'layers', research: 'flask', prestige: 'star', more: 'menu' };
export const uiBridge = { back: (): boolean => false };
export function App({ actions, settingsActions }: { actions: RewardActions; settingsActions: SettingsActions }) {
  const [, refresh] = useState(0), [screen, setScreen] = useState<Screen>('main'), [toast, setToast] = useState(''), [floating, setFloating] = useState('');
  const s = game.state, t = (key: string) => translate(s.settings.language, key), platformMessage = game.error;
  useEffect(() => { const listener = () => refresh(x => x + 1); game.listeners.add(listener); return () => { game.listeners.delete(listener); }; }, []);
  useEffect(() => {
    if (!toast && !platformMessage) return;
    const id = setTimeout(() => { setToast(''); if (game.error === platformMessage) { game.error = ''; game.emit(); } }, 3500);
    return () => clearTimeout(id);
  }, [toast, platformMessage]);
  useEffect(() => { if (!floating) return; const id = setTimeout(() => setFloating(''), 900); return () => clearTimeout(id); }, [floating]);
  useEffect(() => { document.documentElement.lang = s.settings.language; document.body.classList.toggle('reduce-motion', !s.settings.motion); }, [s.settings.language, s.settings.motion]);
  useEffect(() => { uiBridge.back = () => { if (screen !== 'main') { setScreen('main'); return true; } return false; }; }, [screen]);
  const act = (fn: () => unknown, feedback?: string) => {
    try { const result = fn(); if (result !== false) { playSound(s.settings.sound); if (s.settings.haptics && Capacitor.isNativePlatform()) void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}); }
      if (feedback) feedback.startsWith('+') || feedback.startsWith('−') ? setFloating(feedback) : setToast(feedback);
    } catch { setToast(t('error')); } game.emit();
  };
  const props = { s, t, act }, rewardProps = { ...props, actions }, event = currentEvent(s.now);
  return <div class="app-shell">
    <header class="topbar"><a href="#" onClick={e => { e.preventDefault(); setScreen('main'); }} class="brand"><Icon name="chip"/><span>{t('game.shortTitle')}<small>{t('game.title')}</small></span></a><button class="icon-button" aria-label={t('nav.settings')} onClick={() => setScreen('settings')}><Icon name="settings"/></button></header>
    <Wallet s={s} t={t}/>
    <main id="main-content">
      {screen === 'main' ? <><Board {...props} onFault={() => act(() => { const amount = catchFault(s); if (amount.gt(0)) { setFloating(`+${format(amount)}`); playSound(s.settings.sound, true); } })}/>
        {s.tutorial < 5 ? <section class="tutorial panel"><div class="section-label"><span>{t('tutorial.title')}</span><span>{s.tutorial + 1}/5</span></div><p>{t(`tutorial.${s.tutorial}`)}</p><div class="two-buttons"><button onClick={() => act(() => { s.tutorial = 5; })}>{t('tutorial.skip')}</button><button class="primary" onClick={() => act(() => { s.tutorial++; })}>{t('tutorial.next')}</button></div></section> : null}
        {!s.pro ? <div class="boost-strip"><span class="boost-icon"><Icon name="clock"/></span><div class="boost-copy"><b>{t('boost')}</b><small>{s.boostUntil > s.now ? `×2 · ${Math.floor((s.boostUntil - s.now) / 3600)} ${t('hours')} ${Math.ceil((s.boostUntil - s.now) % 3600 / 60)} ${t('minutes')}` : t('boost.note')}</small></div><AdButton {...rewardProps} id="boost" compact/></div> : null}
        <Stations {...props}/>
        {event ? <div class="event-card"><span class="eyebrow">{t('event')}</span><h3>{t(event.key)}</h3><p>{t(`event.note.${event.id}`)}</p></div> : null}
        {!s.pro ? <article class="panel supply"><h3>◇ {t('supply')}</h3><p>{t('supply.choice')}</p>{s.now - (s.adTimes.freeChest ?? s.now) >= 600 ? <><button class="full" onClick={() => act(() => chestFree(s), `+${format(income(s).mul(900))}`)}>{t('supply.free')} · {format(income(s).mul(900))}</button><AdButton {...rewardProps} id="chest"/></> : <p>{t('supply.next')} {Math.ceil(Math.max(0, 600 - s.now + (s.adTimes.freeChest ?? s.now)) / 60)} {t('minutes')}</p>}</article> : null}
        <p class="flavor">{t('bench.flavor')}</p><p class="official-title">{t('game.title')}</p></> : null}
      {screen === 'zones' ? <Zones {...props}/> : null}
      {screen === 'research' ? <Research {...props}/> : null}
      {screen === 'prestige' ? <Prestige {...props}/> : null}
      {screen === 'missions' ? <Goals {...rewardProps}/> : null}
      {screen === 'shop' ? <Shop {...rewardProps}/> : null}
      {screen === 'settings' ? <Settings {...props} actions={settingsActions}/> : null}
      {screen === 'more' ? <section class="page"><h2>{t('nav.more')}</h2>{(['missions', 'shop', 'settings'] as const).map(x => <button class="menu-card" onClick={() => setScreen(x)}>{t(`nav.${x}`)} <span>→</span></button>)}<div class="panel"><p>{t('total')}: {format(s.lifetime)}</p><p>{t('reputation')}: {format(s.reputation)}</p></div></section> : null}
    </main>
    <nav class="bottom-nav" aria-label={t('game.shortTitle')}>{(['main', 'zones', 'research', 'prestige', 'more'] as const).map(x => <button class={screen === x || (x === 'more' && ['missions', 'shop', 'settings'].includes(screen)) ? 'active' : ''} onClick={() => setScreen(x)}><Icon name={icons[x]}/><span>{t(`nav.${x}`)}</span></button>)}</nav>
    {floating ? <div class="floating-number" key={floating}>{floating}</div> : null}
    {toast || game.error ? <div class="toast" role="status" onClick={() => { setToast(''); game.error = ''; }}>{toast || t(game.error)}</div> : null}
    {s.offline.gt(0) ? <Offline {...rewardProps} collect={() => act(() => collectOffline(s))}/> : null}
    {s.settings.age === 'unknown' && s.offline.eq(0) ? <div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><Icon name="chip" className="welcome-chip"/><h1>{t('game.title')}</h1><h2>{t('age.title')}</h2><p>{t('age.note')}</p><div class="two-buttons"><button onClick={() => act(() => { s.settings.age = 'minor'; })}>{t('age.minor')}</button><button class="primary" onClick={() => act(() => { s.settings.age = 'adult'; })}>{t('age.adult')}</button></div></section></div> : null}
    <MockVideo/>
  </div>;
}
