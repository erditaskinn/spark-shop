import { readdirSync, readFileSync } from 'node:fs';
const walk = p => readdirSync(p, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${p}/${e.name}`) : [`${p}/${e.name}`]);
const issues = walk('src').filter(p => /\.(ts|tsx)$/.test(p)).flatMap(p => {
  const s = readFileSync(p, 'utf8');
  return [s.split('\n').length > 300 ? `${p}: exceeds 300 lines` : '', /\b(?:eval|debugger)\b/.test(s) ? `${p}: unsafe debugging code` : ''].filter(Boolean);
});
if (issues.length) { console.error(issues.join('\n')); process.exit(1); }
console.log('Source hygiene passed. Strict TypeScript supplies semantic linting.');
