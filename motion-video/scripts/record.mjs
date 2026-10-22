/**
 * Record a render(t) page to mp4, one exact frame at a time, or save a few stills.
 *
 * For every frame we call render(frame / fps) and screenshot it, so the video never depends on
 * how fast the machine is: no dropped or doubled frames. Frames stream straight into ffmpeg.
 *
 *   node record.mjs page.html out.mp4 [--fps 60] [--scale 2] [--keep-scale]
 *   node record.mjs page.html outDir --stills 0.5,3,7.25 [--scale 1]
 *
 * The page sets window.render, window.DURATION, window.ready (and optionally WIDTH/HEIGHT,
 * default 1920x1080). --scale captures at N x size; the video is scaled back down with lanczos
 * (cleaner edges) unless --keep-scale. Set CHROME to point at Chrome/Chromium if not found.
 * Needs Node 22+ (global WebSocket) and ffmpeg.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
const [pageArg, outArg] = args;
if (!pageArg || !outArg) {
  console.error('usage: node record.mjs page.html out.mp4|outDir [--fps 60] [--scale 2] [--keep-scale] [--stills 1,2.5]');
  process.exit(1);
}
const FPS = Number(opt('--fps', 60));
const SCALE = Number(opt('--scale', 2));
const STILLS = opt('--stills', null);
const KEEP = args.includes('--keep-scale');
// --blur N: render N sub-frames per frame and average the first half of them (a 180-degree shutter)
const BLUR = Math.max(1, Number(opt('--blur', 1)));
const PORT = 9300 + Math.floor(Math.random() * 600);

const CHROME = process.env.CHROME || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].find(existsSync);
if (!CHROME) { console.error('Chrome not found; set CHROME=/path/to/chrome'); process.exit(1); }

const profile = mkdtempSync(join(tmpdir(), 'motion-video-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--disable-gpu-vsync', '--font-render-hinting=none', '--allow-file-access-from-files', 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageSocket() {
  for (let i = 0; i < 75; i++) {
    try {
      const page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* Chrome still starting */ }
    await sleep(200);
  }
  throw new Error('Chrome did not start');
}

const ws = new WebSocket(await pageSocket());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let nextId = 0;
const waiting = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id); }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++nextId;
  waiting.set(id, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true });
  if (r.exceptionDetails) throw new Error(`page error: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
  return r.result.value;
};
const frame = async (t) => {
  await evaluate(`render(${t})`);
  return Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64');
};

try {
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: SCALE, mobile: false });
  await send('Page.navigate', { url: `${pathToFileURL(resolve(pageArg)).href}?record` });
  for (let i = 0; !(await evaluate('window.ready === true').catch(() => false)); i++) {
    if (i > 300) throw new Error('page never set window.ready (check fonts/images and the console)');
    await sleep(100);
  }
  const { w, h, duration } = await evaluate('({ w: window.WIDTH || 1920, h: window.HEIGHT || 1080, duration: window.DURATION })');
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: SCALE, mobile: false });
  await evaluate('window.dispatchEvent(new Event("resize"))');

  if (STILLS) {
    mkdirSync(outArg, { recursive: true });
    for (const s of STILLS.split(',').map(Number)) {
      // Zero-padded names keep the stills in time order for contact-sheet.sh
      writeFileSync(join(outArg, `still-${s.toFixed(2).padStart(7, '0')}s.png`), await frame(s));
    }
    console.log('stills written to', outArg);
  } else {
    // Sub-frames arrive at FPS * BLUR; each output frame averages the first half of its group, then one frame per group is kept
    const filters = [];
    if (BLUR > 1) filters.push(`tmix=frames=${Math.max(2, Math.floor(BLUR / 2))}`, `select=not(mod(n+${BLUR - Math.max(2, Math.floor(BLUR / 2))}\\,${BLUR}))`);
    if (!KEEP && SCALE !== 1) filters.push(`scale=${w}:${h}:flags=lanczos`);
    const ffmpeg = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS * BLUR), '-i', '-',
      ...(filters.length ? ['-vf', filters.join(',')] : []), '-r', String(FPS),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-tune', 'animation', '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      '-movflags', '+faststart', resolve(outArg)], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ffmpeg.on('exit', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
    const total = Math.round(duration * FPS) * BLUR;
    for (let f = 0; f < total; f++) {
      if (!ffmpeg.stdin.write(await frame(f / (FPS * BLUR)))) await new Promise((r) => ffmpeg.stdin.once('drain', r));
      if (f % (FPS * BLUR * 5) === 0) console.log(`frame ${f / BLUR}/${total / BLUR}`);
    }
    ffmpeg.stdin.end();
    await done;
    console.log('wrote', outArg);
  }
} finally {
  ws.close();
  const exited = new Promise((r) => chrome.once('exit', r));
  chrome.kill();
  await exited;
  rmSync(profile, { recursive: true, force: true });
}
