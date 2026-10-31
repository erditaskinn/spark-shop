import { format } from '../core/numbers';
import type { ScreenProps } from './types';
import type { RewardActions } from './Rewards';
export function Goals({ s, t }: ScreenProps & { actions: RewardActions }) {
  return <section class="page"><h2>{t('nav.missions')}</h2><article class="panel"><h3>{t('mission')}</h3><div class="stat-strip">{t('mission.0')}<b>{format(s.purchases)}</b></div><div class="stat-strip">{t('mission.1')}<b>{format(s.repairs)}</b></div><div class="stat-strip">{t('mission.2')}<b>{s.faults}</b></div></article><article class="panel"><h3>{t('achievement')}</h3><p>{t('total')}: {format(s.lifetime)}</p></article></section>;
}
