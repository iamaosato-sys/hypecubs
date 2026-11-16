/* HypeCubs — kids' movement quests (ages 6–11). Plain JS, no build step.
   All data stays on this device (localStorage key: hypecubs.v1). No analytics, no network calls. */
'use strict';

const KEY = 'hypecubs.v1';
const $main = document.getElementById('main');
const $hype = document.getElementById('hype');
const $modal = document.getElementById('modal');

/* ---------- Storage ---------- */
function blank() { return { v: 1, setup: false, profiles: [], active: null }; }
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return s; } catch (e) {}
  return blank();
}
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function me() { return S.profiles.find((p) => p.id === S.active) || S.profiles[0]; }
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function nice(d) { try { return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return d; } }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function nameOf(p) { return p && p.nick ? p.nick : 'Explorer'; }

function newProfile(o) {
  const cr = {};
  CREATURE_IDS.forEach((id) => { cr[id] = { lv: 0, t: ladder({ bar: o.bar }, id)[0].r[0], tricky: 0, practice: false, last: null }; });
  return {
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nick: o.nick || '', band: o.band || 'cubs', bar: !!o.bar, quiet: !!o.quiet, voice: o.voice !== false,
    cr, logs: 0, brave: 0, coach: 0, firsts: [], ch: 0, lastDone: null, sessions: []
  };
}
function first(p, txt) { p.firsts.push({ d: today(), txt }); }

/* ---------- Ladder helpers ---------- */
function ladder(p, id) { const c = CREATURES[id]; return id === 'monkey' && !p.bar ? c.home : c.levels; }
function rounds(p) { return p.band === 'explorers' ? 3 : 2; }
function moveText(p, L) { return p.quiet && L.quiet ? L.quiet : L.n; }
function targetText(L, t) {
  const u = UNIT[L.u];
  const each = L.each ? ' each side' : '';
  if (L.u === 's') return 'Hold for ' + t + ' ' + u + each;
  return 'Do ' + t + ' ' + u + each;
}
/* What to do this session: real level, or the practice version after two "too tricky" reports. */
function current(p, id) {
  const c = p.cr[id];
  const lad = ladder(p, id);
  if (c.practice) {
    if (c.lv > 0) { const L = lad[c.lv - 1]; return { L, t: L.r[1], practice: true }; }
    const L = lad[0]; return { L, t: Math.max(1, Math.ceil(L.r[0] / 2)), practice: true };
  }
  return { L: lad[c.lv], t: c.t, practice: false };
}

/* ---------- Progression (levels never go down) ---------- */
function progress(p, id, res) {
  const c = p.cr[id];
  const lad = ladder(p, id);
  const out = { evolve: false };
  if (res === 'all') {
    if (c.practice) { c.practice = false; }
    else {
      const L = lad[c.lv];
      c.t += STEP[L.u];
      if (c.t > L.r[1]) {
        if (c.lv < 4) {
          c.lv += 1; c.t = lad[c.lv].r[0]; out.evolve = true;
          first(p, 'Your ' + CREATURES[id].name + ' became a ' + STAGES[c.lv] + '!');
        } else { c.t = L.r[1]; if (!c.legend) { c.legend = true; first(p, 'Mastered every ' + CREATURES[id].name + ' level!'); } }
      }
    }
    c.tricky = 0;
  } else if (res === 'some') {
    c.tricky = 0;
  } else {
    c.tricky += 1;
    if (c.tricky >= 2 && !c.practice) { c.practice = true; c.tricky = 0; out.practiceOn = true; }
  }
  c.last = today();
  return out;
}

/* Two story paths: both include the two creatures trained longest ago, so all six rotate. */
function paths(p) {
  const ranked = CREATURE_IDS.slice().sort((a, b) => {
    const la = p.cr[a].last || '0000', lb = p.cr[b].last || '0000';
    return la < lb ? -1 : la > lb ? 1 : CREATURE_IDS.indexOf(a) - CREATURE_IDS.indexOf(b);
  });
  return [[ranked[0], ranked[1], ranked[2]], [ranked[0], ranked[1], ranked[3]]];
}

/* ---------- Voice + sound ---------- */
function speak(txt) {
  const p = me();
  if (!p || !p.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'en-GB'; u.rate = 0.95; u.pitch = 1.1;
    const v = speechSynthesis.getVoices().find((x) => /en-GB/i.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}
let audio;
function beep(f, ms) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = f || 660; o.connect(g); g.connect(audio.destination);
    g.gain.setValueAtTime(0.15, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + (ms || 200) / 1000);
    o.start(); o.stop(audio.currentTime + (ms || 200) / 1000);
  } catch (e) {}
}
function hype(msg) {
  $hype.textContent = msg;
  $hype.classList.add('show');
  clearTimeout(hype.t);
  hype.t = setTimeout(() => $hype.classList.remove('show'), 3600);
}
function confetti() {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti';
  const cols = ['#ffc93c', '#ff7eb6', '#5ed37a', '#4fb3ff', '#ff8a3d'];
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%'; s.style.background = pick(cols);
    s.style.animationDelay = Math.random() * 0.6 + 's';
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2600);
}

/* ---------- Icons (authored SVG, one stroke weight) ---------- */
const ICONS = {
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  slide: '<path d="M5 21V5M5 5h4M5 10h4M5 15h4"/><path d="M9 5c4 0 4 6 7 10s4 6 6 6"/>',
  wiggle: '<path d="M2 12l3-4 3 8 3-8 3 8 3-8 3 8 2-4"/>',
  whistle: '<circle cx="9" cy="14" r="5"/><path d="M12 10l9-3v5l-7 2"/><path d="M5 5l2 2M9 3v3"/>',
  book: '<path d="M12 6c-2-1.5-5-2-9-2v14c4 0 7 .5 9 2 2-1.5 5-2 9-2V4c-4 0-7 .5-9 2z"/><path d="M12 6v14"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  skip: '<path d="M5 5l9 7-9 7z"/><path d="M18 5v14"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  back: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 13V9M9 2h6"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>'
};
function icon(n, s) {
  s = s || 24;
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[n] + '</svg>';
}

