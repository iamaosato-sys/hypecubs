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

/* ---------- Art (original SVG) ---------- */
function art(id, stage, size) {
  size = size || 96;
  const col = STAGE_COLOURS[stage || 0];
  const c = CREATURES[id] ? CREATURES[id].colour : '#ff8a3d';
  const eyes = '<circle cx="40" cy="48" r="4" fill="#1b1b2b"/><circle cx="60" cy="48" r="4" fill="#1b1b2b"/><circle cx="41.5" cy="46.5" r="1.3" fill="#fff"/><circle cx="61.5" cy="46.5" r="1.3" fill="#fff"/>';
  const smile = '<path d="M43 62 q7 6 14 0" stroke="#1b1b2b" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  let body = '';
  switch (id) {
    case 'bear': body = '<circle cx="30" cy="30" r="10" fill="' + c + '"/><circle cx="70" cy="30" r="10" fill="' + c + '"/><circle cx="50" cy="52" r="26" fill="' + c + '"/><ellipse cx="50" cy="60" rx="12" ry="9" fill="#e7c49a"/><circle cx="50" cy="56" r="3.5" fill="#1b1b2b"/>' + eyes + smile; break;
    case 'gorilla': body = '<circle cx="50" cy="52" r="27" fill="' + c + '"/><ellipse cx="50" cy="56" rx="18" ry="16" fill="#a9aab3"/><rect x="33" y="40" width="34" height="6" rx="3" fill="#3c404b"/>' + eyes + '<ellipse cx="46" cy="58" rx="2" ry="1.5" fill="#1b1b2b"/><ellipse cx="54" cy="58" rx="2" ry="1.5" fill="#1b1b2b"/>' + smile; break;
    case 'kangaroo': body = '<ellipse cx="38" cy="22" rx="6" ry="15" fill="' + c + '"/><ellipse cx="62" cy="22" rx="6" ry="15" fill="' + c + '"/><ellipse cx="50" cy="52" rx="23" ry="26" fill="' + c + '"/><ellipse cx="50" cy="64" rx="13" ry="10" fill="#f2c79d"/><circle cx="50" cy="59" r="3" fill="#1b1b2b"/>' + eyes + smile; break;
    case 'crab': body = '<circle cx="18" cy="40" r="10" fill="' + c + '"/><circle cx="82" cy="40" r="10" fill="' + c + '"/><ellipse cx="50" cy="60" rx="30" ry="20" fill="' + c + '"/><line x1="40" y1="44" x2="38" y2="32" stroke="' + c + '" stroke-width="4"/><line x1="60" y1="44" x2="62" y2="32" stroke="' + c + '" stroke-width="4"/><circle cx="38" cy="30" r="6" fill="#fff"/><circle cx="62" cy="30" r="6" fill="#fff"/><circle cx="38" cy="30" r="3" fill="#1b1b2b"/><circle cx="62" cy="30" r="3" fill="#1b1b2b"/><path d="M42 64 q8 6 16 0" stroke="#1b1b2b" stroke-width="2.5" fill="none" stroke-linecap="round"/>'; break;
    case 'flamingo': body = '<circle cx="50" cy="48" r="24" fill="' + c + '"/><path d="M62 52 q18 2 16 16 q-6 -4 -14 -6 z" fill="#ffd36b"/><path d="M73 62 q4 6 4 8 q-5 -2 -9 -4z" fill="#1b1b2b"/><circle cx="44" cy="44" r="4" fill="#1b1b2b"/><circle cx="45.5" cy="42.5" r="1.3" fill="#fff"/><ellipse cx="36" cy="56" rx="5" ry="3" fill="#ff4f97" opacity=".6"/>'; break;
    case 'monkey': body = '<circle cx="24" cy="50" r="10" fill="' + c + '"/><circle cx="76" cy="50" r="10" fill="' + c + '"/><circle cx="24" cy="50" r="5" fill="#e8b98a"/><circle cx="76" cy="50" r="5" fill="#e8b98a"/><circle cx="50" cy="50" r="26" fill="' + c + '"/><path d="M30 52 q0 -16 20 -12 q20 -4 20 12 q0 18 -20 18 q-20 0 -20 -18z" fill="#e8b98a"/>' + eyes + smile; break;
    default: body = '<path d="M30 30 L36 14 L44 28 Z" fill="' + c + '"/><path d="M70 30 L64 14 L56 28 Z" fill="' + c + '"/><circle cx="50" cy="52" r="26" fill="' + c + '"/><ellipse cx="50" cy="62" rx="14" ry="10" fill="#fff1dd"/><circle cx="50" cy="57" r="3.5" fill="#1b1b2b"/>' + eyes + smile;
  }
  const crown = stage >= 4 ? '<path d="M36 22 l5 -10 l9 8 l9 -8 l5 10 z" fill="#ffc93c" stroke="#b8860b" stroke-width="1.5"/>' : '';
  return '<svg class="art" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">' +
    '<circle cx="50" cy="50" r="47" fill="#1d2440" stroke="' + col + '" stroke-width="5"/>' + body + crown + '</svg>';
}
function stars(stage) {
  let s = '<span class="stars" aria-label="' + STAGES[stage] + ', stage ' + (stage + 1) + ' of 5">';
  for (let i = 0; i < 5; i++) s += '<i class="' + (i <= stage ? 'on' : '') + '"></i>';
  return s + '</span>';
}
function campfire(logs, sleeping) {
  const lvl = logs >= 40 ? 5 : logs >= 25 ? 4 : logs >= 15 ? 3 : logs >= 8 ? 2 : logs >= 3 ? 1 : 0;
  const h = 26 + lvl * 9;
  const logsSvg = '<rect x="28" y="96" width="64" height="10" rx="5" fill="#7a4a2a" transform="rotate(-12 60 101)"/><rect x="28" y="96" width="64" height="10" rx="5" fill="#8f5a33" transform="rotate(12 60 101)"/>';
  const flame = '<path class="flame" d="M60 ' + (96 - h) + ' C ' + (76 + lvl) + ' ' + (96 - h * 0.55) + ', 78 92, 60 96 C 42 92, ' + (44 - lvl) + ' ' + (96 - h * 0.55) + ', 60 ' + (96 - h) + ' Z" fill="#ff8a3d"/>' +
    '<path class="flame2" d="M60 ' + (96 - h * 0.62) + ' C 70 ' + (96 - h * 0.35) + ', 70 92, 60 95 C 50 92, 50 ' + (96 - h * 0.35) + ', 60 ' + (96 - h * 0.62) + ' Z" fill="#ffd36b"/>';
  const cubX = 118;
  const cub = '<g transform="translate(' + cubX + ',58) scale(.5)">' +
    '<path d="M30 30 L36 14 L44 28 Z" fill="#ff8a3d"/><path d="M70 30 L64 14 L56 28 Z" fill="#ff8a3d"/><circle cx="50" cy="52" r="26" fill="#ff8a3d"/><ellipse cx="50" cy="62" rx="14" ry="10" fill="#fff1dd"/><circle cx="50" cy="57" r="3.5" fill="#1b1b2b"/>' +
    (sleeping ? '<path d="M36 48 q4 3 8 0 M56 48 q4 3 8 0" stroke="#1b1b2b" stroke-width="2.5" fill="none" stroke-linecap="round"/>' :
      '<circle cx="40" cy="48" r="4" fill="#1b1b2b"/><circle cx="60" cy="48" r="4" fill="#1b1b2b"/><path d="M43 64 q7 6 14 0" stroke="#1b1b2b" stroke-width="2.5" fill="none" stroke-linecap="round"/>') + '</g>' +
    (sleeping ? '<text x="160" y="58" fill="#cfd6ff" font-size="12" font-weight="700">z z</text>' : '');
  return '<svg class="fire" viewBox="0 0 180 120" role="img" aria-label="Campfire with ' + logs + ' logs. ' + (sleeping ? 'Your cub is resting.' : 'Your cub is ready.') + '">' +
    '<ellipse cx="60" cy="108" rx="54" ry="8" fill="#0c1022"/>' + (logs > 0 ? flame : '<circle cx="60" cy="92" r="4" fill="#ff8a3d"/><circle cx="52" cy="95" r="2.5" fill="#ffd36b"/>') + logsSvg + cub + '</svg>';
}

