/**
 * Mix a silent video with voice lines and ducked music into the final mp4.
 *
 *   node mix.mjs mix.json
 *
 * mix.json (paths relative to the json file):
 * {
 *   "video": "silent.mp4", "out": "final.mp4",
 *   "music": "music.mp3", "musicVolume": 0.3,          // optional; use about 0.8 when there's no voice
 *   "musicStart": 12.5,                                 // optional: where in the track to begin (s)
 *   "lines": [                                          // voice pieces placed in time; [] for music only
 *     { "src": "voice.wav", "from": 0.19, "to": 4.6, "at": 0.22 },
 *     { "src": "voice.wav", "from": 4.74, "to": 10.0, "at": 6.02 }
 *   ],
 *   "scale": "1080:1080"                                // optional output size
 * }
 * Each line gets 30 ms fades; music fades in/out and ducks under the voice;
 * the result is normalised to -14 LUFS / -1.5 dBTP. The video stream is copied unless scaled.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('usage: node mix.mjs mix.json'); process.exit(1); }
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const at = (p) => resolve(dirname(resolve(cfgPath)), p);

const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', at(cfg.video)], { encoding: 'utf8' });
const dur = Number(probe.stdout.trim());
if (!dur) throw new Error(`could not read the duration of ${cfg.video}`);

// One ffmpeg input per distinct voice file; input 0 is the video
const sources = [...new Set(cfg.lines.map((l) => l.src))];
const inputs = ['-i', at(cfg.video), ...sources.flatMap((s) => ['-i', at(s)])];
const musicIn = cfg.music ? sources.length + 1 : null;
if (cfg.music) inputs.push('-i', at(cfg.music));

const f = [];
sources.forEach((s, si) => {
  const uses = cfg.lines.map((l, i) => [l, i]).filter(([l]) => l.src === s);
  f.push(`[${si + 1}:a]asplit=${uses.length}${uses.map(([, i]) => `[s${i}]`).join('')}`);
  for (const [l, i] of uses) {
    const len = l.to - l.from;
    f.push(`[s${i}]atrim=${l.from}:${l.to},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=${(len - 0.05).toFixed(2)}:d=0.05,adelay=${Math.round(l.at * 1000)}:all=1[v${i}]`);
  }
});
const hasVoice = cfg.lines.length > 0;
if (!hasVoice && !cfg.music) throw new Error('mix.json needs voice lines, music, or both');
if (hasVoice) {
  const voices = cfg.lines.map((_, i) => `[v${i}]`).join('');
  f.push(`${voices}amix=inputs=${cfg.lines.length}:normalize=0,aformat=channel_layouts=stereo,apad,atrim=0:${dur},asplit[vmix][vkey]`);
}
if (cfg.music) {
  const start = cfg.musicStart ?? 0;  // where in the track to begin, in seconds
  f.push(`[${musicIn}:a]atrim=${start}:${start + dur},asetpts=PTS-STARTPTS,aformat=channel_layouts=stereo,volume=${cfg.musicVolume ?? 0.3},afade=t=in:d=0.6,afade=t=out:st=${Math.max(0, dur - 3)}:d=3[m]`);
  if (hasVoice) {
    f.push('[m][vkey]sidechaincompress=threshold=0.02:ratio=6:attack=30:release=500[mduck]');
    f.push('[vmix][mduck]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]');
  } else {
    f.push('[m]loudnorm=I=-14:TP=-1.5:LRA=11[a]');
  }
} else {
  f.push('[vkey]anullsink');
  f.push('[vmix]loudnorm=I=-14:TP=-1.5:LRA=11[a]');
}
const video = cfg.scale ? (f.push(`[0:v]scale=${cfg.scale}:flags=lanczos[v]`), ['-map', '[v]', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p']) : ['-map', '0:v', '-c:v', 'copy'];

const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', f.join(';'), ...video,
  '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', String(dur), '-movflags', '+faststart', at(cfg.out)], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log('wrote', cfg.out);
