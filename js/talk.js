/* Engine of the story site: one screen at a time, steps inside a screen, clicker keys, notes, map, presenter window. No dependencies. */
(function () {
  'use strict';
  const SC = [];          // main sequence (01..22)
  const EXTRA = [];       // B1, R (reached from the map only)
  const ALL = () => SC.concat(EXTRA);
  const stage = document.getElementById('stage');
  const host = document.getElementById('screens');
  const overlay = document.getElementById('overlay');
  const notesEl = document.getElementById('notes');
  const mapEl = document.getElementById('map');
  const blackEl = document.getElementById('black');
  const progEl = document.getElementById('progress');
  const chan = ('BroadcastChannel' in window) ? new BroadcastChannel('lia-talk') : null;

  let cur = -1, k = 0, busy = false, queued = null, timers = [], variant03 = (/[?&]v=b\b/.test(location.search) ? 'b' : 'a');
  const S = { els: {} };
  const ALL_MODE = /[?&]all=1\b/.test(location.search);   // ?all=1 plays the screens that are skipped by default
  function skipped(d) { return !!d.skip && !ALL_MODE; }
  function nextIdx(i) { let j = i + 1; while (j < SC.length && skipped(SC[j])) j++; return j; }
  function prevIdx(i) { let j = i - 1; while (j > 0 && skipped(SC[j])) j--; return j; }

  const ACTS = ['I · The night', 'II · Where people go', 'III · The flip', 'IV · Lia', 'V · A third mind', 'VI · Measure it'];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function boldRefoua(s) { return esc(s).replace(/Refoua, E\./g, '<b>Refoua, E.</b>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); }

  /* ----- fit the 1920x1080 stage to the window ----- */
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'translate(' + (-960 * s) + 'px,' + (-540 * s) + 'px) scale(' + s + ')';
    stage.dataset.scale = s;
  }
  window.addEventListener('resize', fit);

  /* ----- timers owned by the current step ----- */
  function later(ms, fn) { const t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  const fx = {
    later,
    type(el, text, cps, done) {
      cps = cps || 28; el.textContent = ''; el.classList.add('caret');
      let i = 0;
      const iv = setInterval(function () {
        i++; el.textContent = text.slice(0, i);
        if (i >= text.length) { clearInterval(iv); el.classList.remove('caret'); if (done) done(); }
      }, 1000 / cps);
      timers.push(iv);
    },
    words(el, text, gap, start) {
      el.innerHTML = '';
      text.split(' ').forEach(function (w, i) {
        const sp = document.createElement('span'); sp.className = 'word';
        sp.style.animationDelay = ((start || 0) + i * (gap || 0.09)) + 's';
        sp.textContent = w + ' '; el.appendChild(sp);
      });
    },
    esc, boldRefoua
  };

  /* ----- registering screens ----- */
  function screen(def) {
    def.clicks = def.clicks || 0;
    (def.extra ? EXTRA : SC).push(def);
    return def;
  }

  /* ----- build DOM ----- */
  function build() {
    ALL().forEach(function (d, idx) {
      const el = document.createElement('section');
      el.className = 'screen'; el.id = 's' + d.id; el.dataset.theme = d.theme || 'paper';
      el.innerHTML = (typeof d.html === 'function') ? d.html(el) : d.html;
      host.appendChild(el);
      d.el = el; d.idx = idx;
      if (d.init) d.init(el, d);
    });
  }

  function reveal(el, kk) {
    el.querySelectorAll('[data-s]').forEach(function (n) {
      const s = +n.dataset.s, o = +(n.dataset.out || 999);
      n.classList.toggle('in', kk >= s && kk < o);
      n.classList.toggle('out', kk >= o);
    });
  }

  /* ----- transitions ----- */
  const E = 'cubic-bezier(.16,.72,.24,1)';
  function kf(kind, dir) {
    const d = dir >= 0 ? 1 : -1;
    switch (kind) {
      case 'depth': return [[{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.94)' }], [{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'scale(1)' }]];
      case 'rise': return [[{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(' + (-5 * d) + '%)' }], [{ opacity: 0, transform: 'translateY(' + (6 * d) + '%)' }, { opacity: 1, transform: 'none' }]];
      case 'pan': return [[{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + (-8 * d) + '%)' }], [{ opacity: 0, transform: 'translateX(' + (8 * d) + '%)' }, { opacity: 1, transform: 'none' }]];
      case 'flip': return [[{ opacity: 1, transform: 'rotateY(0)' }, { opacity: 0, transform: 'rotateY(' + (-70 * d) + 'deg)' }], [{ opacity: 0, transform: 'rotateY(' + (70 * d) + 'deg)' }, { opacity: 1, transform: 'none' }]];
      case 'page': return [[{ opacity: 1, transform: 'rotateY(0)', filter: 'brightness(1)' }, { opacity: 0, transform: 'rotateY(' + (-100 * d) + 'deg)', filter: 'brightness(.7)' }], [{ opacity: 1, transform: 'translateX(' + (3 * d) + '%)' }, { opacity: 1, transform: 'none' }]];
      case 'zoom': return [[{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.82)' }], [{ opacity: 0, transform: 'scale(1.28)' }, { opacity: 1, transform: 'scale(1)' }]];
      default: return [[{ opacity: 1 }, { opacity: 0 }], [{ opacity: 0 }, { opacity: 1 }]];
    }
  }

  function swap(from, to, dir, kind, instant) {
    const fe = from && from.el, te = to.el;
    if (instant || !fe || window.matchMedia('(prefers-reduced-motion: reduce)').matches && false) {
      if (fe) fe.classList.remove('active');
      te.classList.add('active'); busy = false; flushQueue(); return;
    }
    const dur = kind === 'fade' || kind === 'dawn' ? 1500 : 1250;
    const keys = kf(kind === 'dawn' ? 'fade' : kind, dir);
    busy = true;
    te.classList.add('entering'); fe.classList.add('leaving');
    te.style.zIndex = 3; fe.style.zIndex = 2;
    if (kind === 'page') { fe.style.transformOrigin = dir >= 0 ? 'left center' : 'right center'; }
    const a1 = fe.animate(keys[0], { duration: dur, easing: E, fill: 'forwards' });
    const a2 = te.animate(keys[1], { duration: dur, easing: E, fill: 'forwards' });
    Promise.all([a1.finished, a2.finished]).then(function () {
      a1.cancel(); a2.cancel();
      fe.classList.remove('leaving', 'active'); te.classList.remove('entering'); te.classList.add('active');
      fe.style.zIndex = ''; te.style.zIndex = ''; fe.style.transformOrigin = '';
      busy = false; flushQueue();
    }).catch(function () { busy = false; flushQueue(); });
  }

  /* ----- navigation ----- */
  function applyStep(d, kk, anim, prev) {
    reveal(d.el, kk);
    if (d.step) d.step(d.el, kk, { anim: anim, prev: prev, fx: fx, variant: variant03 });
  }

  function go(i, kk, dir, instant) {
    const list = ALL();
    if (i < 0 || i >= list.length) return;
    const to = list[i], from = cur >= 0 ? list[cur] : null;
    clearTimers();
    if (from && from !== to) { if (from.leave) from.leave(from.el); }
    const same = from === to;
    if (!same) {
      if (to.enter) to.enter(to.el, { fx: fx, back: dir < 0 });
      swap(from, to, dir, to.trans || 'fade', instant || !from);
    }
    cur = i; k = kk;
    applyStep(to, kk, !instant && !(dir < 0), null);
    document.body.classList.toggle('theme-night', (to.theme || 'paper') === 'night');
    hud();
    try { history.replaceState(null, '', '#' + to.id + '.' + k); } catch (e) {}
  }

  function actOf(d) { return d.act || 0; }
  function hud() {
    const d = ALL()[cur];
    const showProg = !d.extra && d.idx >= 4;
    progEl.classList.toggle('on', showProg);
    progEl.classList.toggle('hide12', d.id === '12');
    if (!progEl.children.length) { for (let i = 0; i < 6; i++) { progEl.appendChild(document.createElement('i')); } }
    Array.prototype.forEach.call(progEl.children, function (c, i) { c.classList.toggle('on', i < actOf(d)); c.classList.toggle('cur', i === actOf(d)); });
    renderNotes(); broadcast(); renderMap();
  }

  function flushQueue() {
    if (!queued) return;
    const q = queued; queued = null;
    setTimeout(function () { if (q === 'n') next(); else prev(); }, 60);
  }
  function next() {
    if (overlay.classList.contains('on')) { closeCard(); return; }
    if (busy) { queued = 'n'; return; }
    const d = ALL()[cur];
    if (d.guardNext && d.guardNext(d.el, k, fx)) return;
    if (k < d.clicks) { clearTimers(); const prev = k; k++; applyStep(d, k, true, prev); hud(); try { history.replaceState(null, '', '#' + d.id + '.' + k); } catch (e) {} return; }
    if (d.extra) return;
    { const nx = nextIdx(cur); if (nx < SC.length) go(nx, 0, 1); }
  }
  function prev() {
    if (overlay.classList.contains('on')) { closeCard(); return; }
    if (busy) { queued = 'p'; return; }
    const d = ALL()[cur];
    if (d.guardPrev && d.guardPrev(d.el, k, fx)) return;
    if (k > 0) { clearTimers(); const p = k; k--; applyStep(d, k, false, p); hud(); try { history.replaceState(null, '', '#' + d.id + '.' + k); } catch (e) {} return; }
    if (d.extra) { go(SC.length - 1, SC[SC.length - 1].clicks, -1); return; }
    if (cur > 0) { const pj = prevIdx(cur); const pd = SC[pj]; go(pj, pd.clicks, -1); }
  }

  /* ----- paper overlay ----- */
  function authorsHtml(a) {
    a = a.map(function (x) { return /^(Hadar Shoval, D\.|Shoval, D\. H\.)$/.test(x) ? 'Hadar-Shoval, D.' : x; });
    const parts = a.map(function (x) { return x.replace(/^Refoua, E\.(\*?)$/, function (m, s) { return '<b>Refoua, E.</b>' + s; }); });
    const safe = parts.map(function (x) { return x.indexOf('<b>') === 0 ? x : esc(x); });
    if (safe.length === 1) return safe[0];
    if (safe.length === 2) return safe[0] + ' &amp; ' + safe[1];
    return safe.slice(0, -1).join(', ') + ', &amp; ' + safe[safe.length - 1];
  }
  function cardImg(c, cls) {
    if (c.cover && c.ckind === 'cover') return '<div class="cv"><img src="assets/covers/' + c.cover + '" alt=""></div>';
    if (c.cover) return '<div class="cv tile" style="background:#' + c.brand + '"><div style="background:#fff;padding:20px"><img src="assets/covers/' + c.cover + '" alt=""></div></div>';
    return '<div class="cv tile" style="background:#4A5568;color:#fff;padding:40px;font:600 26px/1.2 Inter,sans-serif">' + esc(c.venue) + '</div>';
  }
  function openCard(id) {
    const c = WALLDATA.cards[id]; if (!c) return;
    const star = c.authors.some(function (a) { return a.indexOf('*') >= 0; });
    const status = c.status === 'published' ? 'Published' : c.status === 'under review' ? 'Under review' : c.status === 'preprint' ? 'Preprint' : c.status === 'accepted' ? 'Accepted' : c.status;
    let doiLine;
    if (c.doi) doiLine = 'DOI: ' + esc(c.doi);
    else if (c.preprint_doi) doiLine = 'Preprint DOI: ' + esc(c.preprint_doi);
    else doiLine = 'DOI: none yet (' + esc(status.toLowerCase()) + ')';
    const html =
      cardImg(c) +
      '<div class="info"><div class="k">' + esc(status) + (c.year ? ' · ' + c.year : '') + '</div>' +
      '<h3>' + esc(c.title) + '</h3>' +
      '<p>' + authorsHtml(c.authors) + '</p>' +
      '<p class="meta"><i>' + esc(c.venue) + '</i>' + (c.year ? ', ' + c.year : '') + (c.vp ? ', ' + esc(c.vp) : '') + '</p>' +
      '<p class="meta"><b>' + (c.IF ? 'Impact factor ' + esc(c.IF) + ' (JCR 2025)' : 'No impact factor') + '</b> &nbsp;·&nbsp; ' + doiLine + '</p>' +
      (star ? '<p class="meta">* equal contribution (from the CV)</p>' : '') + '</div>';
    overlay.querySelector('.pane').innerHTML = html;
    overlay.classList.add('on');
  }
  function closeCard() { overlay.classList.remove('on'); }
  overlay.addEventListener('click', closeCard);

  /* ----- notes, presenter, map ----- */
  function notesFor(d) {
    const nb = (window.NOTES || {})[d.id]; if (!nb) return { steps: [], aside: [] };
    let b = nb[0];
    if (d.id === '03' && nb.length > 1) b = variant03 === 'a' ? nb[1] : nb[0];
    return b;
  }
  function renderNotes() {
    const d = ALL()[cur]; if (!d) return;
    const n = notesFor(d);
    const t = n.steps[Math.min(k, n.steps.length - 1)] || '';
    const budget = d.time ? ' · budget ' + d.time : '';
    notesEl.innerHTML = '<div class="nm">' + esc(d.id) + ' · ' + esc(d.title) + ' · step ' + k + ' of ' + d.clicks + budget + '</div>' +
      '<div class="nb">' + esc(t) + '</div>' + (n.aside.length && k === 0 ? '<div class="na">' + n.aside.map(esc).join('<br>') + '</div>' : '') +
      (d.id === '03' ? '<div class="nm" style="margin-top:12px">V: switch variant (now: ' + (variant03 === 'a' ? 'Elad\'s written words, "That evening, we started."' : 'Zohar\'s frame, "I decided to try."') + ')</div>' : '');
  }
  function broadcast() {
    if (!chan) return;
    const d = ALL()[cur]; const n = notesFor(d); const nx = !d.extra && SC[nextIdx(d.idx)] ? SC[nextIdx(d.idx)].title : '';
    chan.postMessage({ type: 'state', id: d.id, title: d.title, k: k, clicks: d.clicks, time: d.time || '', note: n.steps[Math.min(k, n.steps.length - 1)] || '', aside: k === 0 ? n.aside : [], next: nx, i: d.idx, total: SC.length });
  }
  function renderMap() {
    if (!mapEl.classList.contains('on')) return;
    drawMap();
  }
  function drawMap() {
    let h = '<h2>The six acts</h2><div class="acts">';
    for (let a = 0; a < 6; a++) {
      h += '<div class="act"><h5>' + ACTS[a] + '</h5>';
      SC.forEach(function (d) { if (d.act === a) h += '<span class="it' + (ALL()[cur] === d ? ' cur' : '') + (skipped(d) ? ' skipd' : '') + '" data-id="' + d.id + '">' + d.id + ' · ' + esc(d.title) + ' <small>' + (skipped(d) ? 'skipped by default (click to play it)' : (d.time || '')) + '</small></span>'; });
      if (a === 5) {
        EXTRA.forEach(function (d) { h += '<span class="it' + (ALL()[cur] === d ? ' cur' : '') + '" data-id="' + d.id + '">' + d.id + ' · ' + esc(d.title) + '</span>'; });
      }
      h += '</div>';
    }
    h += '</div>';
    mapEl.innerHTML = h;
    Array.prototype.forEach.call(mapEl.querySelectorAll('.it'), function (n) {
      n.addEventListener('click', function () { const id = n.dataset.id; const idx = ALL().findIndex(function (d) { return d.id === id; }); mapEl.classList.remove('on'); go(idx, 0, idx >= cur ? 1 : -1); });
    });
  }
  function openPresenter() {
    const w = window.open('presenter.html', 'lia-presenter', 'width=900,height=700');
    if (w) setTimeout(broadcast, 800);
  }
  if (chan) chan.onmessage = function (e) { const m = e.data; if (m && m.type === 'cmd') { if (m.cmd === 'next') next(); else if (m.cmd === 'prev') prev(); else if (m.cmd === 'hello') broadcast(); } };

  /* ----- keys ----- */
  const NEXT = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'];
  const PREV = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'];
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;
    if (NEXT.indexOf(key) >= 0) { e.preventDefault(); if (blackEl.classList.contains('on')) { blackEl.classList.remove('on'); return; } if (mapEl.classList.contains('on')) { mapEl.classList.remove('on'); return; } next(); return; }
    if (PREV.indexOf(key) >= 0) { e.preventDefault(); if (blackEl.classList.contains('on')) { blackEl.classList.remove('on'); return; } if (mapEl.classList.contains('on')) { mapEl.classList.remove('on'); return; } prev(); return; }
    const lk = key.toLowerCase();
    if (lk === 'n') { notesEl.classList.toggle('on'); renderNotes(); }
    else if (lk === 'm') { mapEl.classList.toggle('on'); if (mapEl.classList.contains('on')) drawMap(); }
    else if (lk === 'f') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(function () {}); }
    else if (lk === 'b' || key === '.') { blackEl.classList.toggle('on'); }
    else if (lk === 'p') { openPresenter(); }
    else if (lk === 'v') { variant03 = variant03 === 'a' ? 'b' : 'a'; const d03 = SC.find(function (d) { return d.id === '03'; }); if (d03 && d03.setVariant) d03.setVariant(d03.el, variant03); renderNotes(); broadcast(); }
    else if (lk === 'r') { const idx = ALL().findIndex(function (d) { return d.id === 'R'; }); go(idx, 0, 1); }
    else if (key === 'Home') { go(0, 0, -1, true); }
    else if (key === 'Escape') { if (overlay.classList.contains('on')) closeCard(); else if (mapEl.classList.contains('on')) mapEl.classList.remove('on'); else if (notesEl.classList.contains('on')) notesEl.classList.remove('on'); else if (blackEl.classList.contains('on')) blackEl.classList.remove('on'); }
    else if (lk === 'k') { const d = ALL()[cur]; if (d.pause) d.pause(d.el); }
  });

  /* ----- phone (26.11, the public copy): a tap on the left third goes back, anywhere else goes on.
     Touch only, so the clicker, the keys and a mouse click on the laptop are unchanged; a tap on a paper card opens it. ----- */
  document.addEventListener('pointerup', function (e) {
    if (e.pointerType !== 'touch') return;
    if (overlay.classList.contains('on') || e.target.closest('#overlay, #map, .pcard, a, button')) return;
    if (blackEl.classList.contains('on')) { blackEl.classList.remove('on'); return; }
    if (e.clientX < window.innerWidth / 3) prev(); else next();
  });

  let idleT;
  function wake() { document.body.classList.remove('hide-cursor'); clearTimeout(idleT); idleT = setTimeout(function () { document.body.classList.add('hide-cursor'); }, 3000); }
  document.addEventListener('mousemove', wake);

  window.TALK = {
    screen: screen, fx: fx, esc: esc, boldRefoua: boldRefoua, openCard: openCard, closeCard: closeCard, S: S,
    all: ALL, go: function (n, kk) { const idx = ALL().findIndex(function (d) { return d.id === n; }); go(idx, kk || 0, 1, true); },
    next: next, prev: prev, state: function () { const d = ALL()[cur]; return { id: d.id, k: k, clicks: d.clicks, busy: busy }; },
    get variant() { return variant03; },
    start: function () {
      fit(); build();
      let i = 0, kk = 0;
      const m = /^#(\w+)\.(\d+)$/.exec(location.hash || '');
      if (m) { const idx = ALL().findIndex(function (d) { return d.id === m[1]; }); if (idx >= 0) { i = idx; kk = +m[2]; } }
      go(i, kk, 1, true);
      wake();
    }
  };
})();
