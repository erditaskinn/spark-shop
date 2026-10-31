import { useState } from 'preact/hooks';
import { zones } from '../data/content';
import { research } from '../data/research';
import { buyResearch, prestige, prestigeGain, unlockZone } from '../core/progression';
import { format } from '../core/numbers';
import { globalMultiplier } from '../core/economy';
import { BALANCE } from '../data/balance';
import type { ScreenProps } from './types';
export function Zones({ s, t, act }: ScreenProps) {
  return <section class="page"><h2>{t('nav.zones')}</h2><p>{t('zones.note')}</p><div class="stat-strip">{t('zones.multiplier')} <strong>×{globalMultiplier(s).toFixed(2)}</strong></div>
    {zones.map(z => <article class={`panel era-card ${z.id <= s.zone ? 'open' : ''}`}><span class="era-number">{z.era}<small>s</small></span><h3>{t(z.key)}</h3><p>{z.id ? `${t('goal')}: ${format(z.goal)}` : t('bench.note')}</p>
      {z.id <= s.zone ? <span class="pill">✓ {t('active')}</span> : z.id === s.zone + 1 ? <><progress max={1} value={Math.min(1, s.runEarnings.div(z.goal).toNumber())}/><button class="primary" disabled={s.runEarnings.lt(z.goal)} onClick={() => act(() => unlockZone(s))}>{t('unlock')} · ×2</button></> : <span class="muted">{t('locked')}</span>}</article>)}
  </section>;
}
export function Research({ s, t, act }: ScreenProps) {
  return <section class="page"><div class="section-heading"><h2>{t('nav.research')}</h2><span class="pill">✧ {s.badges} {t('badges')}</span></div><p>{t('research.note')}</p>
    {[0, 1, 2, 3, 4].map(kind => <article class="panel"><h3>{t(`research.${kind}`)}</h3><div class="rank-dots">{research.filter(r => r.kind === kind).map(r => <span class={s.research.includes(r.id) ? 'done' : ''}/>)}</div>
      {research.filter(r => r.kind === kind).map(r => <div class="research-row"><span>{t('rank')} {r.rank}</span><button disabled={s.research.includes(r.id) || s.badges < r.cost || (r.prerequisite !== null && !s.research.includes(r.prerequisite))} onClick={() => act(() => buyResearch(s, r.id))}>{s.research.includes(r.id) ? `✓ ${t('complete')}` : `✧ ${r.cost}`}</button></div>)}</article>)}
  </section>;
}
export function Prestige({ s, t, act }: ScreenProps) {
  const [confirm, setConfirm] = useState(false), gain = prestigeGain(s);
  return <section class="page"><div class="prestige-symbol">✦</div><h2>{t('prestige.title')}</h2><p>{t('prestige.note')}</p><article class="panel prestige-card"><span>{t('prestige.gain')}</span><strong>+{format(gain)}</strong><span>{t('reputation')}</span><hr/><div class="research-row"><span>{t('prestige.bonus')}</span><b>×{(1 + s.reputation * 0.02).toFixed(2)} → ×{(1 + (s.reputation + gain) * 0.02).toFixed(2)}</b></div><div class="research-row"><span>{t('prestige.badges')}</span><b>+{gain ? Math.ceil(Math.sqrt(gain)) : 0}</b></div></article>
    <p class={gain >= BALANCE.prestigeWorth ? 'positive' : 'muted'}>{t(gain >= BALANCE.prestigeWorth ? 'prestige.worth' : 'prestige.wait')}</p>
    <button class="primary" disabled={!gain} onClick={() => setConfirm(true)}>{t('prestige.action')}</button>
    <div class="stat-strip">{t('total')} <strong>{format(s.lifetime)}</strong></div>
    {confirm ? <div class="modal-backdrop"><section role="dialog" aria-modal="true" class="modal"><h2>{t('nav.prestige')}</h2><p>{t('prestige.confirm')}</p><button class="primary" onClick={() => { act(() => prestige(s)); setConfirm(false); }}>{t('confirm')} +{format(gain)}</button><button onClick={() => setConfirm(false)}>{t('cancel')}</button></section></div> : null}
  </section>;
}