/* ---------- Creature waymarker discs (original SVG) ---------- */
function artBody(id) {
  const c = CREATURES[id] ? CREATURES[id].colour : '#ff8a3d';
  const eyes = '<circle cx="40" cy="48" r="4.5" fill="#12301d"/><circle cx="60" cy="48" r="4.5" fill="#12301d"/><circle cx="41.6" cy="46.4" r="1.5" fill="#fff"/><circle cx="61.6" cy="46.4" r="1.5" fill="#fff"/>';
  const smile = '<path d="M42 62 q8 7 16 0" stroke="#12301d" stroke-width="3" fill="none" stroke-linecap="round"/>';
  switch (id) {
    case 'bear': return '<circle cx="29" cy="30" r="11" fill="' + c + '"/><circle cx="71" cy="30" r="11" fill="' + c + '"/><circle cx="29" cy="30" r="5" fill="#e7c49a"/><circle cx="71" cy="30" r="5" fill="#e7c49a"/><circle cx="50" cy="53" r="27" fill="' + c + '"/><ellipse cx="50" cy="62" rx="13" ry="10" fill="#e7c49a"/><ellipse cx="50" cy="57" rx="4.5" ry="3.5" fill="#12301d"/>' + eyes + smile;
    case 'gorilla': return '<circle cx="50" cy="52" r="28" fill="' + c + '"/><ellipse cx="50" cy="57" rx="19" ry="17" fill="#b8b9c2"/><path d="M31 42 q19 -8 38 0 v5 h-38z" fill="#3c404b"/>' + eyes + '<ellipse cx="45.5" cy="58" rx="2.4" ry="1.8" fill="#12301d"/><ellipse cx="54.5" cy="58" rx="2.4" ry="1.8" fill="#12301d"/>' + smile;
    case 'kangaroo': return '<ellipse cx="37" cy="22" rx="7" ry="16" fill="' + c + '"/><ellipse cx="63" cy="22" rx="7" ry="16" fill="' + c + '"/><ellipse cx="37" cy="24" rx="3" ry="9" fill="#f6c99b"/><ellipse cx="63" cy="24" rx="3" ry="9" fill="#f6c99b"/><ellipse cx="50" cy="53" rx="24" ry="27" fill="' + c + '"/><ellipse cx="50" cy="65" rx="14" ry="11" fill="#f6d3ad"/><circle cx="50" cy="60" r="3.5" fill="#12301d"/>' + eyes + smile;
    case 'crab': return '<path d="M8 34 q10 -16 22 0 q-8 -2 -10 8z" fill="' + c + '"/><path d="M92 34 q-10 -16 -22 0 q8 -2 10 8z" fill="' + c + '"/><ellipse cx="50" cy="61" rx="31" ry="21" fill="' + c + '"/><path d="M39 44 v-12 M61 44 v-12" stroke="' + c + '" stroke-width="4.5" stroke-linecap="round"/><circle cx="39" cy="29" r="7" fill="#fff"/><circle cx="61" cy="29" r="7" fill="#fff"/><circle cx="40" cy="30" r="3.5" fill="#12301d"/><circle cx="62" cy="30" r="3.5" fill="#12301d"/><path d="M41 65 q9 7 18 0" stroke="#12301d" stroke-width="3" fill="none" stroke-linecap="round"/>';
    case 'flamingo': return '<circle cx="48" cy="48" r="25" fill="' + c + '"/><path d="M63 50 q20 1 18 18 q-7 -5 -16 -7z" fill="#ffe08a"/><path d="M75 61 q4 6 4 9 q-6 -2 -10 -5z" fill="#12301d"/><circle cx="43" cy="44" r="4.5" fill="#12301d"/><circle cx="44.6" cy="42.4" r="1.5" fill="#fff"/><ellipse cx="34" cy="56" rx="5" ry="3" fill="#ff4f97" opacity=".6"/><path d="M40 24 q6 -10 12 -2" stroke="' + c + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
    case 'monkey': return '<circle cx="23" cy="50" r="11" fill="' + c + '"/><circle cx="77" cy="50" r="11" fill="' + c + '"/><circle cx="23" cy="50" r="5.5" fill="#e8b98a"/><circle cx="77" cy="50" r="5.5" fill="#e8b98a"/><circle cx="50" cy="50" r="27" fill="' + c + '"/><path d="M30 53 q0 -17 20 -12 q20 -5 20 12 q0 18 -20 18 q-20 0 -20 -18z" fill="#e8b98a"/>' + eyes + smile;
    default: return '<path d="M28 33 L36 12 L46 30 Z" fill="#ff8a3d"/><path d="M72 33 L64 12 L54 30 Z" fill="#ff8a3d"/><circle cx="50" cy="54" r="28" fill="#ff8a3d"/><ellipse cx="50" cy="65" rx="15" ry="11" fill="#fff1dd"/><circle cx="50" cy="59" r="4" fill="#12301d"/>' + eyes + smile;
  }
}
/* A creature on a waymarker disc. The ring thickens and brightens as it evolves; Legends get a crown. */
function art(id, stage, size, x, y) {
  size = size || 96; stage = stage || 0;
  const zone = ZONES[id] ? ZONES[id].colour : '#ffd23f';
  const ring = ['#f3faea', '#ffd23f', '#ffb020', '#ff7a1a', '#ff7a1a'][stage];
  const rw = 4 + stage * 1.2;
  const crown = stage >= 4 ? '<path d="M35 20 l5 -11 l10 8 l10 -8 l5 11 z" fill="#ffd23f" stroke="#12301d" stroke-width="2" stroke-linejoin="round"/>' : '';
  const pos = x != null ? ' x="' + x + '" y="' + y + '"' : '';
  return '<svg class="disc"' + pos + ' viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">' +
    '<circle cx="50" cy="50" r="' + (47 - rw / 2) + '" fill="' + zone + '" stroke="#12301d" stroke-width="3"/>' +
    '<circle cx="50" cy="50" r="' + (44 - rw) + '" fill="none" stroke="' + ring + '" stroke-width="' + rw + '"/>' +
    '<g transform="translate(9 9) scale(.82)">' + artBody(id) + '</g>' + crown + '</svg>';
}
function stars(stage) {
  let s = '<span class="stars" role="img" aria-label="' + STAGES[stage] + ', stage ' + (stage + 1) + ' of 5">';
  for (let i = 0; i < 5; i++) s += '<i class="' + (i <= stage ? 'on' : '') + '"></i>';
  return s + '</span>';
}
function faceSvg(kind) {
  const base = '<circle cx="32" cy="32" r="28" fill="#ffd23f" stroke="#12301d" stroke-width="3"/>';
  const e = '<circle cx="23" cy="27" r="3.5" fill="#12301d"/><circle cx="41" cy="27" r="3.5" fill="#12301d"/>';
  const m = { great: '<path d="M19 38 q13 13 26 0z" fill="#12301d"/>', ok: '<path d="M21 40 q11 6 22 0" stroke="#12301d" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    puffed: '<circle cx="32" cy="42" r="5" fill="#12301d"/><circle cx="16" cy="38" r="4" fill="#ff8fb8"/><circle cx="48" cy="38" r="4" fill="#ff8fb8"/><path d="M54 14 q6 -2 8 2 M56 22 q6 0 6 4" stroke="#12301d" stroke-width="2.5" fill="none" stroke-linecap="round"/>' };
  return '<svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true">' + base + e + m[kind] + '</svg>';
}
function starsSvg(n) {
  let s = '<span class="row c" aria-hidden="true">';
  for (let i = 0; i < n; i++) s += '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.5l1.1-6.5L2.6 9.4l6.5-.9z" fill="#ff7a1a" stroke="#12301d" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  return s + '</span>';
}
function cubHead(x, y, s, sleeping) {
  const eyes = sleeping ? '<path d="M35 49 q5 4 10 0 M55 49 q5 4 10 0" stroke="#12301d" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : '<circle cx="40" cy="48" r="4.5" fill="#12301d"/><circle cx="60" cy="48" r="4.5" fill="#12301d"/><path d="M42 63 q8 7 16 0" stroke="#12301d" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M28 33 L36 12 L46 30 Z" fill="#ff8a3d" stroke="#12301d" stroke-width="2.5" stroke-linejoin="round"/><path d="M72 33 L64 12 L54 30 Z" fill="#ff8a3d" stroke="#12301d" stroke-width="2.5" stroke-linejoin="round"/><circle cx="50" cy="54" r="28" fill="#ff8a3d" stroke="#12301d" stroke-width="2.5"/><ellipse cx="50" cy="65" rx="15" ry="11" fill="#fff1dd"/><circle cx="50" cy="59" r="4" fill="#12301d"/>' + eyes + '</g>';
}

/* ---------- The forest map ---------- */
function zoneShape(id, z, alpha) {
  const c = z.colour, x = z.x, y = z.y;
  let g = '<g opacity="' + alpha + '">';
  switch (id) {
    case 'gorilla':
      g += '<path d="M' + (x - 72) + ' ' + (y + 40) + ' q10 -40 40 -48 q30 -30 60 -6 q30 8 38 54 z" fill="#b9b4d6"/>' +
        '<path d="M' + (x - 60) + ' ' + (y + 40) + ' l34 -62 l26 40 l20 -30 l40 52z" fill="' + c + '"/>' +
        '<path d="M' + (x - 26) + ' ' + (y - 22) + ' l-9 17 l9 -5 l8 6z M' + (x + 20) + ' ' + (y - 12) + ' l-7 12 l7 -3 l6 4z" fill="#fff"/>';
      break;
    case 'monkey':
      g += '<path d="M' + (x - 74) + ' ' + (y + 30) + ' q-6 -50 40 -58 q40 -20 70 6 q34 18 20 58 q-30 20 -70 14 q-40 4 -60 -20z" fill="#7fd0a9"/>';
      [[-44, -6, 20], [-14, -22, 24], [22, -12, 22], [44, 10, 18], [-30, 20, 18], [6, 18, 20]].forEach((t) => {
        g += '<circle cx="' + (x + t[0]) + '" cy="' + (y + t[1]) + '" r="' + t[2] + '" fill="' + c + '"/><circle cx="' + (x + t[0] - t[2] / 3) + '" cy="' + (y + t[1] - t[2] / 3) + '" r="' + t[2] / 3 + '" fill="#4fc79a"/>';
      });
      break;
    case 'flamingo':
      g += '<ellipse cx="' + x + '" cy="' + y + '" rx="70" ry="44" fill="#ffd1e3"/><ellipse cx="' + x + '" cy="' + y + '" rx="58" ry="34" fill="' + c + '"/>' +
        '<path d="M' + (x - 34) + ' ' + (y + 6) + ' q8 -5 16 0 t16 0 M' + (x + 4) + ' ' + (y + 18) + ' q8 -5 16 0 t16 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (x + 56) + ' ' + (y - 24) + ' v-16 M' + (x + 62) + ' ' + (y - 22) + ' v-20 M' + (x + 50) + ' ' + (y - 20) + ' v-12" stroke="#3d7a3a" stroke-width="3" stroke-linecap="round"/>';
      break;
    case 'crab':
      g += '<path d="M' + (x - 70) + ' ' + (y - 44) + ' q40 -10 76 0 q30 10 54 -4 v96 q-50 10 -90 0 q-30 -6 -40 -20z" fill="#f5d27a"/>' +
        '<path d="M' + (x - 10) + ' ' + (y - 44) + ' q20 10 30 0 q20 -8 40 -4 v96 q-26 6 -40 2 q-20 -40 -30 -94z" fill="' + c + '"/>' +
        '<path d="M' + (x + 26) + ' ' + (y - 4) + ' q7 -5 14 0 t14 0 M' + (x + 22) + ' ' + (y + 22) + ' q7 -5 14 0 t14 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
      break;
    case 'bear':
      g += '<path d="M' + (x - 76) + ' ' + (y + 34) + ' q-4 -54 46 -60 q44 -16 72 10 q30 22 12 54 q-60 18 -130 -4z" fill="#6fb784"/>';
      [[-48, 10], [-22, -14], [4, 6], [30, -10], [-32, 30], [16, 30], [44, 16]].forEach((t) => {
        g += '<path d="M' + (x + t[0]) + ' ' + (y + t[1] - 26) + ' l-15 30 h30 z" fill="' + c + '"/><rect x="' + (x + t[0] - 2.5) + '" y="' + (y + t[1] + 3) + '" width="5" height="7" fill="#5a3519"/>';
      });
      break;
    case 'kangaroo':
      g += '<path d="M' + (x - 74) + ' ' + (y + 30) + ' q-10 -50 40 -56 q46 -12 76 12 q28 22 10 50 q-60 16 -126 -6z" fill="' + c + '"/>';
      [[-40, -6], [-10, -20], [22, -6], [40, 14], [-24, 18], [8, 16]].forEach((t) => {
        g += '<path d="M' + (x + t[0] - 6) + ' ' + (y + t[1] + 6) + ' l3 -10 l3 8 l3 -12 l3 14" stroke="#b07d12" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
      });
      break;
  }
  return g + '</g>';
}
function smoothPath(pts) {
  let d = 'M' + pts[0][0] + ' ' + pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ' C' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ' ' + p2[0] + ' ' + p2[1];
  }
  return d;
}
/* trail: creature ids to route (in order); opts: { draw, sleeping, label } */
function forestMap(p, trail, opts) {
  opts = opts || {};
  const lv = (id) => (p && p.cr ? p.cr[id].lv : 0);
  const logs = p ? p.logs : 0;
  let s = '<svg class="map" viewBox="0 0 360 470" role="img" aria-label="' + esc(opts.label || 'Map of The Lost Forest') + '">';
  s += '<defs><pattern id="ct" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M-5 20 q20 -12 35 0 t35 0 M-5 48 q20 -10 35 0 t35 0" stroke="#a9d385" stroke-width="1.6" fill="none"/></pattern></defs>';
  s += '<rect width="360" height="470" fill="#c3e39e"/><rect width="360" height="470" fill="url(#ct)"/>';
  CREATURE_IDS.forEach((id) => { s += zoneShape(id, ZONES[id], Math.min(1, 0.74 + lv(id) * 0.065)); });
  // campfire clearing
  const fl = logs >= 40 ? 5 : logs >= 25 ? 4 : logs >= 15 ? 3 : logs >= 8 ? 2 : logs >= 3 ? 1 : 0;
  const fh = 26 + fl * 6;
  s += '<ellipse cx="180" cy="246" rx="46" ry="22" fill="#e8d6a0" stroke="#c9b47a" stroke-width="2"/>';
  s += '<rect x="158" y="244" width="44" height="8" rx="4" fill="#7a4b2a" transform="rotate(-14 180 248)"/><rect x="158" y="244" width="44" height="8" rx="4" fill="#5a3519" transform="rotate(14 180 248)"/>';
  if (logs > 0) {
    s += '<path class="flame" d="M180 ' + (246 - fh) + ' C ' + (194 + fl) + ' ' + (246 - fh * .55) + ', 196 242, 180 246 C 164 242, ' + (166 - fl) + ' ' + (246 - fh * .55) + ', 180 ' + (246 - fh) + 'Z" fill="#ff7a1a" stroke="#12301d" stroke-width="2"/>';
    s += '<path class="flame" d="M180 ' + (246 - fh * .6) + ' C 188 ' + (246 - fh * .35) + ', 188 243, 180 245 C 172 243, 172 ' + (246 - fh * .35) + ', 180 ' + (246 - fh * .6) + 'Z" fill="#ffd23f"/>';
  } else s += '<circle cx="180" cy="242" r="3.5" fill="#ff7a1a"/>';
  // trail
  if (trail && trail.length) {
    const ordered = trail.slice().sort((a, b) => ZONES[b].y - ZONES[a].y);
    const pts = [[180, 452]].concat(ordered.map((id) => [ZONES[id].x + (ZONES[id].x < 180 ? 50 : -50), ZONES[id].y + 6])).concat([[180, 266]]);
    const d = smoothPath(pts);
    s += '<path d="' + d + '" stroke="#fff6d6" stroke-width="13" fill="none" stroke-linecap="round" pathLength="1" class="' + (opts.draw ? 'trail-case' : '') + '"/>';
    s += '<path d="' + d + '" stroke="#ff7a1a" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="10 9" class="' + (opts.draw ? 'trail-dash' : '') + '"/>';
    ordered.forEach((id, i) => {
      const px = pts[i + 1][0], py = pts[i + 1][1];
      s += '<g class="post-pop" style="animation-delay:' + (opts.draw ? 0.5 + i * 0.35 : 0) + 's"><rect x="' + (px - 4) + '" y="' + (py - 8) + '" width="8" height="22" rx="2" fill="#5a3519"/>' +
        '<circle cx="' + px + '" cy="' + (py - 14) + '" r="13" fill="#ff7a1a" stroke="#12301d" stroke-width="3"/>' +
        '<text x="' + px + '" y="' + (py - 8.5) + '" text-anchor="middle" font-size="16" fill="#12301d">' + (i + 1) + '</text></g>';
    });
  }
  // creature discs + zone labels
  CREATURE_IDS.forEach((id) => {
    const z = ZONES[id];
    const lx = z.x, ly = z.y + (id === 'gorilla' || id === 'monkey' ? 58 : 52);
    s += art(id, lv(id), 56, z.x - 28, z.y - 36);
    const w = z.name.length * 7.2 + 16;
    s += '<rect x="' + (lx - w / 2) + '" y="' + (ly - 13) + '" width="' + w + '" height="20" rx="6" fill="#f3faea" stroke="#12301d" stroke-width="2"/>' +
      '<text x="' + lx + '" y="' + (ly + 2.5) + '" text-anchor="middle" font-size="13" fill="#12301d">' + z.name + '</text>';
  });
  // trailhead + cub
  s += '<rect x="150" y="440" width="60" height="22" rx="5" fill="#7a4b2a" stroke="#12301d" stroke-width="2"/><text x="180" y="456" text-anchor="middle" font-size="12" fill="#ffd23f">TRAILHEAD</text>';
  s += cubHead(110, 410, 0.5, opts.sleeping);
  if (opts.sleeping) s += '<text x="160" y="418" font-size="15" fill="#12301d">z z z</text>';
  return s + '</svg>';
}

