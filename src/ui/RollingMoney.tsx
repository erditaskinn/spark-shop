import { useEffect, useRef } from 'preact/hooks';
import { format, type Decimal } from '../core/numbers';
export function RollingMoney({ value, motion }: { value: Decimal; motion: boolean }) {
  const element = useRef<HTMLSpanElement>(null), displayed = useRef(value.toNumber());
  const key = value.toString();
  useEffect(() => {
    const target = value.toNumber(), from = displayed.current, start = performance.now();
    let frame = 0;
    if (!motion || !Number.isFinite(target) || target > 1e12 || Math.abs(target - from) > Math.max(100, target * 0.8)) {
      if (element.current) element.current.textContent = format(value); displayed.current = target; return;
    }
    const animate = (now: number) => {
      const fraction = Math.min(1, (now - start) / 160);
      displayed.current = from + (target - from) * (1 - (1 - fraction) ** 3);
      if (element.current) element.current.textContent = format(displayed.current);
      if (fraction < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate); return () => cancelAnimationFrame(frame);
  }, [key, motion]);
  return <span ref={element} aria-label={format(value)}/>;
}
