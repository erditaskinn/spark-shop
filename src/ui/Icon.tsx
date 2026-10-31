export type IconName = 'chip' | 'coins' | 'medal' | 'income' | 'settings' | 'clock' | 'play' | 'wrench' | 'layers' | 'flask' | 'star' | 'menu' | 'user' | 'lock' | 'search';
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  if (name === 'chip') return <svg class={`icon chip-icon ${className}`} viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="chip-metal" x2=".7" y2="1"><stop stopColor="#fff2ba"/><stop offset=".5" stopColor="#eeb95b"/><stop offset="1" stopColor="#9f591f"/></linearGradient></defs><g stroke="url(#chip-metal)" strokeWidth="2.2">{[12, 20, 28, 36].map(v => <><path d={`M${v} 0v8M${v} 40v8M0 ${v}h8M40 ${v}h8`}/></>)}</g><rect x="7" y="7" width="34" height="34" rx="5" fill="#122519" stroke="#f3bd6c" strokeWidth="2"/><rect x="10" y="10" width="28" height="28" rx="3" fill="#102c1b" stroke="#806132"/><path d="M28 11L16 27h8l-4 11 13-18h-9z" fill="url(#chip-metal)"/></svg>;
  if (name === 'coins') return <svg class={`icon coins-icon ${className}`} viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="coin-metal" x2="1" y2="1"><stop stopColor="#fff3ae"/><stop offset=".35" stopColor="#f7bd55"/><stop offset=".7" stopColor="#b77122"/><stop offset="1" stopColor="#f4c66c"/></linearGradient></defs>{[[6, 31], [23, 32], [4, 23], [11, 15], [10, 7]].map(([x, y]) => <g stroke="#6e3b13" strokeWidth=".8"><path d={`M${x} ${y}v5c0 7 24 7 24 0v-5`} fill="url(#coin-metal)"/><ellipse cx={x + 12} cy={y} rx="12" ry="5" fill="url(#coin-metal)"/><ellipse cx={x + 12} cy={y} rx="9" ry="3.2" fill="none" stroke="#fff0a4"/></g>)}<path d="M25 4l-6 4h5l-3 3 8-5h-5l2-2" fill="#795020"/></svg>;
  if (name === 'medal') return <svg class={`icon ${className}`} viewBox="0 0 32 36" aria-hidden="true"><path d="M9 22L6 35l9-5 4 5 4-13" fill="#c17a29" stroke="#ffcb75"/><path d="M16 1l4 2 5 0 2 5 4 4-2 5-1 5-6 1-6 4-5-3-5-1-2-6-3-4 4-5 1-5 6-1z" fill="#e8a643" stroke="#ffe29b"/><circle cx="16" cy="13" r="9" fill="#f1b85a" stroke="#93521d"/></svg>;
  const paths = {
    income: <><path d="M4 20h5v9H4zm9-8h5v17h-5zm9-7h6v24h-6z" fill="currentColor" stroke="none"/></>,
    settings: <><path d="M13 3h6l1 5 4 2 5-1 3 5-4 4v4l4 3-3 5-5-1-4 2-1 4h-6l-1-4-4-2-5 1-3-5 4-3v-4l-4-4 3-5 5 1 4-2z" transform="translate(2 -1) scale(.82)" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="5" fill="#132416" stroke="none"/></>,
    clock: <><circle cx="16" cy="16" r="13"/><path d="M16 7v10l7 5"/></>,
    play: <path d="M9 4l19 12L9 28z"/>,
    wrench: <path d="M21 3a9 9 0 0 0-9 12L3 24a4 4 0 0 0 6 6l9-10A9 9 0 0 0 29 8l-7 6-5-5z"/>,
    layers: <><path d="M3 10L16 3l13 7-13 8zM3 16l13 8 13-8M3 23l13 8 13-8"/></>,
    flask: <><path d="M11 3h10M13 3v11L5 27q-1 3 3 3h16q4 0 3-3l-8-13V3M10 21h12"/></>,
    star: <path d="M16 2l4 10 11 1-8 7 3 11-10-6-10 6 3-11-8-7 11-1z"/>,
    menu: <><path d="M10 7h20M10 16h20M10 25h20"/><path d="M3 7h1M3 16h1M3 25h1" strokeWidth="4"/></>,
    user: <><circle cx="16" cy="9" r="6" fill="currentColor" stroke="none"/><path d="M4 29v-4q0-10 12-10t12 10v4z" fill="currentColor" stroke="none"/></>,
    lock: <><rect x="6" y="14" width="20" height="16" rx="2"/><path d="M10 14V9a6 6 0 0 1 12 0v5M16 20v5"/></>,
    search: <><circle cx="13" cy="13" r="9"/><path d="M20 20l9 9"/></>,
  };
  return <svg class={`icon ${className}`} viewBox="0 0 32 36" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
