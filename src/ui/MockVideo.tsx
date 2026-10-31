import { mockAds, text } from '../platform/runtime';
export function MockVideo() {
  const view = mockAds.view; if (!view) return null;
  return <div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><h2>{text('ad.mock')}</h2><div class="ad-timer">ϟ {Math.ceil(view.remaining)}</div><div class="ad-progress"><div style={{ width: `${(3 - view.remaining) / 3 * 100}%` }}/></div><button onClick={view.cancel}>{text('ad.cancel')}</button></section></div>;
}
