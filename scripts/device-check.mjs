import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const delay = ms => new Promise(r => setTimeout(r, ms));
const pid = execFileSync('adb', ['shell', 'pidof', 'com.sparkshop.idle'], { encoding: 'utf8', windowsHide: true }).trim();
if (!/^\d+$/.test(pid)) throw new Error('Launch Spark Shop on the connected device first');
execFileSync('adb', ['forward', 'tcp:9224', `localabstract:webview_devtools_remote_${pid}`], { windowsHide: true });
const pages = await (await fetch('http://127.0.0.1:9224/json')).json();
const page = pages.find(p => p.url.startsWith('https://localhost') || p.url.startsWith('http://localhost'));
if (!page) throw new Error('App WebView was not exposed by the debug APK');
const ws = new WebSocket(page.webSocketDebuggerUrl); let next = 0; const pending = new Map();
await new Promise(r => ws.addEventListener('open', r, { once: true }));
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } });
const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++next; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async expression => { const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
try {
  console.log(await evaluate(`JSON.stringify({title:document.title,buttons:[...document.querySelectorAll('button')].filter(b=>!b.disabled).map(b=>b.textContent.trim()),text:document.body.textContent.slice(-500)})`));
  if (process.argv.includes('--navigation')) {
    await evaluate(`(()=>{const b=[...document.querySelectorAll('nav button')].find(b=>b.textContent.includes('Ar-Ge')||b.textContent.includes('Research'));if(!b)throw Error('Research navigation missing');b.click();})()`);
    await delay(300); if (await evaluate("!!document.querySelector('.board-panel')")) throw Error('Research did not open');
    execFileSync('adb', ['shell', 'input', 'keyevent', 'KEYCODE_BACK'], { windowsHide: true });
    await delay(500); if (!await evaluate("!!document.querySelector('.board-panel')")) throw Error('Native back did not return to workshop');
    mkdirSync('artifacts', { recursive: true });
    writeFileSync('artifacts/device-navigation.json', JSON.stringify({ android: 11, researchToWorkshopBack: true }, null, 2));
    writeFileSync('artifacts/phone-workshop.png', Buffer.from((await call('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    console.log('Native back navigation passed.');
  }
  if (process.argv.includes('--watch-ad')) {
    const before = await evaluate(`JSON.parse(localStorage.getItem('spark:analytics')||'[]').filter(e=>e.event==='ad_rewarded').length`);
    const clicked = await evaluate(`(()=>{const b=document.querySelector('button[data-placement="boost"]')||[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Video: +2 sa')||b.textContent.includes('Video: +2h'));if(!b||b.disabled)return false;b.click();return true;})()`);
    if (!clicked) throw Error('Boost video is not ready or age choice is still pending');
    let count = before;
    for (let i = 0; i < 180; i++) {
      await delay(500); count = await evaluate(`JSON.parse(localStorage.getItem('spark:analytics')||'[]').filter(e=>e.event==='ad_rewarded').length`);
      if (count > before) break;
    }
    console.log(JSON.stringify({ nativeRewardDelta: count - before }));
    if (count - before !== 1) throw Error('Native test ad did not produce exactly one reward');
    await delay(1000);
    const after = await evaluate(`JSON.parse(localStorage.getItem('spark:analytics')||'[]').filter(e=>e.event==='ad_rewarded').length`);
    if (after !== count) throw Error('Duplicate native reward detected');
    mkdirSync('artifacts', { recursive: true }); writeFileSync('artifacts/device-ad-check.json', JSON.stringify({ android: 11, testUnit: true, rewardDelta: 1, duplicateRewards: 0, timestamp: new Date().toISOString() }, null, 2));
  }
} finally { ws.close(); execFileSync('adb', ['forward', '--remove', 'tcp:9224'], { windowsHide: true }); }
