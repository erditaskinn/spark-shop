import type { PlacementId } from '../data/rewardedPlacements';
import { placement } from '../data/rewardedPlacements';
import { adEligible, boostAwardSeconds, type RewardContext } from '../core/rewards';
import { format } from '../core/numbers';
import { income } from '../core/economy';
import type { ScreenProps } from './types';
import { useEffect } from 'preact/hooks';
export interface RewardActions { ready: (id: PlacementId) => boolean; watch: (id: PlacementId, context?: RewardContext) => void; buyPro: () => void; price: string | null; offered: (id: PlacementId) => void }
export function AdButton({ s, t, actions, id, context }: ScreenProps & { actions: RewardActions; id: PlacementId; context?: RewardContext }) {
  const visible = actions.ready(id) && adEligible(s, id, context);
  useEffect(() => { if (visible) actions.offered(id); }, [visible, id]);
  if (!visible) return null;
  const p = placement(id), amount = income(s).mul(60 * (context?.minutes ?? p.minutes));
  const label = id === 'boost' ? t('ad.boostDuration').replace('{duration}', `${Math.floor(boostAwardSeconds(s) / 60)} ${t('minutes')}`) : t(`ad.label.${id}`);
  return <button class="ad-button" data-placement={id} onClick={() => actions.watch(id, context)}>▷ {label}{p.type === 'income' || p.type === 'claim' ? <small>+{format(amount)}</small> : null}</button>;
}
export function Shop(props: ScreenProps & { actions: RewardActions }) {
  const { s, t, actions } = props;
  return <section class="page"><h2>{t('nav.shop')}</h2><article class="panel pro-panel"><span class="eyebrow">PRO</span><h3>{t('shop.pro')}</h3><p>{t('shop.note')}</p><button class="primary" disabled={s.pro || !actions.price} onClick={actions.buyPro}>{s.pro ? `✓ ${t('shop.active')}` : `${t('shop.buy')} · ${actions.price ?? t('shop.notConfigured')}`}</button></article>
    <article class="panel"><h3>{t('ad.label.lucky')}</h3><p>{t('lucky.note')}</p><AdButton {...props} id="lucky"/></article>
    <article class="panel"><h3>{t('boost')}</h3><p>{t('boost.note')}</p><AdButton {...props} id="boost"/></article>
    <article class="panel"><h3>{t('ad.label.skip1')}</h3><p>{t('skip.note')}</p><AdButton {...props} id="skip1"/><AdButton {...props} id="skip4"/></article>
  </section>;
}
export function Offline(props: ScreenProps & { actions: RewardActions; collect: () => void }) {
  const { s, t } = props;
  return <div class="modal-backdrop"><section class="modal welcome" role="dialog" aria-modal="true" aria-label={t('offline.title')}><div class="welcome-icon">☀</div><h2>{t('offline.title')}</h2><p>{t('offline.note')}</p><div class="offline-amounts"><div><small>{t('offline.base')}</small><strong>{format(s.offline)}</strong></div><div><small>{t('offline.double')}</small><strong class="amber">{format(s.offline.mul(2))}</strong></div></div><p>{t('offline.cap')}: {Math.floor(s.offlineSeconds / 60)} {t('minutes')}</p><AdButton {...props} id="welcome"/><button class="full" onClick={props.collect}>{t('claim')} · {format(s.pro ? s.offline.mul(2) : s.offline)}</button></section></div>;
}
