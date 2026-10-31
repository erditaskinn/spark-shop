import { income } from '../core/economy';
import { format } from '../core/numbers';
import { Icon } from './Icon';
import { RollingMoney } from './RollingMoney';
import type { ScreenProps } from './types';
export function Wallet({ s, t }: Pick<ScreenProps, 's' | 't'>) {
  return <section class="wallet" aria-label={t('cash')}>
    <div class="wallet-money"><Icon name="coins"/><div><span class="eyebrow">{t('cash')}</span><strong class="cash"><RollingMoney value={s.money} motion={s.settings.motion}/></strong></div></div>
    <div class="wallet-income"><Icon name="income"/><strong>+{format(income(s).mul(s.boostUntil > s.now ? 2 : 1))}</strong><small>/ {t('seconds')}</small></div>
    <div class="wallet-badges"><Icon name="medal"/><strong>{format(s.badges)}</strong><small>{t('badges')}</small></div>
  </section>;
}