/* Rounds as one unbroken row of trail markers with a "you are here" light */
function markers() {
  const p = me(); const R = rounds(p); let h = '<div class="markers" role="img" aria-label="Creature ' + (Q.i + 1) + ' of ' + Q.list.length + ', round ' + Q.round + ' of ' + R + '">';
  Q.list.forEach((id, ci) => {
    for (let r = 1; r <= R; r++) {
      const done = ci < Q.i || (ci === Q.i && r < Q.round);
      const now = ci === Q.i && r === Q.round && (view === 'quest' || view === 'rest');
      h += (ci === 0 && r === 1 ? '' : '<i></i>') + '<b class="' + (done ? 'done' : now ? 'now' : '') + (r === 1 && ci > 0 ? ' gap' : '') + '"></b>';
    }
  });
  return h + '</div>';
}

/* ---------- Navigation ---------- */
let view = 'home', arg = null, Q = null, T = null;
function go(v, a) { view = v; arg = a; stopTimer(); render(); window.scrollTo(0, 0); $main.focus({ preventScroll: true }); }
const NO_NAV = ['quest', 'rest', 'report', 'feel', 'brave', 'wiggling', 'handover'];
function render() {
  if (!S.setup || !S.profiles.length) { if (!view.startsWith('setup')) view = 'setup1'; }
  const fn = VIEWS[view] || VIEWS.home;
  $main.innerHTML = fn();
  document.querySelectorAll('.nav').forEach((b) => b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false'));
  document.querySelector('.top nav').hidden = !S.setup || NO_NAV.includes(view);
  hideCub();
}
/* The hidden Cub: one per day, somewhere on a screen, for patient eyes. */
const CUB_SPOTS = [{ right: '2px', top: '8px' }, { left: '0', bottom: '4px' }, { right: '0', bottom: '30%' }, { left: '-4px', top: '38%' }, { right: '8px', top: '55%' }];
function hideCub() {
  const p = me();
  if (!S.setup || !p || NO_NAV.includes(view) || view.startsWith('setup') || view === 'grownups') return;
  if (p.cubDay === today() || Math.random() > 0.45) return;
  const spot = pick(CUB_SPOTS);
  const b = document.createElement('button');
  b.className = 'hidden-cub'; b.dataset.act = 'foundCub'; b.setAttribute('aria-label', 'A hidden cub! Tap to find it');
  Object.assign(b.style, spot);
  b.innerHTML = '<svg viewBox="0 0 100 70" width="44" height="31" aria-hidden="true"><path d="M22 44 L32 10 L46 38 Z" fill="#ff8a3d" stroke="#12301d" stroke-width="4" stroke-linejoin="round"/><path d="M78 44 L68 10 L54 38 Z" fill="#ff8a3d" stroke="#12301d" stroke-width="4" stroke-linejoin="round"/><path d="M14 70 q0 -36 36 -36 q36 0 36 36z" fill="#ff8a3d" stroke="#12301d" stroke-width="4"/><circle cx="38" cy="56" r="5" fill="#12301d"/><circle cx="62" cy="56" r="5" fill="#12301d"/></svg>';
  $main.appendChild(b);
}

/* ---------- Views ---------- */
const VIEWS = {};
const DEMO = { cr: { bear: { lv: 1 }, gorilla: { lv: 0 }, kangaroo: { lv: 2 }, crab: { lv: 0 }, flamingo: { lv: 1 }, monkey: { lv: 0 } }, logs: 4 };
const backBtn = (v, label) => `<button class="plank ghost" data-act="go" data-v="${v}">${icon('back', 20)} ${label || 'Back'}</button>`;

/* Setup: grown-up first, then hand over */
VIEWS.setup1 = () => `
  <h1>Welcome to HypeCubs</h1>
  <p class="sub">A two-minute setup for grown-ups</p>
  <div class="mapwrap">${forestMap(DEMO, ['kangaroo', 'flamingo', 'monkey'], { draw: true, label: 'Example map of The Lost Forest with a trail' })}</div>
  <section class="sheet">
  <p>Short movement quests for children aged 6–11. Your child walks trails through The Lost Forest and helps six animal creatures grow stronger by practising real skills: crawling, hanging, jumping, balancing and pushing.</p>
  <ul class="log">
    <li>${icon('timer')}<span><b>10–15 minutes, 3 times a week</b>One trail a day, so muscles get rest.</span></li>
    <li>${icon('map')}<span><b>No equipment needed</b>Monkey bars or a secure bar is a bonus.</span></li>
    <li>${icon('lock')}<span><b>No account, no ads, nothing to buy</b>Nothing leaves this device.</span></li>
  </ul></section>
  <button class="sign" data-act="go" data-v="setup2">Start setup ${icon('arrow', 26)}</button>`;

VIEWS.setup2 = () => `
  <h1>Quick health check</h1><p class="sub">Grown-ups · step 1 of 3</p>
  <section class="sheet">
  <p>Tick any that apply to your child. Your answers are <b>not saved</b> anywhere.</p>
  <fieldset><legend>Does your child…</legend>
  ${['have a heart condition, or has a doctor said they should only do certain activity?', 'get chest pain, faint or get very breathless when active?', 'have asthma that isn\'t well controlled?', 'have a current injury, or bone or joint problem?', 'have any other condition that affects exercise?']
    .map((q, i) => `<label class="opt"><input type="checkbox" name="hc" value="${i}"> ${q}</label>`).join('')}
  </fieldset>
  <div id="hcWarn"></div></section>
  <button class="sign" data-act="health">Continue ${icon('arrow', 26)}</button>`;

VIEWS.setup3 = () => `
  <h1>Safety promises</h1><p class="sub">Grown-ups · step 2 of 3</p>
  <section class="sheet">
  <p>HypeCubs moves are gentle bodyweight play, but children move best with a grown-up nearby. Please tick each one.</p>
  <fieldset><legend>I will…</legend>
  ${['make sure there is clear space, with nothing to bump into', 'have my child wear trainers or go barefoot (no socks on hard floors)', 'stay close when they hang from a bar or do a Playground Quest', 'explain the stop rule: stop and tell a grown-up if anything hurts, they feel dizzy, or they can\'t catch their breath']
    .map((q) => `<label class="opt"><input type="checkbox" name="sp"> ${q}</label>`).join('')}
  </fieldset>
  <p id="spWarn" class="warn" hidden>Please tick all four to carry on.</p></section>
  <button class="sign" data-act="safety">Continue ${icon('arrow', 26)}</button>`;

VIEWS.setup4 = () => profileForm('Your child\'s trail card', 'Grown-ups · step 3 of 3', null, 'makeProfile', 'Create trail card');

function profileForm(title, sub, p, act, cta) {
  p = p || { nick: '', band: 'cubs', bar: false, quiet: false, voice: true };
  return `<h1>${title}</h1><p class="sub">${sub}</p><section class="sheet">
  <label for="nick">Nickname (optional, stays on this device)</label>
  <input id="nick" maxlength="12" autocomplete="off" value="${esc(p.nick)}" placeholder="e.g. Rocket">
  <p class="small muted">Please use a nickname, not a full name.</p>
  <fieldset><legend>Age group</legend>
    <label class="opt"><input type="radio" name="band" value="cubs" ${p.band === 'cubs' ? 'checked' : ''}> Cubs: 6–8 years (2 rounds, read-aloud on)</label>
    <label class="opt"><input type="radio" name="band" value="explorers" ${p.band === 'explorers' ? 'checked' : ''}> Explorers: 9–11 years (3 rounds)</label>
  </fieldset>
  <fieldset><legend>Can they use a bar?</legend>
    <label class="opt"><input type="radio" name="bar" value="1" ${p.bar ? 'checked' : ''}> Yes: monkey bars nearby, or a secure pull-up bar at home</label>
    <label class="opt"><input type="radio" name="bar" value="0" ${!p.bar ? 'checked' : ''}> Not yet: use floor moves for Monkey</label>
  </fieldset>
  <fieldset><legend>Options</legend>
    <label class="opt"><input type="checkbox" id="quiet" ${p.quiet ? 'checked' : ''}> Quiet mode: no jumping (flats, late evenings)</label>
    <label class="opt"><input type="checkbox" id="voice" ${p.voice ? 'checked' : ''}> Read instructions out loud</label>
  </fieldset></section>
  <button class="sign" data-act="${act}">${cta} ${icon('arrow', 26)}</button>
  ${act === 'saveProfile' ? backBtn('grownups') : ''}`;
}

VIEWS.handover = () => {
  const p = me();
  return `<h1 class="center">Pass the phone to ${esc(nameOf(p))}!</h1>
  <div class="mapwrap">${forestMap(p, [], { label: 'Your map of The Lost Forest' })}</div>
  <section class="sheet center">
  <p class="big">Hi ${esc(nameOf(p))}! I'm your Campfire Cub. The Great Campfire in the middle of our forest is going out, and six animal friends need help.</p>
  <p class="big">Walk the trails, practise their moves, and watch the forest light up.</p></section>
  <button class="sign" data-act="go" data-v="home" data-say="Hi! I'm your Campfire Cub. Let's help the animals!">Let's go! ${icon('arrow', 26)}</button>`;
};

/* Home: the map is the screen */
VIEWS.home = () => {
  const p = me();
  const done = p.lastDone === today();
  const others = S.profiles.length > 1 ? `<div class="who" role="group" aria-label="Who's playing?">${S.profiles.map((x) => `<button class="chip ${x.id === p.id ? 'on' : ''}" data-act="switch" data-id="${x.id}" aria-pressed="${x.id === p.id}">${esc(nameOf(x))}</button>`).join('')}</div>` : '';
  const teach = CREATURE_IDS.some((id) => p.cr[id].lv >= 2);
  const ch = STORY[p.ch % STORY.length];
  const trail = done ? [] : paths(p)[0];
  return `${others}
  <h1>${done ? 'Trail done for today!' : 'Hi ' + esc(nameOf(p)) + '!'}</h1>
  <p class="sub">${done ? 'Your cub is resting by the fire. Muscles grow stronger while they rest.' : 'Chapter ' + (p.ch % STORY.length + 1) + ': ' + esc(ch.title)}</p>
  <div class="mapwrap">${forestMap(p, trail, { draw: !done, sleeping: done, label: done ? 'Your forest map. Your cub is asleep by the campfire.' : 'Your forest map. Today\'s trail visits ' + trail.map((id) => CREATURES[id].name).join(', ') })}</div>
  ${done ? `<button class="sign" data-act="go" data-v="wiggle">2-minute Wiggle Break ${icon('arrow', 26)}</button>`
    : `<button class="sign" data-act="go" data-v="questPick">Start trail ${icon('arrow', 26)}</button>`}
  <p class="status"><span><b>${p.logs}</b> ${p.logs === 1 ? 'log' : 'logs'} on the fire</span><span><b>${p.brave}</b> Brave ${p.brave === 1 ? 'Try' : 'Tries'}</span><span><b>${p.cubs || 0}</b> hidden cubs found</span></p>
  <nav class="fingerpost" aria-label="More to do">
    <button class="finger" data-act="go" data-v="codex">${icon('map', 26)}<span>Creatures</span></button>
    <button class="finger" data-act="go" data-v="park"><span>Playground Quest</span>${icon('slide', 26)}</button>
    <button class="finger" data-act="go" data-v="wiggle">${icon('wiggle', 26)}<span>Wiggle Break</span></button>
    <button class="finger ${teach ? '' : 'locked'}" data-act="go" data-v="teach"><span>Teach a Grown-Up${teach ? '' : '<small>Opens at Ranger</small>'}</span>${icon('whistle', 26)}</button>
    <button class="finger" data-act="go" data-v="story">${icon('book', 26)}<span>Story so far</span></button>
    <button class="finger" data-act="go" data-v="firsts"><span>My trail log</span>${icon('star', 26)}</button>
  </nav>`;
};

/* Quest: choose a fork */
VIEWS.questPick = () => {
  const p = me();
  const ch = STORY[p.ch % STORY.length];
  const ps = paths(p);
  return `<h1>${esc(ch.title)}</h1><p class="sub">Chapter ${p.ch % STORY.length + 1} of ${STORY.length}</p>
  <section class="sheet"><p class="big">${esc(ch.text)}</p>
    <button class="linkbtn" data-act="say" data-text="${esc(ch.title + '. ' + ch.text)}">${icon('speaker', 22)} Read it to me</button></section>
  <h2>Which way?</h2>
  <div class="forks">
  ${ps.map((list, i) => `<button class="fork ${i === 0 ? 'l' : ''}" data-act="startQuest" data-i="${i}" style="--c:${i === 0 ? '#7a4b2a' : '#6a3f22'}">
    <span><b>${esc(ch.paths[i])}</b><span class="discs">${list.map((id) => `<span>${art(id, p.cr[id].lv, 52)}${CREATURES[id].name}</span>`).join('')}</span></span></button>`).join('')}
  </div>
  <section class="sheet alert"><b>Stop rule:</b> if anything hurts, you feel dizzy, or you can't catch your breath, stop and tell a grown-up.</section>
  ${backBtn('home')}`;
};

/* Quest: the post you're standing at */
VIEWS.quest = () => {
  const p = me();
  const id = Q.list[Q.i];
  const cur = current(p, id);
  const L = cur.L;
  const say = moveText(p, L) + '. ' + (p.quiet && L.quiet ? '' : L.c) + ' ' + targetText(L, cur.t) + '.';
  return `${markers()}<p class="markers-label">Post ${Q.i + 1} of ${Q.list.length} · round ${Q.round} of ${rounds(p)}</p>
  <section class="post">
    <span class="crest">${art(id, p.cr[id].lv, 96)}</span>
    <p class="who-line">${CREATURES[id].name} · ${STAGES[p.cr[id].lv]} ${stars(p.cr[id].lv)}</p>
    ${cur.practice ? '<span class="pill">Practice version</span>' : ''}
    <h1>${esc(moveText(p, L))}</h1>
    ${p.quiet && L.quiet ? '' : `<p class="cue">${esc(L.c)}</p>`}
    <p class="target">${targetText(L, cur.t)}</p>
    ${L.u === 's' ? `<button class="sign" data-act="hold" data-t="${cur.t}" data-each="${L.each ? 1 : 0}">${icon('timer', 26)} Start the timer</button>`
      : `<button class="sign" data-act="roundDone">${icon('check', 28)} I did it!</button>`}
    <div class="tools"><button class="tool" data-act="say" data-text="${esc(say)}">${icon('speaker', 20)} Read it to me</button>
    ${!cur.practice && p.cr[id].lv < 4 ? `<button class="tool" data-act="brave">${icon('flag', 20)} Brave Try</button>` : ''}
    <button class="tool" data-act="report">${icon('skip', 20)} How did it go?</button></div>
  </section>`;
};

VIEWS.rest = () => `${markers()}<p class="markers-label">Rest stop</p>
  <section class="post"><span class="crest">${art(Q.list[Q.i], me().cr[Q.list[Q.i]].lv, 96)}</span>
  <h1>Rest</h1><p class="count" id="restCount">20</p>
  <p class="cue">Shake it out. Get a sip of water. Round ${Q.round} of ${rounds(me())} is next!</p>
  <button class="sign" data-act="restSkip">I'm ready! ${icon('arrow', 26)}</button></section>`;

VIEWS.report = () => {
  const id = Q.list[Q.i];
  return `${markers()}<section class="post"><span class="crest">${art(id, me().cr[id].lv, 96)}</span>
  <h1>How did ${CREATURES[id].name} go?</h1>
  <div class="answers">
    <button class="sign a1" data-act="result" data-r="all">I did all of it!</button>
    <button class="sign a2" data-act="result" data-r="some">I did some of it</button>
    <button class="sign a3" data-act="result" data-r="tricky">Too tricky today</button>
  </div></section>`;
};

VIEWS.feel = () => `<section class="sheet center"><h1>How do you feel?</h1>
  <div class="faces">
    <button class="face" data-act="feel" data-f="great">${faceSvg('great')}Great</button>
    <button class="face" data-act="feel" data-f="ok">${faceSvg('ok')}OK</button>
    <button class="face" data-act="feel" data-f="puffed">${faceSvg('puffed')}Puffed out</button>
  </div><button class="linkbtn" data-act="feel" data-f="">Skip</button></section>`;

VIEWS.brave = () => {
  const p = me();
  const id = Q.list[Q.i];
  const L = ladder(p, id)[p.cr[id].lv + 1];
  return `<section class="post"><span class="crest">${art(id, p.cr[id].lv + 1, 96)}</span>
  <p class="who-line">Brave Try · a ${STAGES[p.cr[id].lv + 1]} move</p>
  <h1>${esc(moveText(p, L))}</h1>${p.quiet && L.quiet ? '' : `<p class="cue">${esc(L.c)}</p>`}
  <p class="target">Try it once: ${targetText(L, L.r[0])}</p>
  <p class="cue">Just one try. It doesn't matter if it doesn't work yet. Trying is the brave bit.</p>
  <div class="answers"><button class="sign a1" data-act="braveDone" data-ok="1">I did it!</button>
  <button class="sign a3" data-act="braveDone" data-ok="0">Not yet</button></div></section>`;
};

VIEWS.questEnd = () => {
  const p = me();
  const ch = STORY[(p.ch - 1 + STORY.length) % STORY.length];
  const fact = pick(BODY_LAB[pick(Q.list)]);
  return `<h1>Trail complete!</h1><p class="sub">${esc(pick(HYPE.done))}</p>
  <div class="mapwrap">${forestMap(p, Q.list, { label: 'Your forest map with today\'s finished trail' })}</div>
  <section class="sheet"><p>Chapter ${(p.ch - 1) % STORY.length + 1} done. You chose <b>${esc(ch.paths[Q.path])}</b>.</p></section>
  <section class="sheet"><h2>Body Lab</h2><p class="big">${esc(fact)}</p></section>
  <button class="sign" data-act="go" data-v="home">Back to the campfire ${icon('arrow', 26)}</button>`;
};

/* Codex as the map legend */
VIEWS.codex = () => {
  const p = me();
  return `<h1>Creatures</h1><p class="sub">Practise moves to help them evolve: Cub, Scout, Ranger, Champion, Legend.</p>
  <section class="sheet"><ul class="legend">${CREATURE_IDS.map((id) => `<li><button data-act="go" data-v="creature" data-a="${id}">
    ${art(id, p.cr[id].lv, 64)}<span><b>${CREATURES[id].name}</b><span class="zone">${ZONES[id].name} · ${STAGES[p.cr[id].lv]}</span><br>${stars(p.cr[id].lv)}</span>
    <span class="go">${icon('arrow', 26)}</span></button></li>`).join('')}</ul></section>
  ${backBtn('home')}`;
};
VIEWS.creature = () => {
  const p = me(); const id = arg; const c = p.cr[id]; const cr = CREATURES[id]; const lad = ladder(p, id);
  return `<section class="sheet center">${art(id, c.lv, 128)}<h1>${cr.name}</h1>
  <p class="sub">${ZONES[id].name} · ${STAGES[c.lv]} ${stars(c.lv)}</p>
  <p>Builds ${cr.builds}.</p>
  ${c.practice ? '<p><b>On the practice version for now.</b> Do all of it once to get back to your level.</p>' : ''}</section>
  <section class="sheet"><h2>${cr.name}'s route</h2><ol class="route">${lad.map((L, i) => `<li class="${i < c.lv ? 'got' : i === c.lv ? 'now' : 'locked'}">
    <span class="stop">${i < c.lv ? icon('check', 20) : i === c.lv ? i + 1 : icon('lock', 18)}</span>
    <span><b>${STAGES[i]}: ${esc(moveText(p, L))}</b>${i < c.lv ? 'Done' : i === c.lv ? 'Now: ' + targetText(L, c.t) : targetText(L, L.r[0])}</span></li>`).join('')}</ol></section>
  ${backBtn('codex')}`;
};

/* Story so far */
VIEWS.story = () => {
  const p = me();
  const season = Math.floor(p.ch / STORY.length);
  const n = season ? STORY.length : Math.min(p.ch, STORY.length);
  return `<h1>The Lost Forest</h1><p class="sub">${season ? 'Season 1 finished! You\'re walking it again.' : n + ' of ' + STORY.length + ' chapters'}</p>
  <section class="sheet">${n === 0 ? '<p>Your story starts with your first trail.</p>' : `<ol class="route">${STORY.slice(0, n).map((s, i) => `<li class="got"><span class="stop">${i + 1}</span><span><b>${esc(s.title)}</b>${esc(s.text)}</span></li>`).join('')}</ol>`}</section>
  ${backBtn('home')}`;
};

/* Firsts as a trail log */
VIEWS.firsts = () => {
  const p = me();
  return `<h1>My trail log</h1><p class="sub">Every first time, kept forever on this device.</p>
  <div class="tally"><div><b>${p.logs}</b>Logs</div><div><b>${p.brave}</b>Brave Tries</div><div><b>${p.coach}</b>Times coaching</div></div>
  <section class="sheet">${p.firsts.length ? `<ul class="log">${p.firsts.slice().reverse().map((f) => `<li>${icon('star', 26)}<span><b>${esc(f.txt)}</b><span>${nice(f.d)}</span></span></li>`).join('')}</ul>` : '<p>Your firsts will appear here. Start a trail!</p>'}</section>
  ${backBtn('home')}`;
};

/* Wiggle */
VIEWS.wiggle = () => `<section class="post"><span class="crest">${art('cub', 2, 96)}</span><h1>Wiggle Break</h1>
  <p class="cue">4 moves, 30 seconds each. No scores, just fun.</p>
  <button class="sign" data-act="wiggleGo">Start wiggling ${icon('arrow', 26)}</button></section>${backBtn('home')}`;
VIEWS.wiggling = () => `<section class="post"><span class="crest">${art('cub', 2, 96)}</span><p class="who-line">Move ${arg.i + 1} of 4</p><h1>${esc(arg.list[arg.i])}</h1>
  <p class="count" id="wigCount">30</p><button class="tool" data-act="go" data-v="home">${icon('stop', 20)} Stop</button></section>`;

/* Teach a grown-up */
VIEWS.teach = () => {
  const p = me();
  const ok = CREATURE_IDS.filter((id) => p.cr[id].lv >= 2);
  if (!ok.length) return `<h1>Teach a Grown-Up</h1><section class="sheet"><p class="big">Get any creature to <b>Ranger</b> and you become the coach! You'll teach a grown-up a move and give them stars.</p></section>${backBtn('home')}`;
  return `<h1>Teach a Grown-Up</h1><p class="sub">You're the coach now. Pick a move to teach.</p>
  <section class="sheet"><ul class="legend">${ok.map((id) => `<li><button data-act="go" data-v="teach2" data-a="${id}">${art(id, p.cr[id].lv, 64)}<span><b>${CREATURES[id].name}</b><span class="zone">${esc(ladder(p, id)[0].n)}</span></span><span class="go">${icon('arrow', 26)}</span></button></li>`).join('')}</ul></section>
  ${backBtn('home')}`;
};
VIEWS.teach2 = () => {
  const p = me(); const L = ladder(p, arg)[0];
  return `<section class="post"><span class="crest">${art(arg, p.cr[arg].lv, 96)}</span><p class="who-line">Coach mode</p><h1>Teach: ${esc(moveText(p, L))}</h1>
  <ol class="cue steps" style="text-align:left"><li>Show your grown-up how to do it.</li><li>Tell them the tip: <i>${esc(L.c)}</i></li><li>Watch them do it 3 times.</li><li>Give them stars!</li></ol></section>
  <h2 class="center">How did your grown-up do?</h2>
  <div class="faces">${[1, 2, 3].map((n) => `<button class="face" data-act="coach" data-n="${n}">${starsSvg(n)}${['Keep practising', 'Pretty good', 'Super'][n - 1]}</button>`).join('')}</div>`;
};

/* Playground quest */
VIEWS.park = () => `<h1>Playground Quest</h1><p class="sub">Grown-ups check first</p>
  <section class="sheet"><fieldset><legend>Grown-up check</legend>
  ${['The equipment looks in good condition and the ground underneath is soft (bark, rubber or grass)', 'The equipment suits my child\'s size and age', 'I\'m staying close, especially near anything high']
    .map((q) => `<label class="opt"><input type="checkbox" name="pk"> ${q}</label>`).join('')}</fieldset>
  <fieldset><legend>What's at your park?</legend>
  ${KIT.map((k) => `<label class="opt"><input type="checkbox" name="kit" value="${k.id}"> ${k.n}</label>`).join('')}</fieldset>
  <p id="pkWarn" class="warn" hidden>Please tick all three grown-up checks and at least one thing at the park.</p></section>
  <button class="sign" data-act="parkGo">Make my quest ${icon('arrow', 26)}</button>
  ${backBtn('home')}`;
VIEWS.parkQuest = () => `<h1>Your Playground Quest</h1><p class="sub">Tick each one when you've done it</p>
  <section class="sheet"><ol class="route">${arg.map((m, i) => `<li><span class="stop">${i + 1}</span><label class="opt" style="flex:1"><input type="checkbox" name="pq" value="${i}"> ${esc(m)}</label></li>`).join('')}</ol></section>
  <section class="sheet alert"><b>Stop rule:</b> if anything hurts, you feel dizzy, or you can't catch your breath, stop and tell a grown-up.</section>
  <button class="sign" data-act="parkDone">Quest done! ${icon('arrow', 26)}</button>`;

/* Grown-ups area (gated) */
VIEWS.grownups = () => `<h1>Grown-ups</h1>
  <section class="sheet"><h2>Children</h2>
  ${S.profiles.map((x) => `<div class="prof"><div><b>${esc(nameOf(x))}</b><br><span class="small muted">${x.band === 'explorers' ? 'Explorers 9–11' : 'Cubs 6–8'} · ${x.bar ? 'Bar' : 'No bar'}${x.quiet ? ' · Quiet' : ''} · ${x.logs} trails</span></div>
    <div class="tools"><button class="tool" data-act="go" data-v="editProfile" data-a="${x.id}">Edit</button><button class="tool" data-act="go" data-v="levels" data-a="${x.id}">Levels</button><button class="tool" data-act="delProfile" data-id="${x.id}">Remove</button></div></div>`).join('')}
  <p style="margin-top:14px"><button class="plank" data-act="go" data-v="addProfile">Add another child</button></p></section>
  <section class="sheet"><h2>How HypeCubs works</h2>
  <ul><li>3 trails a week, 10–15 minutes. Only one trail a day, so muscles get rest.</li>
  <li>Each creature has 5 levels. When your child does every round, the target goes up a little. At the top of a level, the creature evolves.</li>
  <li>Two "too tricky" reports in a row switches to an easier practice version. Levels never go down on screen.</li>
  <li>No weights, no maximum tests, and no talk about weight or body shape. Ever.</li>
  <li>Aged 11+? HypeReps (our app for teens and adults) is the next step, with a grown-up's OK.</li></ul></section>
  <section class="sheet"><h2>Your data</h2>
  <p>Everything is stored on this device only. We can't see it.</p>
  <div class="row"><button class="plank" data-act="export">Export backup</button><label class="plank filebtn">Import backup<input type="file" id="importFile" accept="application/json"></label>
  <button class="plank danger" data-act="wipe">Delete all data</button></div></section>
  <p><a href="privacy.html">Privacy</a> · <a href="privacy.html#kids">Privacy for kids</a> · <a href="terms.html">Terms</a> · <a href="index.html">About HypeCubs</a></p>
  <button class="plank ghost" data-act="go" data-v="home">${icon('back', 20)} Done</button>`;
VIEWS.editProfile = () => profileForm('Edit trail card', 'Grown-ups', S.profiles.find((x) => x.id === arg), 'saveProfile', 'Save');
VIEWS.addProfile = () => profileForm('New trail card', 'Grown-ups', null, 'makeProfile', 'Create trail card');
VIEWS.levels = () => {
  const p = S.profiles.find((x) => x.id === arg);
  return `<h1>Starting levels</h1><p class="sub">${esc(nameOf(p))}</p><section class="sheet"><p class="muted">If a level is clearly too easy, move it up. Changing a level resets that creature's target to the level's start.</p>
  ${CREATURE_IDS.map((id) => `<label for="lv_${id}">${CREATURES[id].name}</label><select id="lv_${id}" data-id="${id}">
    ${ladder(p, id).map((L, i) => `<option value="${i}" ${p.cr[id].lv === i ? 'selected' : ''}>${STAGES[i]}: ${esc(L.n)}</option>`).join('')}</select>`).join('')}</section>
  <button class="sign" data-act="saveLevels">Save levels ${icon('arrow', 26)}</button> ${backBtn('grownups')}`;
};

/* ---------- Gate ---------- */
function gate(then) {
  const a = 11 + Math.floor(Math.random() * 9), b = 3 + Math.floor(Math.random() * 6);
  $modal.innerHTML = `<div class="box"><h2 id="modalTitle">Grown-ups only</h2><p>What is ${a} × ${b}?</p>
    <input id="gateIn" inputmode="numeric" autocomplete="off" aria-label="Answer">
    <p id="gateMsg" class="warn" hidden>Not quite. Ask a grown-up!</p>
    <div class="row c"><button class="plank" id="gateOk">Enter</button><button class="plank ghost" id="gateNo">Cancel</button></div></div>`;
  $modal.hidden = false;
  const inp = document.getElementById('gateIn'); inp.focus();
  const ok = () => { if (+inp.value === a * b) { $modal.hidden = true; then(); } else { document.getElementById('gateMsg').hidden = false; inp.value = ''; inp.focus(); } };
  document.getElementById('gateOk').onclick = ok;
  inp.onkeydown = (e) => { if (e.key === 'Enter') ok(); };
  document.getElementById('gateNo').onclick = () => { $modal.hidden = true; };
}
function modal(html) {
  $modal.innerHTML = '<div class="box">' + html + '<p><button class="sign" id="mClose">OK!</button></p></div>';
  $modal.hidden = false;
  const b = document.getElementById('mClose'); b.focus(); b.onclick = () => { $modal.hidden = true; };
}

function askConfirm(msg, yes, then) {
  $modal.innerHTML = '<div class="box"><h2 id="modalTitle">Are you sure?</h2><p>' + esc(msg) + '</p><div class="row c"><button class="plank danger" id="cYes">' + esc(yes) + '</button><button class="plank ghost" id="cNo">Cancel</button></div></div>';
  $modal.hidden = false;
  document.getElementById('cNo').focus();
  document.getElementById('cNo').onclick = () => { $modal.hidden = true; };
  document.getElementById('cYes').onclick = () => { $modal.hidden = true; then(); };
}

/* ---------- Timers ---------- */
function stopTimer() { if (T) { clearInterval(T); T = null; } }
function countdown(el, secs, onDone, onTick) {
  stopTimer();
  let n = secs; if (el) el.textContent = n;
  T = setInterval(() => {
    n -= 1;
    if (el && document.body.contains(el)) el.textContent = n;
    if (onTick) onTick(n);
    if (n <= 0) { stopTimer(); onDone(); }
  }, 1000);
}
function holdTimer(secs, each) {
  const sides = each ? ['First side', 'Other side'] : [''];
  let s = 0;
  const run = () => {
    const id = Q.list[Q.i];
    $main.innerHTML = markers() + `<p class="markers-label">${sides[s] || 'Hold it!'}</p><section class="post"><span class="crest">${art(id, me().cr[id].lv, 96)}</span>
      <h1 id="hcMsg">Get ready…</h1><p class="count" id="hc" aria-live="off">3</p><button class="tool" data-act="holdStop">${icon('stop', 20)} Stop</button></section>`;
    speak(sides[s] ? sides[s] + '. Get ready.' : 'Get ready.');
    const el = document.getElementById('hc');
    countdown(el, 3, () => {
      beep(880, 250);
      document.getElementById('hcMsg').textContent = 'Hold it! You\'ve got this.';
      countdown(el, secs, () => {
        beep(1046, 400);
        s += 1;
        if (s < sides.length) run(); else roundDone();
      }, (n) => { if (n <= 3 && n > 0) beep(520, 120); });
    }, () => beep(440, 100));
  };
  run();
}

/* ---------- Quest flow ---------- */
function roundDone() {
  const p = me();
  if (Q.round < rounds(p)) {
    Q.round += 1; view = 'rest'; render();
    speak('Great. Rest time.');
    countdown(document.getElementById('restCount'), 20, () => { beep(880, 200); view = 'quest'; render(); speak('Round ' + Q.round + '. Go!'); });
  } else { view = 'report'; render(); }
}
function nextCreature() {
  Q.i += 1; Q.round = 1;
  if (Q.i >= Q.list.length) return finishQuest();
  view = 'quest'; render(); window.scrollTo(0, 0);
}
function finishQuest() {
  const p = me();
  p.logs += 1; p.ch += 1; p.lastDone = today();
  p.sessions.push({ d: today(), path: Q.path, items: Q.items });
  if (p.logs === 1) first(p, 'Your very first trail!');
  if (p.ch === STORY.length) first(p, 'Finished Season 1 of The Lost Forest!');
  [10, 25, 50, 100].forEach((n) => { if (p.logs === n) first(p, n + ' trails walked!'); });
  save(); view = 'questEnd'; render(); confetti();
}

/* ---------- Events ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act], .nav');
  if (!t) return;
  if (t.classList.contains('nav')) {
    if (t.dataset.view === 'grownups') return gate(() => go('grownups'));
    return go(t.dataset.view);
  }
  const act = t.dataset.act;
  const p = me();
  switch (act) {
    case 'go': if (t.dataset.say) speak(t.dataset.say); go(t.dataset.v, t.dataset.a); break;
    case 'say': speak(t.dataset.text); if (!p || !p.voice) speakAnyway(t.dataset.text); break;
    case 'health': {
      const any = [...document.querySelectorAll('input[name=hc]')].some((x) => x.checked);
      if (any && !t.dataset.ack) {
        document.getElementById('hcWarn').innerHTML = '<div class="sheet alert"><b>Please check with your child\'s GP before starting.</b> Once they say it\'s OK, you can carry on.</div>';
        t.textContent = 'Our GP says it\'s OK, continue'; t.dataset.ack = '1'; return;
      }
      go('setup3'); break;
    }
    case 'safety': {
      const all = [...document.querySelectorAll('input[name=sp]')].every((x) => x.checked);
      if (!all) { document.getElementById('spWarn').hidden = false; return; }
      go('setup4'); break;
    }
    case 'makeProfile': {
      const np = newProfile(readForm());
      S.profiles.push(np); S.active = np.id; S.setup = true; save(); go('handover'); break;
    }
    case 'saveProfile': {
      const f = readForm();
      const x = S.profiles.find((y) => y.id === arg);
      if (x) {
        const barChanged = x.bar !== f.bar;
        Object.assign(x, f);
        if (barChanged) { const c = x.cr.monkey; c.t = ladder(x, 'monkey')[c.lv].r[0]; }
        save();
      }
      go('grownups'); break;
    }
    case 'switch': S.active = t.dataset.id; save(); render(); break;
    case 'foundCub': {
      p.cubs = (p.cubs || 0) + 1; p.cubDay = today();
      if (p.cubs === 1) first(p, 'Spotted your first hidden Cub!');
      save(); t.remove(); const m = 'You found the hidden Cub! Sharp eyes.'; hype(m); speak(m); beep(1046, 300); break;
    }
    case 'startQuest': {
      const i = +t.dataset.i;
      Q = { path: i, list: paths(p)[i], i: 0, round: 1, items: [] };
      go('quest');
      const cur = current(p, Q.list[0]);
      speak(moveText(p, cur.L) + '. ' + targetText(cur.L, cur.t));
      break;
    }
    case 'hold': holdTimer(+t.dataset.t, t.dataset.each === '1'); break;
    case 'holdStop': stopTimer(); view = 'quest'; render(); break;
    case 'roundDone': beep(880, 150); roundDone(); break;
    case 'restSkip': stopTimer(); view = 'quest'; render(); speak('Round ' + Q.round + '. Go!'); break;
    case 'report': stopTimer(); view = 'report'; render(); break;
    case 'result': {
      const id = Q.list[Q.i];
      const r = t.dataset.r;
      const out = progress(p, id, r);
      Q.items.push({ id, lv: p.cr[id].lv, res: r });
      save();
      if (out.evolve) {
        confetti(); beep(1046, 500);
        modal(`${art(id, p.cr[id].lv, 140)}<h2 id="modalTitle">Your ${CREATURES[id].name} ${esc(pick(HYPE.evolve))}</h2><p>New stage: <b>${STAGES[p.cr[id].lv]}</b></p>`);
        speak('Wow! Your ' + CREATURES[id].name + ' evolved into a ' + STAGES[p.cr[id].lv] + '!');
      } else {
        const msg = pick(HYPE[r]);
        hype(msg); speak(msg);
        if (out.practiceOn) setTimeout(() => hype('Next time ' + CREATURES[id].name + ' will use a practice version. You\'ll level back up!'), 3800);
      }
      view = 'feel'; render(); break;
    }
    case 'feel': if (t.dataset.f && Q.items.length) Q.items[Q.items.length - 1].feel = t.dataset.f; nextCreature(); break;
    case 'brave': stopTimer(); view = 'brave'; render(); break;
    case 'braveDone': {
      p.brave += 1;
      if (p.brave === 1) first(p, 'Your first Brave Try!');
      if (t.dataset.ok === '1') first(p, 'Did a ' + STAGES[p.cr[Q.list[Q.i]].lv + 1] + ' ' + CREATURES[Q.list[Q.i]].name + ' move on a Brave Try!');
      save(); const m = pick(HYPE.brave); hype(m); speak(m);
      view = 'quest'; render(); break;
    }
    case 'wiggleGo': {
      const list = WIGGLES.slice().sort(() => Math.random() - 0.5).slice(0, 4).map((w) => (p.quiet && w.quiet ? w.quiet : w.n));
      wiggleStep({ list, i: 0 }); break;
    }
    case 'coach': {
      p.coach += 1; if (p.coach === 1) first(p, 'Coached a grown-up for the first time!');
      save(); const m = 'Coach ' + nameOf(p) + '! Teaching a move helps you remember it too.'; hype(m); speak(m); go('home'); break;
    }
    case 'parkGo': {
      const checks = [...document.querySelectorAll('input[name=pk]')].every((x) => x.checked);
      const kit = [...document.querySelectorAll('input[name=kit]:checked')].map((x) => x.value);
      if (!checks || !kit.length) { document.getElementById('pkWarn').hidden = false; return; }
      let moves = [];
      kit.forEach((k) => {
        let opts = PARK_MOVES[k].slice();
        if (p.quiet) opts = opts.filter((m) => !/hop|jump|bound/i.test(m)).concat(opts.length ? [] : []);
        if (opts.length) moves.push(pick(opts));
      });
      while (moves.length < 4 && kit.includes('grass')) { const m = pick(PARK_MOVES.grass); if (!moves.includes(m)) moves.push(m); else break; }
      go('parkQuest', moves.slice(0, 5)); break;
    }
    case 'parkDone': {
      p.logs += 1; p.lastDone = today();
      if (!p.firsts.some((f) => /Playground/.test(f.txt))) first(p, 'Your first Playground Quest!');
      save(); confetti(); const m = 'Playground Quest done! Another log on the fire.'; hype(m); speak(m); go('home'); break;
    }
    case 'delProfile': {
      const x = S.profiles.find((y) => y.id === t.dataset.id);
      askConfirm('Remove ' + nameOf(x) + '\'s profile and all their progress? This can\'t be undone.', 'Remove', () => {
        S.profiles = S.profiles.filter((y) => y.id !== x.id);
        if (!S.profiles.length) { S = blank(); save(); return go('setup1'); }
        S.active = S.profiles[0].id; save(); render();
      }); break;
    }
    case 'saveLevels': {
      const x = S.profiles.find((y) => y.id === arg);
      document.querySelectorAll('select[data-id]').forEach((sel) => {
        const id = sel.dataset.id, lv = +sel.value;
        if (x.cr[id].lv !== lv) { x.cr[id].lv = lv; x.cr[id].t = ladder(x, id)[lv].r[0]; x.cr[id].practice = false; x.cr[id].tricky = 0; }
      });
      save(); go('grownups'); break;
    }
    case 'export': {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'hypecubs-backup-' + today() + '.json';
      document.body.appendChild(a); a.click(); a.remove(); break;
    }
    case 'wipe': {
      askConfirm('Delete ALL HypeCubs data on this device, for every child? This can\'t be undone.', 'Delete everything', () => {
        try { localStorage.removeItem(KEY); } catch (err) {}
        S = blank(); go('setup1');
      }); break;
    }
  }
});
document.addEventListener('change', (e) => {
  if (e.target.id !== 'importFile' || !e.target.files[0]) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || d.v !== 1 || !Array.isArray(d.profiles)) throw new Error('bad');
      S = d; save(); go('home'); modal('<h2 id="modalTitle">Backup imported</h2>');
    } catch (err) { modal('<h2 id="modalTitle">That file doesn\'t look like a HypeCubs backup.</h2>'); }
  };
  r.readAsText(e.target.files[0]);
});
function speakAnyway(txt) {
  if (!('speechSynthesis' in window)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = 'en-GB'; speechSynthesis.speak(u); } catch (e) {}
}
function readForm() {
  const v = (n) => (document.querySelector('input[name=' + n + ']:checked') || {}).value;
  return {
    nick: (document.getElementById('nick').value || '').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 12),
    band: v('band') || 'cubs', bar: v('bar') === '1',
    quiet: document.getElementById('quiet').checked, voice: document.getElementById('voice').checked
  };
}
function wiggleStep(st) {
  view = 'wiggling'; arg = st; render(); speak(st.list[st.i]);
  countdown(document.getElementById('wigCount'), 30, () => {
    beep(880, 200);
    if (st.i < st.list.length - 1) { st.i += 1; wiggleStep(st); }
    else { const m = 'Wiggle Break done! That got your heart pumping.'; hype(m); speak(m); go('home'); }
  }, (n) => { if (n <= 3 && n > 0) beep(520, 100); });
}

/* Keep timers honest if the screen is left */
window.addEventListener('beforeunload', () => { try { speechSynthesis.cancel(); } catch (e) {} });

render();
