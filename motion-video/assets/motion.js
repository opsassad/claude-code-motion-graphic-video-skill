/**
 * motion.js: engine helpers and ready-made moves for render(t) videos.
 *
 * Load it with <script src="motion.js"></script>; everything is on window.MV. Every move is built once
 * (it makes its DOM) and returns render(t), a pure function of time, so shots can be recorded frame by
 * frame and seeked in any order. Timings are in seconds of scene time. See references/moves.md.
 */
(function (g) {
  'use strict';

  /* ── Core helpers ── */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  // cubic-bezier(x1, y1, x2, y2) as an easing function, same curve as CSS
  function bezier(x1, y1, x2, y2) {
    const f = (a, b, s) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
    return (x) => {
      if (x <= 0 || x >= 1) return clamp(x);
      let lo = 0, hi = 1, s = x;
      for (let i = 0; i < 30; i++) { s = (lo + hi) / 2; if (f(x1, x2, s) < x) lo = s; else hi = s; }
      return f(y1, y2, s);
    };
  }
  // Motion tokens: see references/motion-tokens.md
  const E = {
    lin: (x) => x,
    outCubic: (x) => 1 - Math.pow(1 - x, 3),
    outQuint: (x) => 1 - Math.pow(1 - x, 5),
    inCubic: (x) => x * x * x,
    inExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
    outStrong: bezier(0.23, 1, 0.32, 1),
    outExpoLike: bezier(0.16, 1, 0.3, 1),
    inOutStrong: bezier(0.77, 0, 0.175, 1),
    exit: bezier(0.4, 0.14, 1, 1),
    // One small overshoot, then still
    spring: (x) => (x >= 1 ? 1 : 1 - Math.exp(-7 * x) * Math.cos(9 * x)),
  };
  const prog = (t, t0, dur, ease = E.outStrong) => ease(clamp((t - t0) / dur));
  const mix = (a, b, p) => a + (b - a) * p;
  const set = (node, styles) => Object.assign(node.style, styles);
  const setAll = (nodes, styles) => nodes.forEach((n) => set(n, styles));
  const blurOf = (b) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none');
  const rand = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // A spring in closed form, set by damping ratio and response (s); x = seconds since start
  function spring(x, ratio = 1, response = 0.35) {
    if (x <= 0) return 0;
    const w = (2 * Math.PI) / response;
    if (ratio >= 1) return 1 - Math.exp(-w * x) * (1 + w * x);
    const wd = w * Math.sqrt(1 - ratio * ratio);
    return 1 - Math.exp(-ratio * w * x) * (Math.cos(wd * x) + ((ratio * w) / wd) * Math.sin(wd * x));
  }
  const zoomLog = (z0, z1, p) => z0 * Math.pow(z1 / z0, p);
  const onBeat = (t, bpm, offset = 0) => offset + Math.round((t - offset) / (60 / bpm)) * (60 / bpm);
  // A camera operator's follow: the average of a moving target over the last `win` seconds
  const follow = (fn, t, win = 0.4, n = 12) => { let s = 0; for (let i = 0; i < n; i++) s += fn(t - (win * i) / (n - 1)); return s / n; };
  const press = (t, at, depth = 0.95) => (Math.abs(t - at) < 0.08 ? depth : 1);
  const graphemes = (s) => [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s)].map((x) => x.segment);
  const el = (tag, style = '', html = '') => { const n = document.createElement(tag); n.style.cssText = style; n.innerHTML = html; return n; };
  const glow = (color, k = 1, ring = 3, blur = 60) => (k > 0.001 ? `0 0 0 ${ring * k}px ${color}, 0 0 ${blur * k}px ${hexA(color, 0.45 * k)}` : 'none');
  function hexA(hex, a) {
    const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  // Where an element really is on the stage after every transform (stage px)
  function rectOf(node, stage, width) {
    const s = stage.getBoundingClientRect(), r = node.getBoundingClientRect(), k = s.width / width;
    return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
  }

  /* ── Text: words rising into masks ── */
  function maskWords(node) {
    const words = node.textContent.trim().split(/\s+/);
    node.textContent = '';
    if (!node.style.overflow) set(node, { overflow: 'hidden', paddingBottom: '0.1em' });
    return words.map((w, i) => { const s = el('span', 'display:inline-block;white-space:pre;will-change:transform'); s.textContent = (i ? ' ' : '') + w; node.appendChild(s); return s; });
  }
  function rise(words, t, tIn, tOut = Infinity, stagger = 0.07) {
    words.forEach((w, i) => {
      const p = prog(t, tIn + i * stagger, 0.7), q = prog(t, tOut + i * stagger * 0.5, 0.4, E.inCubic);
      set(w, { transform: `translateY(${(1 - p) * 110 - q * 110}%) rotate(${(1 - p) * 4}deg)`, opacity: clamp(p * 1.6) * (1 - q), filter: blurOf((1 - p) * 8 + q * 8) });
    });
  }

  /* ── Directional motion blur: call the returned setter each frame with the speed (px per frame) ── */
  let filterCount = 0;
  function motionBlur(node) {
    let defs = document.getElementById('mv-filters');
    if (!defs) {
      document.body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute"><defs id="mv-filters"></defs></svg>');
      defs = document.getElementById('mv-filters');
    }
    const id = `mv-mb${filterCount++}`;
    defs.insertAdjacentHTML('beforeend', `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="0 0"/></filter>`);
    const gb = defs.lastElementChild.firstElementChild;
    return (dx, dy = 0) => {
      const bx = Math.min(30, Math.abs(dx) * 0.4), by = Math.min(30, Math.abs(dy) * 0.4);
      if (bx < 0.4 && by < 0.4) { node.style.filter = 'none'; return; }
      gb.setAttribute('stdDeviation', `${bx.toFixed(1)} ${by.toFixed(1)}`);
      node.style.filter = `url(#${id})`;
    };
  }

  /* ── Shots: hard cuts between render functions ── */
  // shots([[node, start, end, render], ...]) -> render(t). Only the shot on screen is shown and drawn.
  function shots(list) {
    return (t) => {
      for (const [node, a, b, fn] of list) {
        const on = t >= a && t < b;
        node.style.display = on ? '' : 'none';
        if (on && fn) fn(t);
      }
    };
  }

  /* ── Depth of field: the same scene twice, the copy blurred and shown only toward the edges ── */
  function twin(host, html, { width = 1080, height = 1080, blur = 8, focus = [50, 50], perspective = 1400 } = {}) {
    const cam = (dof) => `<div class="mv-cam" style="position:absolute;inset:0;perspective:${perspective}px;${dof ? `-webkit-mask-image:radial-gradient(58% 52% at ${focus[0]}% ${focus[1]}%, transparent 38%, #000 82%);mask-image:radial-gradient(58% 52% at ${focus[0]}% ${focus[1]}%, transparent 38%, #000 82%)` : ''}">
      <div class="mv-scene" style="position:absolute;left:0;top:0;width:${width * 2.4}px;height:${height}px;transform-origin:${width / 2}px ${height / 2}px;will-change:transform;${dof ? `filter:blur(${blur}px)` : ''}">${html}</div></div>`;
    host.innerHTML = cam(false) + (blur ? cam(true) : '');
    return { scenes: host.querySelectorAll('.mv-scene'), all: (sel) => host.querySelectorAll(sel) };
  }

  /* ── Macro typing: a camera close and low on an input, sliding with the caret ── */
  // Options: text, start, cps (chars/s), label, font {size, weight, spacing}, angle [rx, ry, rz],
  // top, caretAt (where the caret sits, 0-1 of width), camMax, push [from, to], dur,
  // after(geom) -> html placed after the field (geom: {fieldRight, top, height}),
  // panTo {x(geom), start, dur}: glide the camera to x after typing, width/height of the stage.
  function macroType(host, o) {
    const W = o.width || 1080, H = o.height || 1080;
    const f = { size: 118, weight: 600, spacing: '-0.035em', ...o.font };
    const top = o.top ?? H / 2 - f.size * 0.85, pad = Math.round(f.size * 0.46), fh = Math.round(f.size * 1.7);
    const label = o.label ? `<div style="position:absolute;left:84px;top:${top - f.size * 0.62}px;font-size:${Math.round(f.size * 0.38)}px;font-weight:600;color:${o.labelColor || '#6b7280'}">${o.label}</div>` : '';
    const field = `<div class="mv-field" style="position:absolute;left:60px;top:${top}px;height:${fh}px;padding:0 ${pad}px;display:flex;align-items:center;box-sizing:border-box;white-space:nowrap;background:${o.fieldBg || '#fff'};border:2px solid ${o.fieldBorder || '#e5e7eb'};border-radius:${Math.round(f.size * 0.2)}px;font-size:${f.size}px;font-weight:${f.weight};letter-spacing:${f.spacing}"><span class="mv-ty"></span><span class="mv-caret" style="display:inline-block;width:${Math.max(3, Math.round(f.size * 0.055))}px;height:0.86em;background:currentColor;vertical-align:-0.06em;margin-left:4px"></span></div>`;
    const tw = twin(host, `${label}${field}<div class="mv-after"></div>`, { width: W, height: H, blur: o.blur ?? 8 });
    const chars = graphemes(o.text), cps = o.cps || 10, [rx, ry, rz] = o.angle || [22, 0, -6];
    let widths = null, geom = null;
    function measure() {
      const m = el('span', `position:absolute;left:-9999px;white-space:pre;font-size:${f.size}px;font-weight:${f.weight};letter-spacing:${f.spacing}`);
      host.appendChild(m);
      widths = chars.map((_, i) => { m.textContent = chars.slice(0, i).join(''); return m.offsetWidth; });
      m.textContent = o.text; widths.push(m.offsetWidth); m.remove();
      const fieldW = widths[chars.length] + pad * 2 + 30;
      tw.all('.mv-field').forEach((n) => { n.style.width = `${fieldW}px`; });
      geom = { fieldRight: 60 + fieldW, top, height: fh };
      if (o.after) tw.all('.mv-after').forEach((n) => { n.innerHTML = o.after(geom); });
    }
    const caretX = (t) => {
      const p = clamp((t - o.start) * cps, 0, chars.length), n = Math.floor(p);
      return 60 + pad + (n >= chars.length ? widths[chars.length] : mix(widths[n], widths[n + 1], p - n));
    };
    const render = (t) => {
      if (!widths) measure();
      const n = Math.floor(clamp((t - o.start) * cps, 0, chars.length)), done = n >= chars.length;
      tw.all('.mv-ty').forEach((x) => { x.textContent = chars.slice(0, n).join(''); });
      const typingEnd = o.start + chars.length / cps;
      tw.all('.mv-caret').forEach((c) => { c.style.opacity = o.panTo && t > typingEnd + 0.1 ? 0 : done && Math.floor(t * 2.2) % 2 ? 0 : 1; });
      let camX = follow((u) => Math.min(o.camMax ?? 220, (o.caretAt ?? 0.6) * W - caretX(u)), t);
      if (o.panTo) camX = mix(camX, W / 2 - o.panTo.x(geom), prog(t, o.panTo.start, o.panTo.dur || 0.7, E.inOutStrong));
      const [p0, p1] = o.push || [1, 1.07], push = mix(p0, p1, prog(t, o.start - 0.3, o.dur || 3, E.lin));
      setAll(tw.scenes, { transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${push}) translateX(${camX}px)` });
    };
    render.all = tw.all;
    render.geom = () => geom;
    return render;
  }

  /* ── A number counting to its value ── */
  // countUp(node, {from, to, start, dur, format}) -> render(t). Several can stack: pass steps [[to, start, dur]].
  function countUp(node, o) {
    const steps = o.steps || [[o.to, o.start, o.dur || 0.6]], format = o.format || ((n) => Math.round(n).toLocaleString('en-US'));
    return (t) => {
      let v = o.from || 0;
      for (const [to, start, dur] of steps) v = mix(v, to, prog(t, start, dur, E.outCubic));
      node.textContent = format(v);
    };
  }

  /* ── Wall of results: many items, a glide, one lights up, the camera dives into it ── */
  // Options: items (html strings), cols, cell {w, h}, gap {x, y}, left, top, lit (index),
  // glide {from, to, start, dur}, litAt, accent, dive {start, dur, to: {x, y, w}} (target centre and width),
  // emerge {start, dur, from: {x, y, w}}: the reverse — start inside the lit item, pull back to reveal the wall.
  function wall(host, o) {
    const { w, h } = o.cell, gx = w + (o.gap?.x ?? 40), gy = h + (o.gap?.y ?? 30);
    const layer = el('div', 'position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform');
    host.appendChild(layer);
    const nodes = o.items.map((html, i) => {
      const c = i % o.cols, r = Math.floor(i / o.cols);
      const n = el('div', `position:absolute;left:${c * gx}px;top:${r * gy}px;width:${w}px;height:${h}px;will-change:transform`, html);
      n.dataset.row = r;
      layer.appendChild(n);
      return n;
    });
    const L = { x: (o.lit % o.cols) * gx + w / 2, y: Math.floor(o.lit / o.cols) * gy + h / 2 };
    const glideX = (t) => mix(o.glide.from, o.glide.to, prog(t, o.glide.start, o.glide.dur, E.inOutStrong));
    const render = (t) => {
      // dive: the camera ends inside the lit item; emerge: it starts inside it and pulls back to the wall
      const qd = o.dive ? prog(t, o.dive.start, o.dive.dur || 0.65, E.inOutStrong) : 0;
      const qe = o.emerge ? 1 - prog(t, o.emerge.start, o.emerge.dur || 0.9, E.inOutStrong) : 0;
      const q = Math.max(qd, qe), tgt = qd > 0 ? o.dive.to : o.emerge?.from;
      const z = tgt && q > 0 ? zoomLog(1, tgt.w / w, q) : 1;
      const bx = (o.left || 0) + L.x + glideX(t), by = (o.top || 0) + L.y;
      const px = tgt ? mix(bx, tgt.x, q) : bx, py = tgt ? mix(by, tgt.y, q) : by;
      layer.style.transform = `translate(${px - L.x * z}px, ${py - L.y * z}px) scale(${z})`;
      // Further rows glide a little slower: depth
      nodes.forEach((n) => { n.style.transform = `translateX(${(1 - q) * (glideX(t) - o.glide.from) * -0.12 * n.dataset.row}px)`; });
      const k = prog(t, o.litAt ?? o.glide.start + 1.2, 0.5);
      nodes[o.lit].style.boxShadow = glow(o.accent || '#4f46e5', k, 3, 60 * (1 - q));
    };
    render.nodes = nodes;
    return render;
  }

  /* ── Parts arriving one after another ── */
  function buildIn(nodes, { start, step = 0.27, dur = 0.5, dy = 18 } = {}) {
    return (t) => nodes.forEach((n, i) => {
      const p = prog(t, start + i * step, dur);
      set(n, { opacity: p, transform: `translateY(${(1 - p) * dy}px)` });
    });
  }

  /* ── A cascade: the same change running down a list ── */
  // apply(node, p, i, t): p is 0 before the item's turn, then springs to 1
  function cascade(nodes, { start, step = 0.17, dur = 0.4, apply }) {
    return (t) => nodes.forEach((n, i) => {
      const at = start + i * step;
      apply(n, t < at ? 0 : E.spring(clamp((t - at) / dur)), i, t, at);
    });
  }

  /* ── Montage: one item at a time, fast, centred ── */
  function montage(node, { items, start, step = 0.45, pop = 0.15 }) {
    return (t) => {
      const i = clamp(Math.floor((t - start) / step), 0, items.length - 1), local = t - start - i * step;
      node.innerHTML = items[i];
      node.style.transform = `scale(${mix(0.9, 1, prog(local, 0, pop))})`;
    };
  }

  /* ── A small chip grows into one big word ── */
  function growToWord(node, { start, dur = 0.6, from = 40, to = 250, color = '#4f46e5', glowAt = 1 } = {}) {
    return (t) => {
      const p = prog(t, start, dur, E.inOutStrong);
      set(node, {
        fontSize: `${mix(from, to, p)}px`, padding: `${mix(from * 0.2, 0, p)}px ${mix(from * 0.45, 0, p)}px`, borderRadius: `${from * 0.35}px`,
        background: hexA(color, 1 - p), color: p > 0.5 ? color : '#fff', textShadow: `0 0 ${80 * p * glowAt}px ${hexA(color, 0.45 * p * glowAt)}`,
      });
    };
  }

  /* ── Click zoom: push in on a point, click, pull out as the result opens ── */
  // Returns the zoom factor at t. Apply with transformOrigin at the point; map other points with zoomPoint.
  const clickZoom = (t, { start, out, scale = 1.35, dur = 0.6, outDur = 0.75 }) =>
    1 + (scale - 1) * prog(t, start, dur, E.inOutStrong) * (1 - prog(t, out, outDur, E.inOutStrong));
  const zoomPoint = ([x, y], [ox, oy], z) => [ox + (x - ox) * z, oy + (y - oy) * z];

  /* ── Shared element: move and reshape a box from one rect to another ── */
  function morphRect(node, a, b, p) {
    set(node, {
      left: `${mix(a.x, b.x, p)}px`, top: `${mix(a.y, b.y, p)}px`, width: `${mix(a.w, b.w, p)}px`, height: `${mix(a.h, b.h, p)}px`,
      borderRadius: `${mix(a.r ?? 0, b.r ?? 0, p)}px`,
    });
  }

  /* ── Cursor with press and click ripple ── */
  // path [[t, x, y], ...], clicks [t, ...] (clicks happen wherever the cursor is), on [[start, end], ...],
  // map(t, [x, y]) -> [x, y] to follow a camera.
  function cursor(host, { path, clicks = [], on, map, color = '#0a0a0a' }) {
    const c = el('div', 'position:absolute;left:0;top:0;width:34px;height:34px;z-index:50;will-change:transform',
      `<svg viewBox="0 0 24 24" width="34" height="34"><path d="M4 2.5 19.5 12l-7 1.6L9 20.5z" fill="${color}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`);
    const r = el('div', `position:absolute;left:0;top:0;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;border:3px solid ${color};z-index:49`);
    host.append(c, r);
    const at = (t) => {
      let i = 0;
      while (i < path.length - 2 && t > path[i + 1][0]) i++;
      const [ta, xa, ya] = path[i], [tb, xb, yb] = path[i + 1];
      const p = E.inOutStrong(clamp((t - ta) / (tb - ta)));
      const pt = [mix(xa, xb, p), mix(ya, yb, p)];
      return map ? map(t, pt) : pt;
    };
    return (t) => {
      const win = (on || [[path[0][0], path[path.length - 1][0]]]).find(([a, b]) => t >= a && t <= b);
      c.style.display = r.style.display = win ? '' : 'none';
      if (!win) return;
      const [x, y] = at(t), pressing = clicks.some((k) => Math.abs(t - k) < 0.09);
      const fade = Math.min(prog(t, win[0], 0.2, E.lin), 1 - prog(t, win[1] - 0.2, 0.2, E.lin));
      set(c, { transform: `translate(${x - 6}px, ${y - 4}px) scale(${pressing ? 0.86 : 1})`, opacity: fade });
      const k = clicks.find((k) => t >= k && t < k + 0.45);
      r.style.display = k === undefined ? 'none' : '';
      if (k !== undefined) {
        const q = (t - k) / 0.45, [rx, ry] = at(k);
        set(r, { transform: `translate(${rx}px, ${ry}px) scale(${0.3 + E.outCubic(q) * 0.9})`, opacity: 0.45 * (1 - q) });
      }
    };
  }

  /* ════════ Moves from the field guide (references/patterns.md) ════════ */

  /* ── Glow rim: a gradient light blooming around a pill or card (the prompt bar as hero object) ── */
  // The node needs position (relative/absolute). Options: colors, start, dur (bloom in), spin (deg/s), blur, spread, radius.
  function glowRim(node, { colors = ['#facc15', '#f472b6', '#a855f7', '#3b82f6', '#22d3ee', '#facc15'], start = 0, dur = 0.8, spin = 60, blur = 28, spread = 10, radius } = {}) {
    if (!node.style.position) node.style.position = 'relative';
    node.style.isolation = 'isolate';
    const r = radius ?? getComputedStyle(node).borderRadius;
    // The gradient is painted once; its colours travel by hue-rotate, which the GPU applies without repainting.
    // (Changing the gradient itself every frame re-blurs it from scratch and drops frames.)
    const grad = `conic-gradient(from 0deg, ${colors.join(', ')})`;
    const halo = el('div', `position:absolute;inset:${-spread}px;border-radius:${r};z-index:-1;background:${grad};will-change:transform,opacity,filter`);
    const ring = el('div', `position:absolute;inset:-2px;border-radius:${r};z-index:-1;padding:2px;background:${grad};will-change:filter;-webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude`);
    node.prepend(halo, ring);
    return (t) => {
      const k = prog(t, start, dur), hue = (t * spin) % 360;
      set(halo, { filter: `blur(${blur}px) hue-rotate(${hue}deg)`, opacity: 0.85 * k, transform: `scale(${mix(0.9, 1, k)})` });
      set(ring, { filter: `hue-rotate(${hue}deg)`, opacity: k });
    };
  }

  /* ── Typing into any text node, with a caret (for headlines and fields that aren't macro shots) ── */
  function typeText(node, { text, start, cps = 14, caret = true, hold = 0.6 } = {}) {
    const chars = graphemes(text), end = start + chars.length / cps;
    return (t) => {
      const n = Math.floor(clamp((t - start) * cps, 0, chars.length));
      const on = caret && t > start - 0.2 && t < end + hold && Math.floor(t * 2.4) % 2 === 0;
      node.innerHTML = `${chars.slice(0, n).join('')}<span style="display:inline-block;width:0.06em;height:0.95em;margin-left:0.04em;vertical-align:-0.12em;background:currentColor;opacity:${on || (t >= start && t < end) ? 1 : 0}"></span>`;
    };
  }

  /* ── Streaming reply: words arrive one by one, each blurring in; the box grows with them ── */
  function streamText(node, { text, start, wps = 9, blur = 6 } = {}) {
    const words = text.split(/(\s+)/);
    node.innerHTML = words.map((w) => (/^\s+$/.test(w) ? w : `<span style="display:inline-block;white-space:pre">${w}</span>`)).join('');
    const spans = [...node.querySelectorAll('span')];
    return (t) => spans.forEach((s, i) => {
      const at = start + i / wps, p = prog(t, at, 0.35);
      s.style.display = t < at ? 'none' : 'inline-block';
      set(s, { opacity: p, filter: blurOf((1 - p) * blur), transform: `translateY(${(1 - p) * 4}px)` });
    });
  }

  /* ── Thinking: three dots pulsing in turn ── */
  function thinking(node, { start = 0, end = Infinity, colors = ['#f59e0b', '#ec4899', '#6366f1'], size = 10 } = {}) {
    node.innerHTML = colors.map((c) => `<i style="display:inline-block;width:${size}px;height:${size}px;border-radius:50%;background:${c};margin:0 ${size * 0.3}px"></i>`).join('');
    const dots = [...node.children];
    return (t) => {
      const on = t >= start && t < end;
      node.style.opacity = on ? Math.min(prog(t, start, 0.2, E.lin), 1 - prog(t, end - 0.2, 0.2, E.lin)) : 0;
      dots.forEach((d, i) => { const k = 0.5 + 0.5 * Math.sin((t - start) * 7 - i * 0.9); d.style.transform = `translateY(${-k * size * 0.5}px) scale(${0.8 + 0.25 * k})`; d.style.opacity = 0.5 + 0.5 * k; });
    };
  }

  /* ── Skeleton shimmer: grey bars with a light sweeping across (something is generating) ── */
  function shimmer(nodes, { start = 0, end = Infinity, color = '#e5e7eb', shine = '#f8fafc', speed = 1.1 } = {}) {
    return (t) => nodes.forEach((n, i) => {
      const x = (((t - start) * speed + i * 0.08) % 1.4) * 140 - 20;
      n.style.background = `linear-gradient(90deg, ${color} ${x - 20}%, ${shine} ${x}%, ${color} ${x + 20}%)`;
      n.style.opacity = t < start ? 0 : 1 - prog(t, end, 0.3, E.lin);
    });
  }

  /* ── Scattered words fly into one line ── */
  // The node holds the final line as text. Options: start, dur, stagger, spread [x, y] px, scale range.
  function assemble(node, { start, dur = 0.9, stagger = 0.06, spread = [420, 240], scale = [0.55, 1.7], seed = 3 } = {}) {
    const words = maskWords(node);
    node.style.overflow = 'visible';
    const from = words.map((_, i) => ({ x: (rand(seed + i) - 0.5) * 2 * spread[0], y: (rand(seed + i + 50) - 0.5) * 2 * spread[1], s: mix(scale[0], scale[1], rand(seed + i + 99)) }));
    return (t) => words.forEach((w, i) => {
      const p = prog(t, start + i * stagger, dur, E.inOutStrong), f = from[i];
      set(w, { transform: `translate(${f.x * (1 - p)}px, ${f.y * (1 - p)}px) scale(${mix(f.s, 1, p)})`, opacity: clamp(prog(t, start + i * stagger, 0.25, E.lin) * 1.2), filter: blurOf(Math.abs(1 - p) * 3) });
    });
  }

  /* ── One word grows into a sentence: the first word big in the accent colour, then the rest arrives ── */
  function wordToSentence(node, { start, accent = '#2563eb', ink = 'currentColor', big = 2.2, grow = 0.7, stagger = 0.08 } = {}) {
    const words = maskWords(node);
    node.style.overflow = 'visible';
    words[0].style.transformOrigin = '50% 60%';
    return (t) => {
      const p = prog(t, start + 0.5, grow, E.inOutStrong);
      set(words[0], { transform: `scale(${mix(big, 1, p)})`, color: p < 0.6 ? accent : ink, opacity: prog(t, start, 0.4, E.lin), filter: blurOf((1 - prog(t, start, 0.4)) * 8) });
      words.slice(1).forEach((w, i) => {
        const q = prog(t, start + 0.6 + grow * 0.5 + i * stagger, 0.6);
        set(w, { opacity: q, transform: `translateY(${(1 - q) * 40}%)`, filter: blurOf((1 - q) * 8), maxWidth: q > 0 ? 'none' : '0px' });
      });
      // Words not yet arrived take no space, so the line stays centred as it grows
      words.slice(1).forEach((w, i) => { w.style.display = t < start + 0.6 + grow * 0.5 + i * stagger ? 'none' : 'inline-block'; });
    };
  }

  /* ── Word texture: a word repeated to fill the frame, one copy in focus inside selection brackets ── */
  function wordTexture(host, { word, start, rows = 9, cols = 5, size = 72, color = '#d1d5db', focus = '#0a0a0a', accent = '#2563eb', width = 1080, height = 1080 } = {}) {
    const layer = el('div', `position:absolute;inset:0;overflow:hidden;font-size:${size}px;font-weight:500;letter-spacing:-0.02em`);
    const cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const n = el('div', `position:absolute;left:${(c + (r % 2) * 0.5 - 0.25) * (width / (cols - 1))}px;top:${(r / (rows - 1)) * height}px;transform:translate(-50%,-50%);color:${color};white-space:nowrap`, word);
      layer.appendChild(n); cells.push(n);
    }
    const mid = el('div', `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:6px 18px;white-space:nowrap;color:${focus}`, word);
    const corners = ['left:0;top:0;border-left-width:4px;border-top-width:4px', 'right:0;top:0;border-right-width:4px;border-top-width:4px', 'left:0;bottom:0;border-left-width:4px;border-bottom-width:4px', 'right:0;bottom:0;border-right-width:4px;border-bottom-width:4px']
      .map((s) => el('i', `position:absolute;width:22px;height:22px;border:0 solid ${accent};${s}`));
    mid.append(...corners);
    layer.appendChild(mid);
    host.appendChild(layer);
    return (t) => {
      const p = prog(t, start, 0.8), f = prog(t, start + 0.6, 0.5);
      cells.forEach((n, i) => { n.style.opacity = prog(t, start + rand(i) * 0.5, 0.4, E.lin) * mix(1, 0.55, f); });
      set(mid, { opacity: p, transform: `translate(-50%,-50%) scale(${mix(1, 1.15, f)})`, background: f > 0 ? `rgba(255,255,255,${0.9 * f})` : 'transparent' });
      corners.forEach((c, i) => { set(c, { opacity: f, transform: `translate(${(i % 2 ? 1 : -1) * (1 - f) * 16}px, ${(i < 2 ? -1 : 1) * (1 - f) * 16}px)` }); });
    };
  }

  /* ── Iris: reveal a scene through a growing circle ── */
  function iris(node, { start, dur = 0.8, x = 50, y = 50, from = 0, to = 150 } = {}) {
    return (t) => {
      const p = prog(t, start, dur, E.inOutStrong);
      node.style.clipPath = p >= 1 ? 'none' : `circle(${mix(from, to, p)}% at ${x}% ${y}%)`;
    };
  }

  /* ── Pixel dissolve: reveal a scene in square blocks growing out from a point ── */
  function pixelReveal(node, { start, dur = 0.7, cell = 60, width = 1080, height = 1080, x = 0.5, y = 0.5, seed = 7 } = {}) {
    const cols = Math.ceil(width / cell), rows = Math.ceil(height / cell), cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const d = Math.hypot((c + 0.5) / cols - x, (r + 0.5) / rows - y) / 0.75;
      cells.push({ c, r, at: clamp(d * 0.8 + rand(seed + r * cols + c) * 0.2) });
    }
    return (t) => {
      const p = clamp((t - start) / dur);
      if (p >= 1) { node.style.clipPath = 'none'; return; }
      const d = cells.filter((k) => k.at <= p).map((k) => `M${k.c * cell} ${k.r * cell}h${cell}v${cell}h${-cell}Z`).join('');
      node.style.clipPath = `path('${d || 'M0 0Z'}')`;
    };
  }

  /* ── Colour sweep: a big soft gradient shape sweeps across; swap scenes at its midpoint (start + dur / 2) ── */
  function sweep(host, { start, dur = 0.9, colors = ['#a855f7', '#3b82f6', '#22d3ee'], width = 1080, height = 1080, angle = -18 } = {}) {
    const s = el('div', `position:absolute;left:0;top:${-height * 0.5}px;width:${width * 1.6}px;height:${height * 2}px;border-radius:45%;background:linear-gradient(90deg, ${colors.join(', ')});filter:blur(40px);z-index:60;pointer-events:none;will-change:transform`);
    host.appendChild(s);
    return (t) => {
      const p = clamp((t - start) / dur);
      s.style.display = p > 0 && p < 1 ? '' : 'none';
      s.style.transform = `rotate(${angle}deg) translateX(${mix(-width * 1.8, width * 1.2, E.inOutStrong(p))}px)`;
    };
  }

  /* ── 3D flip: before → after (children .mv-front and .mv-back), with a pop toward the camera ── */
  function flip(node, { start, dur = 0.8, pop = 0.12, perspective = 1400 } = {}) {
    const [front, back] = [node.querySelector('.mv-front'), node.querySelector('.mv-back')];
    [front, back].forEach((f) => set(f, { position: 'absolute', inset: '0', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }));
    back.style.transform = 'rotateY(180deg)';
    set(node, { transformStyle: 'preserve-3d', willChange: 'transform' });
    return (t) => {
      const p = prog(t, start, dur, E.inOutStrong), up = Math.sin(clamp((t - start) / dur) * Math.PI);
      node.style.transform = `perspective(${perspective}px) rotateY(${180 * p}deg) scale(${1 + pop * up})`;
    };
  }

  /* ── Generated media arriving: scan in from the top with a bright edge, or develop from blur ── */
  function scanReveal(node, { start, dur = 1.2, edge = 'rgba(255,255,255,0.9)' } = {}) {
    if (!node.style.position) node.style.position = 'relative';
    const line = el('div', `position:absolute;left:0;right:0;height:3px;background:${edge};box-shadow:0 0 18px 6px ${edge};z-index:2;pointer-events:none`);
    node.appendChild(line);
    return (t) => {
      const p = clamp((t - start) / dur);
      node.style.clipPath = `inset(0 0 ${(1 - p) * 100}% 0)`;
      set(line, { top: `calc(${p * 100}% - 2px)`, opacity: p > 0 && p < 1 ? 1 : 0 });
    };
  }
  function develop(node, { start, dur = 1.4 } = {}) {
    return (t) => {
      const p = prog(t, start, dur, E.outCubic);
      set(node, { filter: `blur(${(1 - p) * 24}px) saturate(${p})`, opacity: clamp(p * 3) });
    };
  }

  /* ── Ticker: rows of chips scrolling sideways, alternate rows the other way ── */
  // rows: [[html, ...], ...]; host gets the rows stacked. speed px/s.
  function ticker(host, { rows, speed = 60, gap = 18, rowGap = 22, start = 0 } = {}) {
    const lanes = rows.map((items, i) => {
      const lane = el('div', `position:absolute;left:0;top:${i * (rowGap + 48)}px;display:flex;gap:${gap}px;white-space:nowrap;will-change:transform`);
      lane.innerHTML = [...items, ...items, ...items].map((h) => `<div style="flex:none">${h}</div>`).join('');
      host.appendChild(lane);
      return lane;
    });
    return (t) => lanes.forEach((lane, i) => {
      const w = lane.scrollWidth / 3, x = ((t - start) * speed * (i % 2 ? -1 : 1) + i * 137) % w;
      lane.style.transform = `translateX(${-(x < 0 ? x + w : x) - w * 0.5}px)`;
    });
  }

  /* ── Draw a path (SVG <path>), with a dot travelling along its tip: lines between nodes, data flowing ── */
  function drawPath(path, { start, dur = 0.8, dot } = {}) {
    const L = path.getTotalLength();
    path.style.strokeDasharray = L;
    return (t) => {
      const p = prog(t, start, dur, E.inOutStrong);
      path.style.strokeDashoffset = L * (1 - p);
      if (dot) {
        const on = p > 0 && p < 1, pt = path.getPointAtLength(L * p);
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        dot.style.opacity = on ? 1 : 0;
      }
    };
  }

  /* ── Toast stack: notifications slide in from the top; older ones shrink and tuck behind ── */
  // items: [{node, at}] already inside host, positioned at the same spot.
  function toasts(items, { drop = 70, step = 14, shrink = 0.05 } = {}) {
    return (t) => items.forEach(({ node, at }, i) => {
      const newer = items.filter((x, j) => j > i && t >= x.at).length, p = E.spring(clamp((t - at) / 0.6));
      set(node, {
        opacity: t < at ? 0 : clamp((t - at) * 6) * (newer > 2 ? 0 : 1),
        transform: `translateY(${(1 - p) * -drop + newer * step}px) scale(${1 - newer * shrink})`, zIndex: 10 + i,
      });
    });
  }

  /* ── Lift out: one item rises out of its list; everything else blurs away ── */
  function liftOut(item, others, { start, dur = 0.6, scale = 1.12, blur = 8 } = {}) {
    return (t) => {
      const p = prog(t, start, dur, E.inOutStrong);
      set(item, { transform: `scale(${mix(1, scale, p)})`, boxShadow: `0 ${30 * p}px ${60 * p}px -20px rgba(0,0,0,${0.35 * p})`, zIndex: 5 });
      others.forEach((o) => set(o, { filter: blurOf(blur * p), opacity: 1 - 0.6 * p }));
    };
  }

  /* ── Press ripple: concentric rings out from a button ── */
  function ripple(host, { at, x, y, color = '#2563eb', rings = 3, size = 220 } = {}) {
    const rs = Array.from({ length: rings }, () => el('div', `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;background:radial-gradient(circle, ${hexA(color, 0)} 40%, ${hexA(color, 0.35)} 70%, ${hexA(color, 0)} 72%);pointer-events:none`));
    host.append(...rs);
    return (t) => rs.forEach((r, i) => {
      const q = clamp((t - at - i * 0.12) / 0.9);
      set(r, { display: q > 0 && q < 1 ? '' : 'none', transform: `scale(${0.3 + E.outCubic(q) * 1.4})`, opacity: 1 - q });
    });
  }

  /* ── Drift: floating fragments bob gently at their own depth (far ones slower, smaller, blurred) ── */
  // nodes: [{node, depth}] with depth 0 (near) .. 1 (far)
  function drift(items, { amp = 12, speed = 0.5 } = {}) {
    return (t) => items.forEach(({ node, depth = 0 }, i) => {
      const a = amp * (1 - depth * 0.6), s = speed * (1 - depth * 0.5);
      set(node, { transform: `translate(${Math.sin(t * s + i * 1.7) * a}px, ${Math.cos(t * s * 0.8 + i) * a}px) scale(${1 - depth * 0.25})`, filter: blurOf(depth * 6), opacity: 1 - depth * 0.35 });
    });
  }

  /* ── Start: wait for fonts and images, then hand over to the recorder or play a preview ── */
  // start({stage, width, height, duration, render, fonts: ['600 96px Brand', ...]})
  async function start({ stage, width = 1080, height = 1080, duration, render, fonts = [] }) {
    set(stage, { width: `${width}px`, height: `${height}px`, position: 'absolute', left: '0', top: '0', transformOrigin: '0 0', overflow: 'hidden' });
    await Promise.all([...fonts.map((f) => document.fonts.load(f)), ...[...document.images].map((img) => img.decode().catch(() => console.warn('image failed', img.src)))]);
    await document.fonts.ready;
    render(0);
    Object.assign(g, { render, DURATION: duration, WIDTH: width, HEIGHT: height, ready: true });
    const params = new URLSearchParams(location.search);
    if (params.has('record')) return;
    const fit = () => {
      const k = Math.min(innerWidth / width, innerHeight / height);
      stage.style.transform = `translate(${(innerWidth - width * k) / 2}px, ${(innerHeight - height * k) / 2}px) scale(${k})`;
    };
    fit();
    addEventListener('resize', fit);
    // Space pause, R restart, arrows +-5 s (or one frame while paused), F fullscreen, ?t=12 starts at 12 s
    let clock = Number(params.get('t')) || 0, paused = false, last = performance.now();
    const loop = (now) => {
      if (!paused) clock += (now - last) / 1000;
      last = now;
      clock = ((clock % duration) + duration) % duration;
      render(clock);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase(), step = paused ? 1 / 60 : 5;
      if (key === ' ') { paused = !paused; e.preventDefault(); }
      else if (key === 'r') clock = 0;
      else if (key === 'arrowright') clock += step;
      else if (key === 'arrowleft') clock -= step;
      else if (key === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    });
  }

  g.MV = {
    clamp, bezier, E, prog, mix, set, setAll, blurOf, rand, spring, zoomLog, onBeat, follow, press, graphemes, el, glow, hexA, rectOf,
    maskWords, rise, motionBlur, shots, twin, macroType, countUp, wall, buildIn, cascade, montage, growToWord, clickZoom, zoomPoint,
    morphRect, cursor, start,
    glowRim, typeText, streamText, thinking, shimmer, assemble, wordToSentence, wordTexture, iris, pixelReveal, sweep, flip,
    scanReveal, develop, ticker, drawPath, toasts, liftOut, ripple, drift,
  };
})(window);
