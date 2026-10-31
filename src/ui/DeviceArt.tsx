import { producers } from '../data/content';
export function DeviceArt({ id, className = '' }: { id: number; className?: string }) {
  const p = producers[id];
  return <div class={`device-art ${id < 3 ? `reference-device reference-device-${id}` : 'atlas-device'} ${className}`} style={id >= 3 ? { backgroundPosition: `${p.tier * 20}% ${p.zone * 25}%` } : undefined} aria-hidden="true"/>;
}