/* ---------- Navigation ---------- */
let view = 'home', arg = null, Q = null, T = null;
function go(v, a) { view = v; arg = a; stopTimer(); render(); window.scrollTo(0, 0); $main.focus({ preventScroll: true }); }
function render() {
  if (!S.setup || !S.profiles.length) { if (!view.startsWith('setup')) view = 'setup1'; }
  const fn = VIEWS[view] || VIEWS.home;
  $main.innerHTML = fn();
  document.querySelectorAll('.nav').forEach((b) => b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false'));
  document.querySelector('.top nav').hidden = !S.setup || ['quest', 'rest', 'report', 'feel', 'brave', 'wiggling', 'handover'].includes(view);
}

/* ---------- Views ---------- */
const VIEWS = {};

/* Setup: grown-up first, then hand over */
VIEWS.setup1 = () => `
  <section class="card hero"><p class="kicker">For grown-ups</p>
  <h1>Welcome to HypeCubs</h1>
  <p>Short movement quests for children aged 6–11. Your child collects six animal creatures and levels them up by practising real skills: crawling, hanging, jumping, balancing and pushing.</p>
  <ul class="ticks"><li>About 10–15 minutes, 3 times a week</li><li>No equipment needed (a bar or monkey bars is a bonus)</li><li>No account, no ads, no in-app purchases</li><li>Nothing leaves this device</li></ul>
  <p>Setting up takes about 2 minutes.</p>
  <button class="btn big" data-act="go" data-v="setup2">Start setup</button></section>`;

VIEWS.setup2 = () => `
  <section class="card"><p class="kicker">Grown-ups · Step 1 of 3</p><h1>Quick health check</h1>
  <p>Tick any that apply to your child. Your answers are <b>not saved</b> anywhere.</p>
  <fieldset><legend>Does your child…</legend>
  ${['have a heart condition, or has a doctor said they should only do certain activity?', 'get chest pain, faint or get very breathless when active?', 'have asthma that isn\'t well controlled?', 'have a current injury, or bone or joint problem?', 'have any other condition that affects exercise?']
    .map((q, i) => `<label class="opt"><input type="checkbox" name="hc" value="${i}"> ${q}</label>`).join('')}
  </fieldset>
  <div id="hcWarn"></div>
  <button class="btn big" data-act="health">Continue</button></section>`;

VIEWS.setup3 = () => `
  <section class="card"><p class="kicker">Grown-ups · Step 2 of 3</p><h1>Safety promises</h1>
  <p>HypeCubs moves are gentle bodyweight play, but children move best with a grown-up nearby. Please tick each one.</p>
  <fieldset><legend>I will…</legend>
  ${['make sure there is clear space, with nothing to bump into', 'have my child wear trainers or go barefoot (no socks on hard floors)', 'stay close when they hang from a bar or do a Playground Quest', 'explain the stop rule: stop and tell a grown-up if anything hurts, they feel dizzy, or they can\'t catch their breath']
    .map((q) => `<label class="opt"><input type="checkbox" name="sp"> ${q}</label>`).join('')}
  </fieldset>
  <p id="spWarn" class="warn" hidden>Please tick all four to carry on.</p>
  <button class="btn big" data-act="safety">Continue</button></section>`;

VIEWS.setup4 = () => profileForm('Grown-ups · Step 3 of 3', 'Your child\'s profile', null);

function profileForm(kicker, title, p) {
  p = p || { nick: '', band: 'cubs', bar: false, quiet: false, voice: true };
  return `<section class="card"><p class="kicker">${kicker}</p><h1>${title}</h1>
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
  </fieldset>
  <button class="btn big" data-act="${title.startsWith('Your') ? 'makeProfile' : 'saveProfile'}">${title.startsWith('Your') ? 'Create profile' : 'Save'}</button></section>`;
}

VIEWS.handover = () => {
  const p = me();
  return `<section class="card hero center">${art('cub', 0, 140)}
  <h1>Pass the phone to ${esc(nameOf(p))}!</h1>
  <p class="big">Hi ${esc(nameOf(p))}! I'm your Campfire Cub. The Great Campfire in our forest is going out, and the animals need help.</p>
  <p class="big">Do quests, practise moves, and help six animal friends grow stronger. Ready?</p>
  <button class="btn big" data-act="go" data-v="home" data-say="Hi! I'm your Campfire Cub. Let's help the animals!">Let's go!</button></section>`;
};

/* Home */
VIEWS.home = () => {
  const p = me();
  const done = p.lastDone === today();
  const others = S.profiles.length > 1 ? `<div class="who"><span class="small muted">Playing:</span> ${S.profiles.map((x) => `<button class="chip ${x.id === p.id ? 'on' : ''}" data-act="switch" data-id="${x.id}">${esc(nameOf(x))}</button>`).join('')}</div>` : '';
  const teachUnlocked = CREATURE_IDS.some((id) => p.cr[id].lv >= 2);
  const ch = STORY[p.ch % STORY.length];
  return `${others}
  <section class="card hero center">
    ${campfire(p.logs, done)}
    <h1>${done ? 'Quest done today!' : 'Hi ' + esc(nameOf(p)) + '!'}</h1>
    ${done ? `<p>Your cub is resting by the fire. Muscles grow stronger while they rest, so come back tomorrow. Want to wiggle?</p>
      <button class="btn big ghost" data-act="go" data-v="wiggle">2-minute Wiggle Break</button>`
    : `<p>Chapter ${p.ch % STORY.length + 1}: <b>${esc(ch.title)}</b></p>
      <button class="btn big" data-act="go" data-v="questPick">Start today's quest</button>`}
    <p class="small muted">${p.logs} ${p.logs === 1 ? 'log' : 'logs'} on the fire · ${p.brave} Brave ${p.brave === 1 ? 'Try' : 'Tries'}</p>
  </section>
  <div class="tiles">
    <button class="tile" data-act="go" data-v="codex"><span class="ti">${art('bear', Math.max(...CREATURE_IDS.map((id) => p.cr[id].lv)), 48)}</span>Creature Codex</button>
    <button class="tile" data-act="go" data-v="park"><span class="ti">🛝</span>Playground Quest</button>
    <button class="tile" data-act="go" data-v="wiggle"><span class="ti">🕺</span>Wiggle Break</button>
    <button class="tile ${teachUnlocked ? '' : 'locked'}" data-act="go" data-v="teach"><span class="ti">🧑‍🏫</span>Teach a Grown-Up${teachUnlocked ? '' : '<small>Unlocks at Ranger</small>'}</button>
    <button class="tile" data-act="go" data-v="story"><span class="ti">📖</span>Story so far</button>
    <button class="tile" data-act="go" data-v="firsts"><span class="ti">⭐</span>My Firsts</button>
  </div>`;
};

/* Quest: choose a path */
VIEWS.questPick = () => {
  const p = me();
  const ch = STORY[p.ch % STORY.length];
  const ps = paths(p);
  return `<section class="card story"><p class="kicker">Chapter ${p.ch % STORY.length + 1}</p><h1>${esc(ch.title)}</h1>
    <p class="big">${esc(ch.text)}</p>
    <button class="linkbtn" data-act="say" data-text="${esc(ch.title + '. ' + ch.text)}">🔊 Read it to me</button></section>
  <h2>Which way?</h2>
  ${ps.map((list, i) => `<button class="pathcard" data-act="startQuest" data-i="${i}">
    <b>${esc(ch.paths[i])}</b>
    <span class="row3">${list.map((id) => `<span>${art(id, p.cr[id].lv, 56)}<small>${CREATURES[id].name}</small></span>`).join('')}</span></button>`).join('')}
  <div class="card stop"><b>Stop rule:</b> if anything hurts, you feel dizzy, or you can't catch your breath, stop and tell a grown-up.</div>
  <button class="btn ghost" data-act="go" data-v="home">Back</button>`;
};

/* Quest: mission card */
VIEWS.quest = () => {
  const p = me();
  const id = Q.list[Q.i];
  const cr = CREATURES[id];
  const cur = current(p, id);
  const L = cur.L;
  const say = moveText(p, L) + '. ' + (p.quiet && L.quiet ? '' : L.c) + ' ' + targetText(L, cur.t) + '.';
  return `<p class="progress-dots" aria-label="Creature ${Q.i + 1} of ${Q.list.length}">${Q.list.map((x, i) => `<i class="${i < Q.i ? 'done' : i === Q.i ? 'now' : ''}"></i>`).join('')}</p>
  <section class="card mission center">
    ${art(id, p.cr[id].lv, 120)}
    <p class="kicker">${cr.name} · ${STAGES[p.cr[id].lv]} ${stars(p.cr[id].lv)}</p>
    ${cur.practice ? '<p class="pill">Practice version</p>' : ''}
    <h1>${esc(moveText(p, L))}</h1>
    ${p.quiet && L.quiet ? '' : `<p class="cue">${esc(L.c)}</p>`}
    <p class="target">${targetText(L, cur.t)}</p>
    <p class="round">Round ${Q.round} of ${rounds(p)}</p>
    ${L.u === 's' ? `<button class="btn big" data-act="hold" data-t="${cur.t}" data-each="${L.each ? 1 : 0}">Start the timer</button>`
      : `<button class="btn big" data-act="roundDone">I did it!</button>`}
    <div class="tools"><button data-act="say" data-text="${esc(say)}">🔊 Read it to me</button>
    ${!cur.practice && p.cr[id].lv < 4 ? `<button data-act="brave">💪 Brave Try: harder one</button>` : ''}
    <button data-act="report">Skip to "how did it go?"</button></div>
  </section>`;
};

VIEWS.rest = () => {
  const p = me();
  return `<section class="card center restbox"><p class="kicker">Rest</p><h1 class="count" id="restCount">20</h1>
  <p class="big">Shake it out. Get a sip of water. Round ${Q.round} of ${rounds(p)} is next!</p>
  <button class="btn big" data-act="restSkip">I'm ready!</button></section>`;
};

VIEWS.report = () => {
  const id = Q.list[Q.i];
  return `<section class="card center">${art(id, me().cr[id].lv, 96)}
  <h1>How did ${CREATURES[id].name} go?</h1>
  <div class="answers">
    <button class="ans a1" data-act="result" data-r="all">I did all of it!</button>
    <button class="ans a2" data-act="result" data-r="some">I did some of it</button>
    <button class="ans a3" data-act="result" data-r="tricky">Too tricky today</button>
  </div></section>`;
};

VIEWS.feel = () => `<section class="card center"><h1>How do you feel?</h1>
  <div class="faces">
    <button data-act="feel" data-f="great"><span>😄</span>Great</button>
    <button data-act="feel" data-f="ok"><span>🙂</span>OK</button>
    <button data-act="feel" data-f="puffed"><span>😮‍💨</span>Puffed out</button>
  </div><button class="linkbtn" data-act="feel" data-f="">Skip</button></section>`;

VIEWS.brave = () => {
  const p = me();
  const id = Q.list[Q.i];
  const L = ladder(p, id)[p.cr[id].lv + 1];
  return `<section class="card center mission">${art(id, p.cr[id].lv + 1, 110)}
  <p class="kicker">Brave Try · ${STAGES[p.cr[id].lv + 1]} move</p>
  <h1>${esc(moveText(p, L))}</h1>${p.quiet && L.quiet ? '' : `<p class="cue">${esc(L.c)}</p>`}
  <p class="target">Try it once: ${targetText(L, L.r[0])}</p>
  <p class="small muted">Just one try. It doesn't matter if it doesn't work yet. Trying is the brave bit.</p>
  <div class="answers"><button class="ans a1" data-act="braveDone" data-ok="1">I did it!</button>
  <button class="ans a3" data-act="braveDone" data-ok="0">Not yet</button></div></section>`;
};

VIEWS.questEnd = () => {
  const p = me();
  const ch = STORY[(p.ch - 1 + STORY.length) % STORY.length];
  const trained = Q.list[Q.list.length - 1];
  const fact = pick(BODY_LAB[pick(Q.list)] || BODY_LAB[trained]);
  return `<section class="card hero center">${campfire(p.logs, false)}
  <h1>Quest complete!</h1><p class="big">${esc(pick(HYPE.done))}</p>
  <p>Chapter ${(p.ch - 1) % STORY.length + 1} done: you chose <b>${esc(ch.paths[Q.path])}</b>.</p></section>
  <section class="card lab"><p class="kicker">🔬 Body Lab</p><p class="big">${esc(fact)}</p></section>
  <button class="btn big" data-act="go" data-v="home">Back to the campfire</button>`;
};

/* Codex */
VIEWS.codex = () => {
  const p = me();
  return `<h1>Creature Codex</h1><p class="muted">Practise moves to help your creatures evolve: Cub → Scout → Ranger → Champion → Legend.</p>
  <div class="codex">${CREATURE_IDS.map((id) => `<button class="cx" data-act="go" data-v="creature" data-a="${id}">
    ${art(id, p.cr[id].lv, 84)}<b>${CREATURES[id].name}</b><span>${STAGES[p.cr[id].lv]}</span>${stars(p.cr[id].lv)}</button>`).join('')}</div>
  <button class="btn ghost" data-act="go" data-v="home">Back</button>`;
};
VIEWS.creature = () => {
  const p = me(); const id = arg; const c = p.cr[id]; const cr = CREATURES[id]; const lad = ladder(p, id);
  return `<section class="card center">${art(id, c.lv, 130)}<h1>${cr.name}</h1><p>${STAGES[c.lv]} ${stars(c.lv)}</p>
  <p class="muted">Builds ${cr.builds}.</p>
  ${c.practice ? '<p class="pill">On the practice version for now. Do all of it once to get back to your level.</p>' : ''}</section>
  <ol class="ladder">${lad.map((L, i) => `<li class="${i < c.lv ? 'got' : i === c.lv ? 'now' : 'locked'}">
    <b>${STAGES[i]}: ${esc(moveText(p, L))}</b>
    <span>${i < c.lv ? '✅ Done' : i === c.lv ? 'Now: ' + targetText(L, c.t) : '🔒 ' + targetText(L, L.r[0])}</span></li>`).join('')}</ol>
  <button class="btn ghost" data-act="go" data-v="codex">Back</button>`;
};

/* Story so far */
VIEWS.story = () => {
  const p = me();
  const n = Math.min(p.ch, STORY.length);
  const season = Math.floor(p.ch / STORY.length);
  return `<h1>The Lost Forest</h1>
  ${season ? `<p class="pill">Season 1 finished${season > 1 ? ' ' + season + ' times' : ''}! You're replaying it now.</p>` : ''}
  ${n === 0 ? '<p class="card">Your story starts with your first quest.</p>' : ''}
  ${STORY.slice(0, season ? STORY.length : n).map((s, i) => `<section class="card story"><p class="kicker">Chapter ${i + 1}</p><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></section>`).join('')}
  <button class="btn ghost" data-act="go" data-v="home">Back</button>`;
};

/* Firsts */
VIEWS.firsts = () => {
  const p = me();
  return `<h1>My Firsts</h1><p class="muted">Every first time, saved forever (on this device).</p>
  ${p.firsts.length ? `<ul class="firsts">${p.firsts.slice().reverse().map((f) => `<li><b>${esc(f.txt)}</b><span>${nice(f.d)}</span></li>`).join('')}</ul>` : '<p class="card">Your firsts will appear here. Start a quest!</p>'}
  <div class="stats"><div class="stat"><b>${p.logs}</b>Logs</div><div class="stat"><b>${p.brave}</b>Brave Tries</div><div class="stat"><b>${p.coach}</b>Times coaching</div></div>
  <button class="btn ghost" data-act="go" data-v="home">Back</button>`;
};

/* Wiggle */
VIEWS.wiggle = () => `<section class="card center"><h1>Wiggle Break</h1><p class="big">4 moves, 30 seconds each. No scores, just fun.</p>
  <button class="btn big" data-act="wiggleGo">Start wiggling</button></section><button class="btn ghost" data-act="go" data-v="home">Back</button>`;
VIEWS.wiggling = () => `<section class="card center restbox"><p class="kicker">Move ${arg.i + 1} of 4</p><h1>${esc(arg.list[arg.i])}</h1>
  <p class="count" id="wigCount">30</p><button class="btn ghost" data-act="go" data-v="home">Stop</button></section>`;

/* Teach a grown-up */
VIEWS.teach = () => {
  const p = me();
  const ok = CREATURE_IDS.filter((id) => p.cr[id].lv >= 2);
  if (!ok.length) return `<section class="card center"><h1>Teach a Grown-Up</h1><p class="big">Get any creature to <b>Ranger</b> and you can become the coach! You'll teach a grown-up a move and give them stars.</p></section><button class="btn ghost" data-act="go" data-v="home">Back</button>`;
  return `<h1>Teach a Grown-Up</h1><p class="big">You're the coach now! Pick a move to teach.</p>
  <div class="codex">${ok.map((id) => `<button class="cx" data-act="go" data-v="teach2" data-a="${id}">${art(id, p.cr[id].lv, 72)}<b>${CREATURES[id].name}</b></button>`).join('')}</div>
  <button class="btn ghost" data-act="go" data-v="home">Back</button>`;
};
VIEWS.teach2 = () => {
  const p = me(); const L = ladder(p, arg)[0];
  return `<section class="card center">${art(arg, p.cr[arg].lv, 100)}<p class="kicker">Coach mode</p><h1>Teach: ${esc(moveText(p, L))}</h1>
  <ol class="steps"><li>Show your grown-up how to do it.</li><li>Tell them the tip: <i>${esc(L.c)}</i></li><li>Watch them do it 3 times.</li><li>Give them stars!</li></ol>
  <h2>How did your grown-up do?</h2>
  <div class="faces">${[1, 2, 3].map((n) => `<button data-act="coach" data-n="${n}"><span>${'⭐'.repeat(n)}</span>${['Keep practising', 'Pretty good', 'Super'][n - 1]}</button>`).join('')}</div></section>`;
};

/* Playground quest */
VIEWS.park = () => `<section class="card"><p class="kicker">Grown-ups first</p><h1>Playground Quest</h1>
  <p>Before you start, please check:</p>
  <fieldset><legend>Grown-up check</legend>
  ${['The equipment looks in good condition and the ground underneath is soft (bark, rubber or grass)', 'The equipment suits my child\'s size and age', 'I\'m staying close, especially near anything high']
    .map((q) => `<label class="opt"><input type="checkbox" name="pk"> ${q}</label>`).join('')}</fieldset>
  <h2>What's at your park?</h2>
  <fieldset><legend>Tick what you can see</legend>
  ${KIT.map((k) => `<label class="opt"><input type="checkbox" name="kit" value="${k.id}"> ${k.n}</label>`).join('')}</fieldset>
  <p id="pkWarn" class="warn" hidden>Please tick all three grown-up checks and at least one thing at the park.</p>
  <button class="btn big" data-act="parkGo">Make my quest</button></section>
  <button class="btn ghost" data-act="go" data-v="home">Back</button>`;
VIEWS.parkQuest = () => `<section class="card"><h1>Your Playground Quest</h1><p class="big">Tick each one when you've done it!</p>
  <ul class="checklist">${arg.map((m, i) => `<li><label class="opt"><input type="checkbox" name="pq" value="${i}"> ${esc(m)}</label></li>`).join('')}</ul>
  <div class="card stop"><b>Stop rule:</b> if anything hurts, you feel dizzy, or you can't catch your breath, stop and tell a grown-up.</div>
  <button class="btn big" data-act="parkDone">Quest done!</button></section>`;

/* Grown-ups area (gated) */
VIEWS.grownups = () => {
  return `<h1>Grown-ups</h1>
  <section class="card"><h2>Children</h2>
  ${S.profiles.map((x) => `<div class="row prof"><div><b>${esc(nameOf(x))}</b><br><span class="small muted">${x.band === 'explorers' ? 'Explorers 9–11' : 'Cubs 6–8'} · ${x.bar ? 'Bar' : 'No bar'}${x.quiet ? ' · Quiet' : ''} · ${x.logs} quests</span></div>
    <div class="tools"><button data-act="go" data-v="editProfile" data-a="${x.id}">Edit</button><button data-act="go" data-v="levels" data-a="${x.id}">Levels</button><button data-act="delProfile" data-id="${x.id}">Remove</button></div></div>`).join('')}
  <button class="btn ghost" data-act="go" data-v="addProfile">Add another child</button></section>
  <section class="card"><h2>How HypeCubs works</h2>
  <ul><li>3 quests a week, 10–15 minutes. Only one quest a day, so muscles get rest.</li>
  <li>Each creature has 5 levels. When your child does every round, the target goes up a little. At the top of a level, the creature evolves.</li>
  <li>Two "too tricky" reports in a row switches to an easier practice version. Levels never go down on screen.</li>
  <li>No weights, no maximum tests, and no talk about weight or body shape. Ever.</li>
  <li>Aged 11+? HypeReps (our app for teens and adults) is the next step, with a grown-up's OK.</li></ul></section>
  <section class="card"><h2>Your data</h2>
  <p>Everything is stored on this device only. We can't see it.</p>
  <div class="tools"><button data-act="export">Export backup (JSON)</button><label class="filebtn">Import backup<input type="file" id="importFile" accept="application/json"></label>
  <button data-act="wipe" class="dangerbtn">Delete all data</button></div></section>
  <p><a href="privacy.html">Privacy</a> · <a href="privacy.html#kids">Privacy for kids</a> · <a href="terms.html">Terms</a> · <a href="index.html">About HypeCubs</a></p>
  <button class="btn ghost" data-act="go" data-v="home">Done</button>`;
};
VIEWS.editProfile = () => profileForm('Grown-ups', 'Edit profile', S.profiles.find((x) => x.id === arg));
VIEWS.addProfile = () => profileForm('Grown-ups', 'Your new child\'s profile', null);
VIEWS.levels = () => {
  const p = S.profiles.find((x) => x.id === arg);
  return `<h1>Starting levels: ${esc(nameOf(p))}</h1><p class="muted">If a level is clearly too easy, you can move it up. Changing a level resets that creature's target to the level's start.</p>
  ${CREATURE_IDS.map((id) => `<label for="lv_${id}">${CREATURES[id].name}</label><select id="lv_${id}" data-id="${id}">
    ${ladder(p, id).map((L, i) => `<option value="${i}" ${p.cr[id].lv === i ? 'selected' : ''}>${STAGES[i]}: ${esc(L.n)}</option>`).join('')}</select>`).join('')}
  <button class="btn big" data-act="saveLevels">Save levels</button> <button class="btn ghost" data-act="go" data-v="grownups">Back</button>`;
};

/* ---------- Gate ---------- */
function gate(then) {
  const a = 11 + Math.floor(Math.random() * 9), b = 3 + Math.floor(Math.random() * 6);
  $modal.innerHTML = `<div class="box"><h2 id="modalTitle">Grown-ups only</h2><p>What is ${a} × ${b}?</p>
    <input id="gateIn" inputmode="numeric" autocomplete="off" aria-label="Answer">
    <p id="gateMsg" class="warn" hidden>Not quite. Ask a grown-up!</p>
    <div class="tools center"><button class="btn" id="gateOk">Enter</button><button class="btn ghost" id="gateNo">Cancel</button></div></div>`;
  $modal.hidden = false;
  const inp = document.getElementById('gateIn'); inp.focus();
  const ok = () => { if (+inp.value === a * b) { $modal.hidden = true; then(); } else { document.getElementById('gateMsg').hidden = false; inp.value = ''; inp.focus(); } };
  document.getElementById('gateOk').onclick = ok;
  inp.onkeydown = (e) => { if (e.key === 'Enter') ok(); };
  document.getElementById('gateNo').onclick = () => { $modal.hidden = true; };
}
function modal(html) {
  $modal.innerHTML = '<div class="box">' + html + '<p><button class="btn" id="mClose">OK!</button></p></div>';
  $modal.hidden = false;
  const b = document.getElementById('mClose'); b.focus(); b.onclick = () => { $modal.hidden = true; };
}

function askConfirm(msg, yes, then) {
  $modal.innerHTML = '<div class="box"><h2 id="modalTitle">Are you sure?</h2><p>' + esc(msg) + '</p><div class="tools"><button class="dangerbtn" id="cYes">' + esc(yes) + '</button><button id="cNo">Cancel</button></div></div>';
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
    $main.innerHTML = `<section class="card center restbox"><p class="kicker">${sides[s] || 'Hold it!'}</p>
      <p class="count" id="hc">3</p><p class="big" id="hcMsg">Get ready…</p><button class="btn ghost" data-act="holdStop">Stop</button></section>`;
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
  if (p.logs === 1) first(p, 'Your very first quest!');
  if (p.ch === STORY.length) first(p, 'Finished Season 1 of The Lost Forest!');
  [10, 25, 50, 100].forEach((n) => { if (p.logs === n) first(p, n + ' quests completed!'); });
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
        document.getElementById('hcWarn').innerHTML = '<div class="card stop"><b>Please check with your child\'s GP before starting.</b> Once they say it\'s OK, you can carry on.</div>';
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
