import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const delay = ms => new Promise(r => setTimeout(r, ms));
const port = 9300 + process.pid % 1000;
const browser = spawn('C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${port}`,
  `--user-data-dir=${resolve('.browser-test', String(Date.now()))}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let ws, closeBrowser, next = 0; const pending = new Map(), errors = [];
try {
  let pages;
  for (let i = 0; i < 50; i++) { try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (pages.some(p => p.type === 'page')) break; } catch {} await delay(200); }
  if (!pages) throw new Error('Headless browser did not start');
  ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  ws.addEventListener('message', event => {
    const m = JSON.parse(event.data); if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++next; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  closeBrowser = () => call('Browser.close');
  const evaluate = async expression => {
    const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value;
  };
  const click = text => evaluate(`(() => { const buttons=[...document.querySelectorAll('button')];const b = buttons.find(b => b.textContent.trim() === ${JSON.stringify(text)}); if (!b || b.disabled) throw Error('Button unavailable: '+${JSON.stringify(text)}+'; buttons='+buttons.map(b=>b.textContent).join('|')+'; text='+document.body.textContent.slice(0,300)); b.click(); return true; })()`);
  await call('Runtime.enable'); await call('Page.enable');
  await call('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:5173', storageTypes: 'local_storage' });
  await call('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true });
  await call('Page.navigate', { url: 'http://127.0.0.1:5173/' }); await delay(1500);
  for (let i = 0; i < 100 && !await evaluate("!!window.__sparkTest&&!!document.querySelector('nav')"); i++) await delay(200);
  await evaluate(`(async()=>{window.g=window.__sparkTest.game;window.a=window.__sparkTest.actions;window.n=await import('/src/core/numbers.ts');g.state.settings.language='en';g.emit();})()`);
  for (let i = 0; i < 50; i++) { await evaluate("g.state.settings.language='en';g.emit()"); await delay(100); if (await evaluate("document.body.textContent.includes('18 or older')")) break; }
  await click('18 or older'); await delay(250); await click('Skip tour');
  await evaluate(`(()=>{const b=document.querySelector('button[data-buy="0"]');if(!b||b.disabled)throw Error('First purchase missing');b.click();})()`);
  await evaluate(`document.querySelector('button[data-repair="0"]').click()`); await delay(2200);
  const repairs = await evaluate('g.state.repairs'); if (repairs < 1) throw Error('Manual repair did not pay');
  const report = { viewport: '360×800', manualRepair: true, placements: [], screens: [], errors };
  mkdirSync('artifacts', { recursive: true });
  writeFileSync('artifacts/workshop.png', Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  for (const id of ['boost', 'chest', 'welcome', 'skip1', 'skip4', 'login', 'mission', 'lucky']) {
    await evaluate(`(async()=>{const s=g.state; s.now+=601;s.lastAd=s.now-31;s.adCounts={};s.adTimes={freeChest:s.now-601};s.zone=4;s.prestiges=1;s.boostUntil=0;s.offline=n.D(100);s.offlineId++;s.loginDay=-1; const meta=await import('/src/core/meta.ts');meta.refreshDaily(s);s.missionClaims=[];s.purchases+=100;window.beforeAds=s.adsWatched;a.watch('${id}',${id === 'mission' ? "{ready:true,claim:0,minutes:1}" : id === 'login' ? '{ready:true,minutes:1}' : '{}'});})()`);
    await delay(3400);
    const delta = await evaluate('g.state.adsWatched-beforeAds'); if (delta !== 1) throw Error(`${id}: expected one reward, got ${delta}`);
    report.placements.push({ id, rewards: delta });
  }
  await evaluate(`(()=>{g.state.offline=n.D(0);g.emit();})()`); await delay(150);
  await evaluate(`(()=>{g.state.lifetime=n.D('1.25e33');g.state.reputation=0;g.emit();document.querySelectorAll('nav button')[3].click();})()`); await delay(150);
  await click('Start a new empire'); await delay(100); await click('Confirm +100'); await delay(150);
  if (!await evaluate('g.state.reputation===100&&g.state.zone===0&&g.state.stations[0].owned===1')) throw Error('Prestige UI did not reset correctly');
  report.prestigeReset = true;
  await evaluate(`(()=>{g.state.runEarnings=n.D(200000);g.emit();document.querySelectorAll('nav button')[1].click();})()`); await delay(150);
  await click('Open workshop · ×2'); await delay(150);
  if (!await evaluate('g.state.zone===1')) throw Error('Second-cycle era did not unlock'); report.secondCycleEra = true;
  for (const label of ['Eras', 'Research', 'Reputation', 'More']) { await evaluate(`(()=>{const b=[...document.querySelectorAll('nav button')].find(b=>b.textContent.includes('${label}'));b.click();})()`); await delay(100); report.screens.push(label); }
  await click('Goals →'); await delay(150); report.screens.push('Goals');
  await evaluate(`document.querySelector('nav button:last-child').click()`); await delay(100); await click('Shop →'); await delay(150);
  await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Get Pro'));if(!b||b.disabled)throw Error('Pro unavailable');b.click();})()`); await delay(200);
  if (!await evaluate('g.state.pro')) throw Error('Mock Pro purchase failed'); report.mockPurchase = true;
  await evaluate(`document.querySelector('nav button:last-child').click()`); await delay(100); await click('Settings →'); await delay(100); report.screens.push('Settings');
  await evaluate(`(()=>{const select=[...document.querySelectorAll('select')].find(s=>s.querySelector('option[value=tr]'));select.value='tr';select.dispatchEvent(new Event('change',{bubbles:true}));})()`); await delay(150);
  if (!await evaluate(`document.body.textContent.includes('Ayarlar')`)) throw Error('Turkish switch failed'); report.turkish = true;
  report.overflow = await evaluate('document.documentElement.scrollWidth>360'); if (report.overflow) throw Error('Horizontal overflow at 360px');
  if (process.argv.includes('--visual')) {
    await evaluate(`(async()=>{const make=(await import('/src/core/state.ts')).createState;g.paused=true;g.error='';g.state=make(Date.now()/1000);const s=g.state;s.settings.language='tr';s.settings.age='adult';s.tutorial=5;s.money=n.D(12450);s.badges=24;s.boostUntil=s.now+6120;s.stations[0]={owned:25,manager:true,progress:0.8,running:false};s.stations[1]={owned:12,manager:false,progress:1.4,running:false};s.faultUntil=s.now+3;s.faultComponent=0;g.emit();document.querySelector('nav button').click();await Promise.all(['/art/repair-board.png','/art/device-atlas.png','/art/shop-reference.png'].map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src=src;})));})()`);
    await delay(300);
    writeFileSync('artifacts/reference-main-360.png', Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    await call('Emulation.setDeviceMetricsOverride', { width: 414, height: 920, deviceScaleFactor: 1, mobile: true }); await delay(150);
    writeFileSync('artifacts/reference-main-414.png', Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    await call('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 1, mobile: true });
    for (const [index,name] of [[1,'zones'],[2,'research'],[3,'prestige']]) {
      await evaluate(`document.querySelectorAll('nav button')[${index}].click()`); await delay(150);
      if (await evaluate('document.documentElement.scrollWidth>360')) throw Error(name+' overflows');
      writeFileSync('artifacts/reference-'+name+'.png', Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    }
    await evaluate(`document.querySelector('nav button:last-child').click()`); await delay(100); await click('Hedefler →'); await delay(150);
    writeFileSync('artifacts/reference-goals.png', Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    await evaluate(`document.querySelector('nav button:last-child').click()`); await delay(100); await click('Dükkan →'); await delay(150);
    writeFileSync('artifacts/reference-shop.png', Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    await evaluate(`document.querySelector('nav button:last-child').click()`); await delay(100); await click('Ayarlar →'); await delay(150);
    writeFileSync('artifacts/reference-settings.png', Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    report.referenceTheme = true;
  }
  if (errors.length) throw Error(errors.join('\n'));
  writeFileSync('artifacts/browser-check.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
} finally { if (closeBrowser) await Promise.race([closeBrowser().catch(() => {}), delay(1000)]); ws?.close(); browser.kill(); }
