import type { GameState } from '../core/state';
import type { T } from './types';
import { Icon } from './Icon';
export function Board({ s, t, onFault }: { s: GameState; t: T; onFault: () => void }) {
  const fault = s.faultUntil > s.now;
  const seconds = Math.max(0, Math.ceil((fault ? s.faultUntil : s.faultAt) - s.now));
  return <section class={`board-panel ${fault ? 'has-fault' : ''}`}>
    <div class="board-header"><h2><span>{t(`era.${s.zone}`)}</span><i> · </i><em>{t(`zone.${s.zone}`)}</em></h2><div class="fault-badge"><Icon name="search"/><span>{t('fault.short')} · {seconds} {t('seconds')}</span></div></div>
    <div class="board-art" role="img" aria-label={t('board.description')}>
      {fault ? <><button class={`fault-target target-${s.faultComponent}`} onClick={onFault} aria-label={`${t('fault')}: ${t(`fault.${s.faultComponent}`)}`}><span/></button><span class="fault-component">{t(`fault.${s.faultComponent}`)}</span></> : null}
    </div>
    <p class="sr-only">{fault ? t('fault.hint') : t('fault.wait')}</p>
  </section>;
}
