import type { GameState } from '../core/state';
import type { T } from './types';
export function Board({ s, t, onFault }: { s: GameState; t: T; onFault: () => void }) {
  const fault = s.faultUntil > s.now;
  return <section class="board-panel">
    <div class="section-label"><span>{t('workshop')}</span><span class="live-dot">{1980 + s.zone * 10}</span></div>
    <svg class="circuit" viewBox="0 0 360 164" aria-hidden="true">
      <defs><pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="1" fill="#346259"/></pattern></defs>
      <rect x="14" y="10" width="332" height="144" rx="12" fill="#16463e" stroke="#477868"/>
      <rect x="16" y="12" width="328" height="140" rx="12" fill="url(#dots)"/>
      <g fill="none" stroke="#a58a4c" strokeWidth="2" opacity=".8"><path d="M35 40h65v34h48m-115 50h75V94h40m62-40h34V30h65m-100 68h52v30h52M180 24v30m0 50v36M32 80h42v16m190-18h60"/></g>
      <g fill="#e5b863">{[35, 325].flatMap(x => [25, 139].map(y => <circle cx={x} cy={y} r="4"/>))}</g>
      <rect x="145" y="53" width="68" height="56" rx="5" fill="#162524" stroke="#69877c"/>
      <g stroke="#d3cbb2" strokeWidth="4">{[62, 74, 86, 98].map(y => <><path d={`M136 ${y}h9`}/><path d={`M213 ${y}h9`}/></>)}</g>
      <text x="179" y="78" textAnchor="middle" fill="#a6ba9e" fontSize="10" fontFamily="monospace">SPK-80</text><text x="179" y="94" textAnchor="middle" fill="#67877a" fontSize="7">REPAIR / REV.01</text>
      <g><rect x="63" y="31" width="39" height="17" rx="5" fill="#c4a984"/><path d="M73 31v17m9-17v17m10-17v17" stroke="#ad552b" strokeWidth="4"/>
        <ellipse cx="270" cy="94" rx="14" ry="6" fill="#81a6ae"/><path d="M256 94v26q14 11 28 0V94" fill="#365a65"/><ellipse cx="270" cy="94" rx="14" ry="6" fill="#b7c4b5"/>
        <rect x="68" y="112" width="45" height="14" rx="6" fill="#a8b3a7"/><rect x="76" y="113" width="28" height="12" fill="#ece0b4"/></g>
      <path d="M295 150l40-20 20 35" fill="none" stroke="#cc945a" strokeWidth="12" strokeLinecap="round"/><path d="M295 150l-17 8" fill="none" stroke="#c1cbc4" strokeWidth="5"/>
    </svg>
    {fault ? <button class={`fault-target target-${s.faultComponent}`} onClick={onFault} aria-label={`${t('fault')}: ${t(`fault.${s.faultComponent}`)}`}>✦</button> : null}
    <div class="board-caption"><span>{fault ? t(`fault.${s.faultComponent}`) : t('bench.note')}</span><span class={fault ? 'amber' : ''}>{fault ? `${Math.ceil(s.faultUntil - s.now)}s` : '✧'}</span></div>
    <p class="sr-only">{fault ? t('fault.hint') : t('fault.wait')}</p>
  </section>;
}
