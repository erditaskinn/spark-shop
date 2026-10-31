import { useState } from 'preact/hooks';
import { deserialize, serialize } from '../core/save';
import { createState } from '../core/state';
import { game } from './controller';
import type { ScreenProps } from './types';
export interface SettingsActions { privacy: () => void; restore: () => void; notifications: () => void }
export function Settings({ s, t, act, actions }: ScreenProps & { actions: SettingsActions }) {
  const [code, setCode] = useState(''), [reset, setReset] = useState(false);
  const toggle = (key: 'sound' | 'haptics' | 'motion') => act(() => { s.settings[key] = !s.settings[key]; });
  return <section class="page"><h2>{t('nav.settings')}</h2><article class="panel">
    {(['sound', 'haptics', 'motion'] as const).map(k => <label class="setting-row"><span>{t(`settings.${k}`)}</span><input type="checkbox" checked={s.settings[k]} onChange={() => toggle(k)}/></label>)}
    <label class="setting-row"><span>{t('settings.language')}</span><select value={s.settings.language} onChange={e => act(() => { s.settings.language = e.currentTarget.value as 'en' | 'tr'; })}><option value="en">English</option><option value="tr">Türkçe</option></select></label>
    <label class="setting-row"><span>{t('settings.notifications')}</span><input type="checkbox" checked={s.settings.notifications} onChange={actions.notifications}/></label>
    <button class="full" onClick={actions.privacy}>{t('settings.privacy')}</button><button class="full" onClick={actions.restore}>{t('shop.restore')}</button>
    <button class="full" onClick={() => { const url = import.meta.env.VITE_PRIVACY_POLICY_URL; if (url && /^https:\/\//.test(url)) window.open(url, '_blank', 'noopener,noreferrer'); else act(() => true, t('settings.policy.missing')); }}>{t('settings.policy')}</button>
    </article><article class="panel"><p>{t('settings.local')}</p><label for="save-code">{t('settings.code')}</label><textarea id="save-code" rows={4} value={code} onInput={e => setCode(e.currentTarget.value)}/><div class="two-buttons"><button onClick={() => setCode(serialize(s))}>{t('settings.export')}</button><button onClick={() => {
      try { const raw: unknown = JSON.parse(code); if (!raw || typeof raw !== 'object' || !('version' in raw) || !('stations' in raw)) throw new Error();
        const imported = deserialize(code, Date.now() / 1000); imported.pro = s.pro; game.state = imported; void game.persist(); act(() => true, t('settings.import.done'));
      } catch { act(() => false, t('settings.import.failed')); }
    }}>{t('settings.import')}</button></div></article>
    <button class="danger full" onClick={() => setReset(true)}>{t('settings.reset')}</button>
    {reset ? <div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><p>{t('settings.reset.confirm')}</p><button class="danger" onClick={() => { const fresh = createState(Date.now() / 1000); fresh.settings = { ...s.settings }; fresh.pro = s.pro; game.state = fresh; void game.persist(); setReset(false); act(() => true, t('settings.reset.done')); }}>{t('confirm')}</button><button onClick={() => setReset(false)}>{t('cancel')}</button></section></div> : null}
  </section>;
}
