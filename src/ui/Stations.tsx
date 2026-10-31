import { useState } from 'preact/hooks';
import { affordable, buy, cost, hire, managerCost, startRepair, stationRate, type BuyMode } from '../core/economy';
import { format } from '../core/numbers';
import { managers, producers } from '../data/content';
import { BALANCE } from '../data/balance';
import { DeviceArt } from './DeviceArt';
import { Icon } from './Icon';
import type { ScreenProps } from './types';
export function Stations({ s, t, act }: ScreenProps) {
  const [mode, setMode] = useState<BuyMode>(1), [view, setView] = useState(-1);
  const zone = Math.min(s.zone, view < 0 ? s.zone : view);
  const stations = producers.filter(p => p.zone === zone && (p.tier < 3 || s.stations[p.id - 2].owned > 0));
  return <section class="stations-section">
    <div class="station-heading"><h2>{t('stations.title')}</h2><div class="buy-switch" aria-label={t('buy')}>{([1, 10, 100, 'max'] as const).map(x => <button aria-pressed={mode === x} class={mode === x ? 'selected' : ''} onClick={() => setMode(x)}>{x === 'max' ? 'MAX' : `×${x}`}</button>)}</div></div>
    {s.zone > 0 ? <label class="era-selector"><span>{t('nav.zones')}</span><select aria-label={t('nav.zones')} value={zone} onChange={e => setView(Number(e.currentTarget.value))}>{Array.from({ length: s.zone + 1 }, (_, i) => <option value={i}>{t(`era.${i}`)} · {t(`zone.${i}`)}</option>)}</select></label> : null}
    <div class="station-list">{stations.map(p => {
      const st = s.stations[p.id], count = mode === 'max' ? affordable(s, p.id) : mode;
      const price = cost(s, p.id, count || 1), next = BALANCE.milestones.find(n => n > st.owned);
      const progress = st.progress / p.seconds * 100;
      return <article class={`station ${st.owned ? 'owned' : 'unowned'} ${st.manager ? 'managed' : 'manual'} ${st.running ? 'running' : ''}`} key={p.id}>
        <div class="station-art"><DeviceArt id={p.id}/></div>
        <div class="station-details"><h3>{t(p.key)}</h3><div class="station-meta"><span class="level-tag">{t('level')} {st.owned}</span><span class="station-rate"><Icon name="income"/>+{format(stationRate(s, p.id))} / {t('seconds')}</span></div>
          <div class={`cycle-row ${st.owned && !st.manager ? 'with-repair' : ''}`}><div class="progress" role="progressbar" aria-label={t('running')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><div style={{ width: `${progress}%` }}/></div>
            {st.owned > 0 && !st.manager ? <button class="repair-button" data-repair={p.id} disabled={st.running} onClick={() => act(() => startRepair(s, p.id))}>{t(st.running ? 'running' : 'repair')}</button> : null}
          </div>
          <div class="station-actions">
            {st.manager ? <span class="working-label"><Icon name="user"/>{t('station.working')}</span> : st.owned > 0 ? <button class="manager-button" aria-label={`${t('hire')}: ${t(managers[p.id].key)}, ${format(managerCost(s, p.id))}`} disabled={s.money.lt(managerCost(s, p.id))} onClick={() => act(() => hire(s, p.id))}>{t('hire')} · {format(managerCost(s, p.id))}</button> : null}
            <button class="buy-button" data-buy={p.id} aria-label={`${t('buy')} ${count} ${t(p.key)}, ${format(price)}`} disabled={s.money.lt(price) || !count} onClick={() => act(() => buy(s, p.id, mode), `−${format(price)}`)}>{!st.owned ? <Icon name="lock"/> : null}<span>{t(st.owned ? 'station.upgrade' : 'station.open')} · {format(price)}</span></button>
          </div>
          <div class="milestone-note">{next ? `${t('next')}: ${next} → ×2` : `✓ ${t('complete')}`}</div>
        </div>
      </article>;
    })}</div>
  </section>;
}
