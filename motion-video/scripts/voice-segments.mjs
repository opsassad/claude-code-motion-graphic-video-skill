/**
 * List the spoken segments in a voice take, from ffmpeg's silence detection.
 *
 *   node voice-segments.mjs voice.wav [--noise -35] [--min-silence 0.25]
 *
 * Prints one line per segment (index, start, end, length in seconds) and the same as JSON,
 * ready to match against the script lines and put into the page's WARP table.
 */

import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
const file = args[0];
if (!file) { console.error('usage: node voice-segments.mjs voice.wav [--noise -35] [--min-silence 0.25]'); process.exit(1); }

const run = (a) => spawnSync('ffmpeg', a, { encoding: 'utf8' }).stderr;
const log = run(['-hide_banner', '-i', file, '-af', `silencedetect=noise=${opt('--noise', -35)}dB:d=${opt('--min-silence', 0.25)}`, '-f', 'null', '-']);
const total = Number(log.match(/Duration: (\d+):(\d+):([\d.]+)/)?.slice(1).reduce((s, v) => s * 60 + Number(v), 0));

// Speech is whatever lies between the silences
const segments = [];
let start = 0;
for (const line of log.split('\n')) {
  const s = line.match(/silence_start: ([\d.]+)/);
  const e = line.match(/silence_end: ([\d.]+)/);
  if (s && Number(s[1]) - start > 0.05) segments.push([start, Number(s[1])]);
  if (e) start = Number(e[1]);
}
if (total - start > 0.05) segments.push([start, total]);

const r = (x) => Math.round(x * 100) / 100;
segments.forEach(([a, b], i) => console.log(`${String(i + 1).padStart(2)}  ${r(a).toFixed(2).padStart(6)}  ${r(b).toFixed(2).padStart(6)}  (${r(b - a).toFixed(2)} s)`));
console.log(JSON.stringify(segments.map(([a, b]) => [r(a), r(b)])));
