import { useState } from 'preact/hooks';
import { affordable, buy, cost, hire, managerCost, startRepair, stationRate, type BuyMode } from '../core/economy';
import { format } from '../core/numbers';
import { managers, producers } from '../data/content';
import { BALANCE } from '../data/balance';
import type { ScreenProps } from './types';
const icons = ['◉', '▣', '▤', '⌁', '◎', '▥'];
export function Stations({ s, t, act }: ScreenProps) {
  const [mode, setMode] = useState<BuyMode>(1), [view, setView] = useState(-1);
  const zone = Math.min(s.zone, view < 0 ? s.zone : view);
  const stations = producers.filter(p => p.zone === zone && (p.tier < 3 || s.stations[p.id - 2].owned > 0));
  return <section>
    <div class="station-heading"><div><div class="eyebrow">{t('era')} {1980 + zone * 10}</div><h2>{t(`zone.${zone}`)}</h2></div>
      <select aria-label={t('nav.zones')} value={zone} onChange={e => setView(Number(e.currentTarget.value))}>{Array.from({ length: s.zone + 1 }, (_, i) => <option value={i}>{1980 + i * 10}</option>)}</select></div>
    <div class="buy-switch" aria-label={t('buy')}>{([1, 10, 100, 'max'] as const).map(x => <button class={mode === x ? 'selected' : ''} onClick={() => setMode(x)}>{x === 'max' ? 'MAX' : `×${x}`}</button>)}</div>
    <div class="station-list">{stations.map(p => {
      const st = s.stations[p.id], count = mode === 'max' ? affordable(s, p.id) : mode;
      const price = cost(s, p.id, count || 1), next = BALANCE.milestones.find(n => n > st.owned);
      return <article class={`station ${st.owned ? '' : 'unowned'}`} key={p.id}>
        <div class="station-top"><span class={`device-icon tier-${p.tier}`}>{icons[p.tier]}</span><div class="station-name"><h3>{t(p.key)}</h3><span>{t('level')} {st.owned} <b>·</b> {format(stationRate(s, p.id))}/{t('seconds')}</span></div><span class="station-index">0{p.tier + 1}</span></div>
        <div class="progress"><div style={{ width: `${st.progress / p.seconds * 100}%` }}/></div>
        <div class="station-actions"><button class="repair-button" disabled={!st.owned || st.manager || st.running} onClick={() => act(() => startRepair(s, p.id))}>{st.manager ? `↻ ${t('automated')}` : st.running ? t('running') : `⌁ ${t('repair')}`}</button>
          <button class="buy-button" disabled={s.money.lt(price) || !count} onClick={() => act(() => buy(s, p.id, mode), `−${format(price)}`)}><span>{t('buy')} {mode === 'max' ? count : `×${mode}`}</span><strong>{format(price)}</strong></button></div>
        {st.owned > 0 && !st.manager ? <button class="manager-button" aria-label={`${t('hire')}: ${t(managers[p.id].key)}, ${format(managerCost(s, p.id))}`} disabled={s.money.lt(managerCost(s, p.id))} onClick={() => act(() => hire(s, p.id))}>♙ {t('hire')} <strong>{format(managerCost(s, p.id))}</strong></button> : null}
        {next ? <div class="milestone-note">{t('next')}: {next} → ×2</div> : <div class="milestone-note">✦ {t('complete')}</div>}
      </article>;
    })}</div>
  </section>;
}
