import Decimal from 'break_infinity.js';
export { Decimal };
export type Money = Decimal;
export const D = (value: Decimal | number | string) => new Decimal(value);
export function safeMoney(value: unknown): Decimal {
  try {
    const d = D(typeof value === 'string' || typeof value === 'number' ? value : 0);
    return Number.isFinite(d.mantissa) && Number.isFinite(d.exponent) && d.gte(0) && d.exponent < 10000 ? d : D(0);
  } catch { return D(0); }
}
export function format(value: Decimal | number): string {
  const d = D(value);
  if (d.lt(1000)) return d.toNumber().toFixed(d.lt(10) ? 1 : 0);
  const group = Math.floor(d.exponent / 3);
  const suffix = group === 1 ? 'K' : group === 2 ? 'M' : group === 3 ? 'B' : group === 4 ? 'T' :
    String.fromCharCode(97 + Math.floor((group - 5) / 26) % 26) + String.fromCharCode(97 + (group - 5) % 26);
  return `${d.div(Decimal.pow(10, group * 3)).toNumber().toFixed(2).replace(/\.?0+$/, '')}${suffix}`;
}
