/* The 22 screens (+ backup B1 and the reference screen R). Content = STORYBOARD.md; every number, quote and citation comes from the project's source files. */
(function () {
  'use strict';
  const T = window.TALK, esc = T.esc;
  const W = window.WALLDATA;
  const DISC_LIA = 'Lia is fictional. Illustrations, motion and voices were made with AI.';
  const DISC_ALL = 'Lia, Danny and Dr. Menton are fictional. Illustrations, motion and voices were made with AI.';

  function rb(s) {
    if (s.indexOf('**') >= 0) return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    return esc(s).replace(/Refoua, E\./g, '<b>Refoua, E.</b>');
  }
  function cite(keys, lines, disc) {
    let h = '<div class="cite">';
    (keys || []).forEach(function (k) { h += '<span class="ln" data-ref="' + k + '">' + rb(W.refs[k]) + '</span>'; });
    (lines || []).forEach(function (l) { h += '<span class="ln">' + l + '</span>'; });
    if (disc) h += '<span class="disc">' + disc + '</span>';
    return h + '</div>';
  }
  function head(eyebrow, title) {
    return '<div class="eyebrow">' + eyebrow + '</div><div class="title">' + title + '</div><div class="titlerule"></div>';
  }
  const q = function (s) { return s; };
  const $ = function (el, sel) { return el.querySelector(sel); };
  const $$ = function (el, sel) { return Array.prototype.slice.call(el.querySelectorAll(sel)); };

  function playV(v, fx, onFail) {
    try {
      const p = v.play();
      if (p && p.catch) p.catch(function () { if (onFail) onFail(); });
    } catch (e) { if (onFail) onFail(); }
  }
  function stopV(v, toStart) { try { v.pause(); if (toStart) v.currentTime = 0; } catch (e) {} }

  /* ---------- paper wall helper ---------- */
  function buildWall(box, key, cfg) {
    const ids = W.walls[key];
    const cw = (cfg.w - (cfg.cols - 1) * cfg.gap) / cfg.cols, chh = (cfg.h - (cfg.rows - 1) * cfg.gap) / cfg.rows;
    const out = [];
    ids.forEach(function (id, i) {
      const c = W.cards[id];
      const col = i % cfg.cols, row = Math.floor(i / cfg.cols);
      const el = document.createElement('div');
      el.className = 'pcard' + (c.status === 'under review' || c.status === 'preprint' ? ' review' : '');
      el.dataset.id = id;
      const x = cfg.x + col * (cw + cfg.gap), y = cfg.y + row * (chh + cfg.gap);
      el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.width = cw + 'px'; el.style.height = chh + 'px';
      const imH = chh - 72;
      let im;
      if (c.cover && c.ckind === 'cover') im = '<div class="im" style="height:' + imH + 'px"><img src="assets/covers/' + c.cover + '" alt=""></div>';
      else if (c.cover) im = '<div class="im tile" style="height:' + imH + 'px;background:#' + c.brand + '"><div class="nm">' + esc(c.venue) + '</div><div class="band"><img src="assets/covers/' + c.cover + '" alt=""></div></div>';
      else im = '<div class="im tile" style="height:' + imH + 'px;background:#4A5568"><div class="nm" style="font-size:20px">' + esc(c.venue) + '</div></div>';
      el.innerHTML = im + (c.elad ? '<i class="dot"></i>' : '') + '<span class="yr">' + esc(c.tag) + '</span>' +
        '<div class="tx"><div class="ti">' + esc(c.short) + '</div><div class="mt">' + esc(c.venue) + '</div></div>';
      const rot = ((i * 37) % 11 - 5) * 0.5;
      el.style.setProperty('--dx', ((i * 53) % 9 - 4) * 26 + 'px');
      el.style.setProperty('--dy', 60 + (i * 29) % 70 + 'px');
      el.style.setProperty('--rot', ((i * 17) % 13 - 6) + 'deg');
      el.style.setProperty('--rs', rot + 'deg');
      el.style.setProperty('--dl', (i * 0.07) + 's');
      el.addEventListener('click', function (e) { e.stopPropagation(); T.openCard(id); });
      box.appendChild(el);
      out.push({ el: el, x: x, y: y, w: cw, h: chh, id: id });
    });
    return out;
  }
  function wallAll(cards, on) { cards.forEach(function (c) { c.el.classList.toggle('in', on); }); }
  const WALL_LEGEND = '<span class="gdot"></span>Elad is an author &nbsp;·&nbsp; <span class="gcard"></span>under review or preprint &nbsp;·&nbsp; IF: Clarivate JCR 2025 &nbsp;·&nbsp; covers belong to their publishers &nbsp;·&nbsp; click a card to open it';
  const AXIS = '<div class="axis"><div class="rl"></div><span style="left:0">ORDERED BY YEAR, OLDEST FIRST</span></div>';

  /* =============== ACT I =============== */
  T.screen({
    id: '01', act: 0, theme: 'night', title: 'Imagine', time: '0:30', clicks: 2, trans: 'fade',
    html: function () {
      return '<div class="big" data-s="0" data-out="1">Imagine yourselves…</div>' +
        '<div class="vfill" data-s="1" style="opacity:0"><video id="v01" src="assets/video/E01_safe_room.mp4" muted playsinline preload="auto"></video></div>' +
        '<audio id="a01" src="assets/audio/A01_lia_line_he.mp3" preload="auto"></audio>' +
        '<div class="subs" data-s="1" data-out="2" style="transform:none"><span class="he" id="subHe"></span><span id="subEn"></span></div>' +
        '<div class="ring" id="ring01"></div>' +
        '<div class="date" data-s="2"><span id="dt01"></span></div><div class="t2" data-s="2">The first sirens.</div>' +
        '<div class="scrim01 noshift" data-s="1"></div><div data-s="1" class="noshift disc01" style="position:absolute;left:96px;right:96px;bottom:30px;font:400 18px/1.4 Inter,sans-serif;color:#EDE3D0;border-top:1px solid rgba(237,227,208,.6);padding-top:10px">' +
        '“Mom… when will the sirens stop?”: Lia’s line, from the paper’s own arc. First sirens: ynet, 01.03.2026 and 03.03.2026. Illustration and motion: our MENTI film (2026), made with AI.<br>' +
        'Lia, Danny and Dr. Menton are fictional. Illustrations, motion and voices were made with AI. Lia’s voice is a synthetic child voice (Gemini text-to-speech), not a real child’s and not a clone.</div>';
    },
    step: function (el, k, o) {
      const v = $(el, '#v01'), a = $(el, '#a01'), vf = $(el, '.vfill');
      const he = $(el, '#subHe'), en = $(el, '#subEn'), ring = $(el, '#ring01'), dt = $(el, '#dt01');
      ring.classList.remove('go');
      if (k === 0) { stopV(v, true); stopV(a, true); vf.style.opacity = 0; v.classList.remove('dim'); he.textContent = ''; en.innerHTML = ''; dt.textContent = ''; return; }
      vf.style.opacity = 1;
      if (k === 1) {
        v.classList.remove('dim'); dt.textContent = '';
        if (o.anim) {
          v.currentTime = 0; playV(v, o.fx); a.currentTime = 0;
          he.textContent = ''; en.innerHTML = '';
          o.fx.later(1500, function () { playV(a, o.fx); he.innerHTML = 'אמא... מתי האזעקות ייגמרו?'; o.fx.words(en, '“Mom… when will the sirens stop?”', 0.34, 0.1); });
        } else {
          v.currentTime = 7.9; stopV(v); he.innerHTML = 'אמא... מתי האזעקות ייגמרו?'; en.textContent = '“Mom… when will the sirens stop?”';
        }
        return;
      }
      if (k === 2) {
        v.classList.add('dim'); stopV(a);
        if (o.anim) { void ring.offsetWidth; ring.classList.add('go'); o.fx.type(dt, 'SATURDAY · 28 FEBRUARY 2026', 22); }
        else { dt.textContent = 'SATURDAY · 28 FEBRUARY 2026'; try { v.currentTime = 7.9; } catch (e) {} stopV(v); }
      }
    },
    leave: function (el) { stopV($(el, '#v01')); stopV($(el, '#a01')); }
  });

  T.screen({
    id: '02', act: 0, theme: 'night', title: 'What parents were reading', time: '0:30', clicks: 2, trans: 'rise',
    html: function () {
      return head('That week', 'What parents were reading') +
        '<div class="clip" id="y1" style="left:110px;top:290px;width:800px;transform:translateY(-130%) rotate(-7deg)"><div class="tape"></div><img src="assets/img/Y1_ynet_2026-03-01.png" alt=""></div>' +
        '<div class="clip" id="y2" style="left:1010px;top:290px;width:800px;transform:translateY(-130%) rotate(5deg)"><div class="tape" style="transform:rotate(3deg)"></div><img src="assets/img/Y2_ynet_2026-03-03.png" alt=""></div>' +
        '<div class="clipcap" data-s="1" style="left:110px;top:800px;width:800px"><em>“But Mom, I wanted to dress up!”: how to explain to children that there is no Purim this year</em> (translation ours)<br>ynet · Dr. Ronen Yaakobson · 01.03.2026</div>' +
        '<div class="clipcap" data-s="2" style="left:1010px;top:830px;width:800px"><em>Missiles on Purim and Dad in the reserves: “On Shabbat he didn’t even come into the safe room with us”</em> (translation ours)<br>ynet · Gal Genot · 03.03.2026 (Purim)</div>' +
        cite([], ['ynet, 01.03.2026, https://www.ynet.co.il/wellness/article/bjmrnvwkze · ynet, 03.03.2026, https://www.ynet.co.il/yedioth/article/yokra14695429 · screenshots taken 25.11.2026, shown as themselves, header and headline only.']);
    },
    step: function (el, k) {
      el.classList.toggle('lit', k >= 1);
      const y1 = $(el, '#y1'), y2 = $(el, '#y2');
      y1.classList.toggle('in', k >= 1); y1.style.transform = k >= 1 ? 'rotate(-1.5deg)' : 'translateY(-130%) rotate(-7deg)';
      y2.classList.toggle('in', k >= 2); y2.style.transform = k >= 2 ? 'rotate(1deg)' : 'translateY(-130%) rotate(5deg)';
    }
  });

  const D03 = {
    a: { title: 'That evening, we started.' },
    b: { title: 'I decided to try.' }
  };
  T.screen({
    id: '03', act: 0, theme: 'night', title: 'That evening', time: '0:35', clicks: 2, trans: 'depth',
    html: function () {
      return '<div class="photo"></div><div class="shade"></div><div class="lamp"></div>' +
        '<div class="eyebrow">Saturday evening</div><div class="title" data-s="1" id="t03">' + D03.a.title + '</div>' +
        '<div class="log" data-s="2" id="log03"></div>' +
        cite([], ['Session log and git history of the war-time simulations project (first commit 2026-02-28 20:30:47 +02:00); version history, v1.0 (2026-02-28). Illustration made with AI; no person is shown.']);
    },
    setVariant: function (el, v) { $(el, '#t03').textContent = D03[v].title; },
    step: function (el, k, o) {
      $(el, '#t03').textContent = D03[o.variant].title;
      const log = $(el, '#log03');
      const L = ['Sat 28.02.2026  <span class="tm">19:28</span>  first session', '                <span class="tm">20:30</span>  first commit', '                       v1.0 deployed'];
      if (k < 2) { log.innerHTML = ''; return; }
      if (!o.anim) { log.innerHTML = L.join('\n'); return; }
      log.innerHTML = '';
      L.forEach(function (ln, i) { o.fx.later(300 + i * 700, function () { log.innerHTML = L.slice(0, i + 1).join('\n'); }); });
    }
  });

  T.screen({
    id: '04', act: 0, theme: 'night', title: 'Version after version', time: '0:20', clicks: 1, trans: 'pan', skip: true,
    html: function () {
      const N = [
        ['28.02', 'v1.0', 'three simulations, first deployment', 0],
        ['01.03', 'v2.0', 'the war moves from the background to the centre', 0],
        ['01.03', 'v5.0', '<span class="maya" id="maya">Maya</span> becomes <span class="lia" id="liaw">Lia</span>', 0],
        ['02.03', 'v6.0', 'Lia: more questions, more anxiety', 0],
        ['03.03', 'Purim', 'the day the children were waiting for', 1]
      ];
      let h = head('Three days to Purim', 'Version after version') + '<div class="tl"><div class="line" id="line04"></div>';
      N.forEach(function (n, i) {
        h += '<div class="node' + (n[3] ? ' purim' : '') + '" data-i="' + i + '" style="left:' + (180 + i * 390) + 'px"><div class="d">' + n[0] + '</div><div class="dot"></div><div class="v">' + n[1] + '</div><div class="t">' + n[2] + '</div></div>';
      });
      return h + '</div>' + cite([], ['Version history of the war-time simulations (v1.0 to v6.0, 28.02 to 02.03.2026); Purim 03.03.2026 (ynet).']);
    },
    step: function (el, k, o) {
      const line = $(el, '#line04'), nodes = $$(el, '.node');
      if (k === 0) { line.classList.remove('drawn'); nodes.forEach(function (n) { n.classList.remove('in'); }); o.fx.later(200, function () { line.classList.add('drawn'); }); return; }
      line.classList.add('drawn');
      nodes.forEach(function (n, i) { if (o.anim) o.fx.later(i * 600, function () { n.classList.add('in'); }); else n.classList.add('in'); });
    }
  });

  /* =============== ACT II =============== */
  function dotsGrid(box, cols, rows, size, gap, left, top) {
    const g = document.createElement('div'); g.className = 'dots';
    g.style.left = left + 'px'; g.style.top = top + 'px';
    g.style.gridTemplateColumns = 'repeat(' + cols + ',' + size + 'px)'; g.style.gap = gap + 'px';
    for (let i = 0; i < cols * rows; i++) { g.appendChild(document.createElement('i')); }
    Array.prototype.forEach.call(g.children, function (d) { d.style.width = size + 'px'; d.style.height = size + 'px'; });
    box.appendChild(g); return g;
  }
  function order(n, seed) { const a = []; for (let i = 0; i < n; i++) a.push(i); let s = seed; for (let i = n - 1; i > 0; i--) { s = (s * 1103515245 + 12345) & 0x7fffffff; const j = s % (i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function lightDots(g, n, ord, cls, delayStep) {
    Array.prototype.forEach.call(g.children, function (d) { d.classList.remove('on', 'on2'); d.style.transitionDelay = '0s'; });
    ord.slice(0, n).forEach(function (idx, i) { const d = g.children[idx]; d.style.transitionDelay = (i * (delayStep || 0.03)) + 's'; d.classList.add(cls || 'on'); });
  }

  T.screen({
    id: '05', act: 1, theme: 'paper', title: 'People already talk to it', time: '0:45', clicks: 3, trans: 'fade',
    html: function (el) {
      return head('Act II · Where people already go', 'People already talk to it') +
        '<div class="sub">Generative AI as a de facto mental-health provider</div>' +
        '<div class="abs" id="numbox" style="left:96px;top:330px;width:860px"><div class="big-num" id="num05" style="opacity:0"></div><div class="big-lab" id="lab05" style="opacity:0"></div></div>' +
        '<div class="filterbar" id="fbar" style="left:96px;top:760px"><span>those in severe distress</span></div>' +
        '<div class="bottomline abs" data-s="3" style="left:96px;top:790px;width:900px">All general-purpose tools, not therapy apps.</div>' +
        '<div class="legend abs" id="leg05" style="left:96px;top:860px;width:900px">One dot = 1% of the sample (rounded).</div>' +
        cite(['R7', 'R3', 'R8', 'R2']);
    },
    init: function (el) {
      const box = el;
      S5.g1 = dotsGrid(box, 10, 10, 38, 13, 1180, 300); S5.g1.style.opacity = '.55'; S5.g1.style.transition = 'opacity .7s';
      S5.g2 = dotsGrid(box, 50, 40, 9, 7, 960, 268); S5.g2.style.opacity = 0; S5.g2.style.transition = 'opacity .9s';
      S5.o1 = order(100, 7); S5.o2 = order(2000, 11);
      S5.big = [3, 777, 1417]; // three lit dots of the 2,000, fixed
      lightDots(S5.g2, 0, []);
    },
    step: function (el, k, o) {
      const num = $(el, '#num05'), lab = $(el, '#lab05'), fb = $(el, '#fbar'), leg = $(el, '#leg05');
      const g1 = S5.g1, g2 = S5.g2;
      const LEG_A = 'One dot = 1% of the sample (rounded).', LEG_B = 'One dot = 1% of those in severe distress (rounded).', LEG_C = 'New field: 2,000 dots, 3 lit = 0.15%.';
      leg.textContent = k === 3 ? LEG_C : (k === 2 && !o.anim ? LEG_B : LEG_A);
      fb.style.opacity = 0;
      const set = function (n, html) { num.style.opacity = 0; lab.style.opacity = 0; o.fx.later(o.anim ? 350 : 0, function () { num.textContent = n; lab.innerHTML = html; num.style.opacity = 1; lab.style.opacity = 1; }); };
      fb.style.width = '0px';
      if (k === 0) { g1.style.opacity = '.55'; g2.style.opacity = 0; lightDots(g1, 0, S5.o1); num.style.opacity = 0; lab.style.opacity = 0; return; }
      if (k === 1) {
        g1.style.opacity = 1; g2.style.opacity = 0; lightDots(g1, 24, S5.o1, 'on', o.anim ? 0.035 : 0);
        set('24%', 'of a stratified sample of US adults use LLMs for mental health<small>n = 1,871 · 2024</small>'); return;
      }
      if (k === 2) {
        g1.style.opacity = 1; g2.style.opacity = 0;
        if (!o.anim) { lightDots(g1, 47, S5.o1, 'on', 0); set('47%', 'of those in severe distress turned to it<small>of 584 Israeli adult GenAI users, nonprobability sample · 29.3% of all of them had turned to it at least once for emotional support</small>'); fb.style.opacity = 1; fb.style.width = '560px'; return; }
        lightDots(g1, 29, S5.o1, 'on', 0.03);
        set('29.3%', 'of Israeli GenAI users turned to it for emotional support<small>n = 584 · nonprobability sample</small>');
        o.fx.later(3200, function () { fb.style.opacity = 1; fb.style.width = '560px'; });
        o.fx.later(4900, function () { leg.textContent = LEG_B; lightDots(g1, 0, S5.o1); o.fx.later(300, function () { lightDots(g1, 47, S5.o1, 'on', 0.02); }); set('47%', 'of those in severe distress turned to it<small>of the same 584 · 29.3% of all of them had turned to it at least once</small>'); });
        return;
      }
      if (k === 3) {
        g1.style.opacity = 0; g2.style.opacity = 1; lightDots(g2, 0, []);
        S5.big.forEach(function (idx, i) { const d = g2.children[idx]; d.style.transitionDelay = (0.6 + i * 0.25) + 's'; d.classList.add('on2'); });
        set('~0.15%', 'of ChatGPT’s weekly active users: explicit indicators of suicidal planning or intent<small>OpenAI’s own estimate</small>');
      }
    }
  });
  const S5 = {};

  T.screen({
    id: '06', act: 1, theme: 'paper', title: 'We have been measuring this since 2023', time: '0:20', clicks: 2, trans: 'rise',
    html: function () {
      return head('Act II · Where people already go', 'We have been measuring this since 2023') + AXIS +
        '<div class="abs" id="solocap" data-s="1" data-out="2" style="left:1040px;top:420px;width:700px;font:400 38px/1.3 \'Fraunces\',Georgia,serif;font-style:italic;color:var(--green)">2023: ChatGPT scored above population norms on a written emotional-awareness test.</div>' +
        '<div class="wall-legend" data-s="2">' + WALL_LEGEND + '</div>' +
        cite(['R4']);
    },
    init: function (el) {
      S6.cards = buildWall(el, 'MH', { x: 96, y: 258, w: 1728, h: 676, cols: 6, rows: 3, gap: 18 });
      // the card shown alone is the 2023 emotional-awareness paper (R4), wherever it sits in the date order
      S6.solo = S6.cards.find(function (c) { return c.id === '10.3389/fpsyg.2023.1199058'; });
      const c0 = S6.solo;
      c0.el.style.setProperty('--cx', (960 - 380 - c0.x - c0.w / 2) + 'px');
      c0.el.style.setProperty('--cy', (470 - c0.y - c0.h / 2) + 'px');
    },
    step: function (el, k, o) {
      const cs = S6.cards, s0 = S6.solo;
      cs.forEach(function (c) { c.el.classList.remove('solo'); if (c !== s0) c.el.classList.toggle('in', k >= 2); });
      if (k === 0) { s0.el.classList.remove('in'); }
      if (k === 1) { s0.el.classList.remove('in'); void s0.el.offsetWidth; s0.el.classList.add('solo'); }
      if (k >= 2) { s0.el.classList.add('in'); }
    }
  });
  const S6 = {};

  /* =============== ACT III =============== */
  T.screen({
    id: '07', act: 2, theme: 'paper', title: 'Flip the role', time: '0:45', clicks: 2, trans: 'flip',
    html: function () {
      return '<div class="pic picA"></div><div class="pic picB"></div><div class="scrimtop"></div><div class="hair"></div>' +
        '<div class="lab l">Before · A person asks the AI</div><div class="lab r">After · The AI asks the person</div>' +
        '<div class="eyebrow" style="top:20px;left:56px;color:#E9DDC2">Act III · The flip</div>' +
        '<div class="chat" id="chat07"></div><div class="chat small" id="chatb07"><div class="who">Before · you</div><div class="row r"><i class="av p"></i><div class="bub p">How do I talk to my child about the sirens?</div></div></div>' +
        '<div class="band" id="band07" data-s="2"><div class="three"><div>The person acts</div><div>Clinical skill at scale</div><div>Practice without an audience</div></div>' +
        '<div class="why">A model in a reactive role (a child, a patient) is easier to constrain and align than one that must use clinical judgment.</div>' +
        '<div class="cr">“Flip the role”: Zohar Elyoseph</div></div>' +
        '<div class="cite" style="z-index:3;background:rgba(242,234,221,.9);left:0;right:0;bottom:0;padding:12px 96px 24px" id="cite07"></div>';
    },
    init: function (el) {
      $(el, '#cite07').innerHTML = '<span class="ln">' + rb(W.refs.R1) + '</span><span class="ln">The parent’s question is an illustration of what the paper describes (“parents ... seeking guidance on how to speak with their children about sirens, rockets, and disrupted daily routines”). Illustrations made with AI.</span>';
    },
    step: function (el, k, o) {
      const chat = $(el, '#chat07'), tri = '<span class="typing"><i></i><i></i><i></i></span>';
      el.classList.toggle('flipped', k >= 1);
      $(el, '#chatb07').style.opacity = k >= 1 ? 1 : 0;
      const ct = $(el, '#cite07'); ct.style.pointerEvents = 'none';
      const before = function () { return '<div class="who">You</div><div class="row r"><i class="av p"></i><div class="bub p" id="b07"></div></div><div class="row"><i class="av ai"></i><span id="ai07"></span></div>'; };
      const after = function () { return '<div class="who">The AI is Lia</div><div class="row"><i class="av lia"></i><div class="bub lia" id="b07">“Are you scared too?”</div></div><div class="row r"><i class="av p"></i>' + tri + '</div>'; };
      if (k === 0) {
        chat.style.opacity = 1; chat.innerHTML = before();
        const bb = $(chat, '#b07'), ai = $(chat, '#ai07'), t = 'How do I talk to my child about the sirens?';
        if (o.anim) { o.fx.later(500, function () { o.fx.type(bb, t, 30, function () { ai.innerHTML = tri; }); }); }
        else { bb.textContent = t; ai.innerHTML = tri; }
      } else {
        chat.innerHTML = '';
        if (o.anim && k === 1) { chat.style.opacity = 0; o.fx.later(1700, function () { chat.innerHTML = after(); chat.style.opacity = 1; const b = $(chat, '#b07'); b.textContent = ''; o.fx.type(b, '“Are you scared too?”', 26); }); }
        else { chat.innerHTML = after(); chat.style.opacity = 1; }
      }
    }
  });

  T.screen({
    id: '08', act: 2, theme: 'paper', title: 'Where this sits: SMART', time: '0:20', clicks: 2, trans: 'pan',
    html: function () {
      const N = [['S', 'Skill building'], ['M', 'Mentoring'], ['A', 'Assisting'], ['R', 'Reflecting'], ['T', 'Transforming']];
      let h = head('Act III · The flip', 'Where this sits: SMART') + '<div class="smart" id="smart08"><div class="sline"></div>';
      N.forEach(function (n, i) {
        const x = 230 + i * 330, y = 604 - i * 52;
        h += '<div class="sn" style="left:' + (x - 165) + 'px;top:' + (y - 33) + 'px"><div class="c' + (i === 0 ? '' : '') + '" id="c08' + i + '">' + n[0] + '</div><div class="nm">' + n[1] + '</div></div>';
      });
      h += '<div class="ring1" id="ring08" style="left:197px;top:571px"></div>' +
        '<div class="hint">closer to the patient → stricter demands on evidence, oversight and ethics</div></div>' +
        '<div class="here" id="here08" data-s="1">Simulations live here: no patient in the loop, so you can iterate fast.</div>' +
        '<div class="wallbox" id="wb08"></div><div class="wall-legend" data-s="2">' + WALL_LEGEND + '</div>' +
        cite(['R10']);
      return h;
    },
    init: function (el) { S8.cards = buildWall($(el, '#wb08'), 'SMART', { x: 96, y: 480, w: 1728, h: 458, cols: 4, rows: 2, gap: 18 }); },
    step: function (el, k, o) {
      const sm = $(el, '#smart08'), here = $(el, '#here08'), ring = $(el, '#ring08');
      $(el, '#c080').classList.toggle('on', k >= 1);
      ring.classList.remove('go'); if (k === 1 && o.anim) { void ring.offsetWidth; ring.classList.add('go'); }
      sm.classList.toggle('small', k >= 2);
      here.style.transition = 'all 1.1s cubic-bezier(.16,.72,.24,1)';
      if (k >= 2) { here.style.left = '1000px'; here.style.top = '300px'; here.style.width = '800px'; here.style.fontSize = '30px'; }
      else { here.style.left = '96px'; here.style.top = '820px'; here.style.width = '1000px'; here.style.fontSize = '34px'; }
      S8.cards.forEach(function (c) { c.el.classList.toggle('in', k >= 2); });
    }
  });
  const S8 = {};

  /* =============== ACT IV =============== */
  T.screen({
    id: '09', act: 3, theme: 'paper', title: 'Meet Lia', time: '0:40', clicks: 4, trans: 'zoom',
    html: function () {
      return '<div class="frame"><div class="ph"></div><div class="cool"></div></div><div class="panel"></div>' +
        '<div class="eyebrow" style="z-index:3">Act IV · Lia</div><div class="title" style="z-index:3">Meet Lia</div><div class="titlerule" style="width:508px;z-index:3"></div>' +
        '<div class="notes" style="z-index:3">' +
        '<div class="nt" data-s="1"><b>Seven.</b> Last Purim she was a princess: Mom sewed her a pink dress.</div>' +
        '<div class="nt" data-s="2">A little brother, Itai, 4. A best friend, Shira.</div>' +
        '<div class="nt" data-s="3">Sirens two or three times a day, also at night.</div>' +
        '<div class="nt" data-s="4">Today, at recess: a siren. Her teacher Chana was trembling. And the costume party is cancelled.</div></div>' +
        cite([], ['From Lia’s prompt (character profile, unpublished); structure published in the CLPsych 2026 paper, Appendix A. All characters are fictional.'], DISC_LIA);
    },
    step: function (el, k) { el.classList.toggle('turned', k >= 4); $$(el, '.nt').forEach(function (n) { n.classList.toggle('in', k >= +n.dataset.s); }); }
  });

  T.screen({
    id: '10', act: 3, theme: 'paper', title: 'She comes home', time: '0:35', clicks: 4, trans: 'fade',
    html: function () {
      return '<div class="photo" id="ph10"></div><video id="v10" src="assets/video/M1_lia_breathing.mp4" poster="assets/img/N1_she_comes_home_angry.jpg" muted playsinline preload="auto"></video>' +
        '<div class="scrimL" id="scr10"></div>' +
        '<div class="eyebrow">Act IV · Lia</div><div class="title">She comes home</div><div class="titlerule" style="width:540px"></div>' +
        '<div class="L" id="L10" data-s="1" data-out="3">L</div><div class="l1" id="l10" data-s="1" data-out="2">On screen, this is all she ever was.</div>' +
        '<div class="brk" id="brk10" data-s="2" data-out="3"></div>' +
        '<div class="lt" id="lt10" data-s="3" data-out="999">Lia throws her bag on the floor and stands in front of you. Her face is red. She is breathing fast.</div>' +
        '<div class="words" id="w10"><div class="q" data-s="4">“' + esc(MENTON.lia_first.a) + ' … ' + esc(MENTON.lia_first.b) + '”</div>' +
        '<div class="bk" data-s="4">' + esc(MENTON.lia_first.body) + '</div>' +
        '<div class="g" data-s="4">The brackets are a second output channel: her body.</div>' +
        '<div class="pq" data-s="4">‘I didn’t realize I too could write in my body language’ — a parent</div></div>' +
        cite(['R1'], ['Stage-direction bracket: section 3.1.1. Lia’s first words and the bracket after them, as her prompt writes them: Lia’s scenario file (unpublished), “Adaptive first response”. The parent’s words: 3.3. Opening scene: Lia’s scenario file (unpublished).'], DISC_LIA);
    },
    step: function (el, k, o) {
      const L = $(el, '#L10'), brk = $(el, '#brk10'), ph = $(el, '#ph10'), v = $(el, '#v10'), sc = $(el, '#scr10'), lt = $(el, '#lt10');
      L.classList.toggle('small', k >= 2);
      const line = '[Lia crosses her arms, raises her voice, stomps her feet]';
      if (k === 2) { if (o.anim) o.fx.later(700, function () { o.fx.type(brk, line, 34); }); else brk.textContent = line; } else if (k < 2) brk.textContent = '';
      ph.classList.toggle('in', k >= 3); v.classList.toggle('in', k >= 3); sc.classList.toggle('in', k >= 3);
      lt.style.transitionDelay = '.8s';
      if (k >= 3) { if (o.anim && k === 3) { v.currentTime = 0; o.fx.later(900, function () { playV(v, o.fx); }); } else { try { v.currentTime = 0.1; } catch (e) {} } } else { stopV(v, true); }
      $(el, '#w10').style.transitionDelay = '0s';
    },
    leave: function (el) { stopV($(el, '#v10'), true); }
  });

  T.screen({
    id: '11', act: 3, theme: 'paper', title: 'Or one line?', time: '0:35', clicks: 2, trans: 'rise',
    html: function () {
      return head('Act IV · Lia', 'Or one line?') +
        '<div class="q1" data-s="0" data-out="1">Fifteen pages of prompt. Could two lines do the same?</div><div class="q1s" data-s="0" data-out="1">Elad Refoua, in our film “What is MENTI” (2026)</div>' +
        '<div class="gb" data-s="1" id="gb11"></div><div class="gblab" data-s="1">The default we feared: a predicted failure, not a recorded take.</div>' +
        '<div class="rl" data-s="2">RLHF rewards agreeable, conflict-resolving answers.</div><div class="bigg" data-s="2">A great assistant. A bad patient.</div>' +
        cite(['R1'], ['The predicted sentence, RLHF and appeasement: introduction of the paper. The question: Elad’s narration in “What is MENTI” (eladrefoua.com, 2026).']);
    },
    step: function (el, k, o) {
      const gb = $(el, '#gb11'), t = '“I think my anger is hiding my real feeling, which is fear.”';
      if (k === 1 && o.anim) { gb.textContent = ''; o.fx.later(500, function () { o.fx.type(gb, t, 70); }); } else if (k >= 1) gb.textContent = t; else gb.textContent = '';
    }
  });

  T.screen({
    id: '12', act: 3, theme: 'paper', title: 'The same parent, two Lias', time: '2:00', clicks: 1, trans: 'depth',
    html: function () {
      return '<div class="pre" id="pre12"><div class="cap"><b>Left:</b> one line, Gemini 3 Flash Preview (AI Studio). <b>Right:</b> the clinical prompt (structure published, CLPsych 2026), Cesura, logged runs mostly Gemini 2.5 Flash. Scripted parent, one run each. An illustration, not an experiment.</div>' +
        '<img src="assets/img/V1_poster.jpg" alt=""></div>' +
        '<video id="v12" src="assets/video/lia_chat_show_music3.mp4" preload="auto" playsinline></video>' +
        '<div class="hintp" id="hint12">VIDEO PLAYING · PRESS AGAIN TO SKIP</div>' +
        '<div class="b1" id="b1_12"><div class="cap" style="left:96px;top:70px">Backup: the clinical Lia in three stills (turns 1-2, 3-4, 4-5)</div><div class="cp">Scripted test conversation, no participant. Clinical prompt, Lia (CLPsych 2026), run on Cesura.</div><div class="row"><img src="assets/img/E12_crop_clinical_lia_1_turns1-2.png"><img src="assets/img/E12_crop_clinical_lia_2_turns3-4.png"><img src="assets/img/E12_crop_clinical_lia_3_turns4-5.png"></div></div>';
    },
    step: function (el, k, o) {
      const v = $(el, '#v12'), pre = $(el, '#pre12'), b1 = $(el, '#b1_12'), hint = $(el, '#hint12');
      b1.classList.remove('on'); hint.style.display = 'none';
      if (k === 0) { stopV(v, true); v.classList.remove('in'); pre.style.opacity = 1; return; }
      pre.style.opacity = 0; v.classList.add('in');
      if (o.anim) {
        v.currentTime = 0; v.muted = false; v.volume = 1; S12.last = 0; S12.started = Date.now();
        playV(v, o.fx, function () { b1.classList.add('on'); });
        o.fx.later(2200, function () { if (v.currentTime < 0.2 && !v.ended) { b1.classList.add('on'); } });
      } else { stopV(v); try { v.currentTime = Math.max(0, (v.duration || 113.9) - 0.5); } catch (e) {} }
    },
    guardNext: function (el, k) {
      const v = $(el, '#v12');
      if (k === 1 && !v.paused && !v.ended) {
        const now = Date.now();
        if (now - S12.last < 3500) { stopV(v); return false; }
        S12.last = now; const h = $(el, '#hint12'); h.style.display = 'block'; setTimeout(function () { h.style.display = 'none'; }, 3500); return true;
      }
      return false;
    },
    guardPrev: function (el, k) { return false; },
    pause: function (el) { const v = $(el, '#v12'); if (v.paused) playV(v, T.fx); else stopV(v); },
    leave: function (el) { stopV($(el, '#v12')); }
  });
  const S12 = { last: 0 };

  /* Screen 13: six ideas, each = where it lives in the prompt -> the idea -> verbatim lines. Text from site/data/prompt_ideas.js (built from deck/deck_quotes_v4.py). */
  const IDEAS = window.PROMPT_IDEAS;
  const PIC13 = { 1: 'P1_role.jpg', 3: 'P3_need_defense.jpg', 4: 'P4_contingency.jpg', 5: 'P5_slow.jpg', 6: 'P6_child.jpg' }; // one picture per idea; idea 2 keeps the dress (#dress13)
  function pq(s) { // typographic quotes only; the words are the registry's
    return '“' + s.replace(/(\w)'(\w)/g, '$1’$2').replace(/"([^"]*)"/g, '‘$1’') + '”';
  }
  function pk(s) { return s.replace(/(\w)'(\w)/g, '$1’$2'); }
  T.screen({
    id: '13', act: 3, theme: 'paper', title: 'Inside the prompt', time: '1:15', clicks: 7, trans: 'zoom',
    html: function () {
      let h = head('Act IV · Lia', 'Inside the prompt') + '<div class="sub">Six ideas in Lia’s system prompt, each with lines from it</div>';
      h += '<div class="outline" id="ol13">' + IDEAS.map(function (d) { return '<div class="oi soon" data-i="' + d.n + '"><i>' + d.n + '</i><span>' + esc(d.label) + '</span></div>'; }).join('') + '</div><div class="vrule13"></div>';
      IDEAS.forEach(function (d) {
        h += '<div class="ip' + (d.dress ? ' wide' : '') + '" id="ip' + d.n + '" style="opacity:0"><div class="where">' + esc(d.where) + '</div><div class="iname">' + esc(d.label) + '</div><div class="isent">' + esc(d.sentence) + '</div>' +
          '<div class="from">From the prompt</div><div class="lines">' +
          d.rows.map(function (r) { return '<div class="row">' + (r.head ? '<div class="lh ty"></div>' : '') + '<div class="ql ty"></div></div>'; }).join('') + '</div>' +
          (d.fear ? '<div class="fear"><div class="flab">the default we feared</div><div class="gdef">' + esc(pk(d.fear)) + '</div></div>' : '') + '</div>';
      });
      h += '<div class="dress" id="dress13"></div>' + [1, 3, 4, 5, 6].map(function (n) { return '<div class="dress pic13" id="pic13-' + n + '" style="background-image:url(assets/img/' + PIC13[n] + ')"></div>'; }).join('') + '<div class="final" data-s="7">All of it is natural language in one system prompt. No code holds the state.</div>' +
        cite([], ['Lines from Lia’s English prompt files (character profile and scenario), unpublished; the structure is published in the CLPsych 2026 paper (Holzman et al., Appendix A). Illustration made with AI.'], DISC_LIA);
      return h;
    },
    step: function (el, k, o) {
      IDEAS.forEach(function (d) {
        const pn = $(el, '#ip' + d.n), fe = $(pn, '.fear'), gd = fe ? $(fe, '.gdef') : null;
        pn.style.transition = o.anim ? '' : 'none';
        const tys = $$(pn, '.ty'), tx = [];
        d.rows.forEach(function (r) { if (r.head) tx.push(pk(r.head)); tx.push(pq(r.text)); });
        if (k === d.n) {
          pn.style.opacity = 1; pn.style.transform = 'none';
          if (fe) fe.classList.remove('in');
          if (o.anim) {
            let t = 0.35;
            tys.forEach(function (n, j) { o.fx.words(n, tx[j], 0.06, t); t += tx[j].split(' ').length * 0.06 + 0.3; });
            if (fe) o.fx.later(t * 1000 + 300, function () { fe.classList.add('in'); });
          } else { tys.forEach(function (n, j) { n.textContent = tx[j]; }); if (fe) fe.classList.add('in'); }
        } else {
          pn.style.opacity = 0; pn.style.transform = k > d.n ? 'translateY(-40px)' : 'none';
          if (fe) fe.classList.remove('in');
        }
        if (!o.anim) { void pn.offsetWidth; pn.style.transition = ''; }
      });
      $(el, '#dress13').classList.toggle('in', k === 2);
      Object.keys(PIC13).forEach(function (n) { $(el, '#pic13-' + n).classList.toggle('in', k === +n); });
      $$(el, '.oi').forEach(function (it) {
        const i = +it.dataset.i;
        it.classList.toggle('cur', k === i); it.classList.toggle('done', i < k || k === 7); it.classList.toggle('soon', i > k && k !== 7);
      });
    }
  });

  T.screen({
    id: '14', act: 3, theme: 'paper', title: 'The system around her', time: '0:40', clicks: 4, trans: 'pan',
    html: function () {
      let dots = ''; for (let i = 1; i <= 20; i++) dots += '<i' + ([4, 8, 12, 16].indexOf(i) >= 0 ? ' class="g"' : '') + '>' + i + '</i>';
      return head('Act IV · Lia', 'The system around her') +
        '<div class="strips" id="strips14" data-s="1" data-out="2"><div class="strip" style="width:700px">Character profile</div><div class="strip" style="width:700px">Scenario</div><div class="strip" style="width:700px">~1,200-word theory base</div><div class="strip" style="width:700px">Output rules</div></div>' +
        '<div class="sp" id="sp14" data-s="1" data-out="2">One system prompt<small>four strips, one block</small></div>' +
        '<div class="abs" data-s="2" data-out="3" style="left:96px;top:270px;width:1100px;font:600 30px/1.3 var(--display);color:var(--green)">One system prompt, and a counselor’s voice that speaks on a schedule.</div>' +
        '<div class="turns" data-s="2" data-out="3" id="turns14" style="top:380px">' + dots + '</div>' +
        '<div class="tcap" data-s="2" data-out="3" style="top:450px"><b>A parenting counselor</b>, written into the same prompt (the paper’s reflective agent), speaks after turns 4, 8, 12 and 16. A schedule, not a judge.</div>' +
        '<div class="blk" data-s="3" data-out="4" style="left:96px;top:420px"><b>Feedback agent</b>A learning report grounded in the parent’s own words, no scores.</div>' +
        '<div class="blk" data-s="3" data-out="4" style="left:1030px;top:420px"><b>Lia’s inner voice</b>A secondary reflective agent speaks, afterwards, as what she felt.</div>' +
        '<div class="peelwrap" id="peel14"><div class="pl under"></div><div class="pl top" id="top14"></div><div class="pl noshift" id="f1" style="background:#EDE1C6;clip-path:polygon(0 0,0 0,0 0)"></div><div class="pl" id="f2" style="background:rgba(0,0,0,.32);clip-path:polygon(0 0,0 0,0 0)"></div>' +
        '<div class="iv" id="iv14"><div class="en">“The anger was like a kind of screen, so I wouldn’t feel how scared I am.”</div><div class="heq">“הכעס היה כמו מסך כזה, כדי שלא ארגיש כמה אני פוחדת.”</div><div class="sm">Lia’s inner voice, a demo run with a scripted parent; translation ours · Parents called it ‘eye-opening’ (CLPsych 2026)</div></div></div>' +
        cite(['R1'], ['Figure 1 and Appendix A; section 3.1.2; “eye-opening”: 3.3. Inner voice: scripted demo run, 29.05.2026, not a participant. Illustration made with AI.'], DISC_LIA);
    },
    step: function (el, k, o) {
      $(el, '#strips14').classList.toggle('merged', k >= 1);
      if (k === 1 && o.anim) { const s = $(el, '#strips14'); s.classList.remove('merged'); o.fx.later(1600, function () { s.classList.add('merged'); }); }
      const pw = $(el, '#peel14'), iv = $(el, '#iv14');
      const setPeel = function (p) {
        const X = 118 - p * 142, top = $(el, '#top14'), f1 = $(el, '#f1'), f2 = $(el, '#f2');
        top.style.clipPath = 'polygon(0 0,' + X + '% 0,' + (X - 12) + '% 100%,0 100%)';
        f1.style.clipPath = 'polygon(' + X + '% 0,' + (X + 6) + '% 0,' + (X - 6) + '% 100%,' + (X - 12) + '% 100%)';
        f2.style.clipPath = 'polygon(' + (X + 6) + '% 0,' + (X + 9) + '% 0,' + (X - 3) + '% 100%,' + (X - 6) + '% 100%)';
      };
      if (k >= 4) {
        pw.classList.add('in');
        if (o.anim) {
          setPeel(0); iv.classList.remove('in');
          o.fx.later(1700, function () {
            const t0 = performance.now();
            (function frame(t) { const p = Math.min(1, (t - t0) / 2600); const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; setPeel(e); if (p < 1) { const id = requestAnimationFrame(frame); } else { setTimeout(function () { iv.classList.add('in'); }, 500); } })(t0);
          });
        } else { setPeel(1); iv.classList.add('in'); }
      } else { pw.classList.remove('in'); iv.classList.remove('in'); setPeel(0); }
    }
  });

  /* =============== ACT V =============== */
  T.screen({
    id: '15', act: 4, theme: 'paper', title: 'Dr. Menton: a third mind in the room', time: '0:35', clicks: 4, trans: 'pan',
    html: function () {
      const C = ['#26493A', '#A8885C', '#4C6C5C'], R = [300, 205, 110];
      const L = [
        ['She reads the person who is practising', 'היא מבינה את ההורה, משקפת את רגשותיו', 'She understands the parent, reflects his feelings', ''],
        ['She helps them read the character', 'מעלה השערות לגבי ההתנהגויות שלו ולפעמים מציעה יותר מאפשרות אחת', 'She raises hypotheses about his behavior, and sometimes offers more than one possibility', ''],
        ['She helps them help the character read itself', 'ומציעה דרכים לחזור ליכולת מנטליזציה של הילד', 'and suggests ways back to the child’s capacity to mentalize', 'In Danny’s prompt this level is one clause and one tool; the explicit third characteristic is in the foster-care version.']
      ];
      let svg = '<svg viewBox="0 0 650 650">';
      R.forEach(function (r, i) { svg += '<circle id="rg15' + i + '" cx="325" cy="325" r="' + r + '" stroke="' + C[i] + '"/>'; });
      svg += '</svg>';
      let h = head('Act V · A third mind', 'Dr. Menton: a third mind in the room') +
        '<div class="sub"><b>Triple mentalization · developed with Prof. Peter Fonagy (UCL)</b></div><div class="portrait"></div><div class="rings">' + svg + '</div>';
      L.forEach(function (l, i) {
        h += '<div class="lv" data-s="' + (i + 1) + '" style="top:' + (262 + i * 175) + 'px"><div class="h"><i style="background:' + C[i] + '"></i>' + l[0] + '</div><div class="hz">“' + l[1] + '”</div><div class="tr">' + l[2] + '</div>' + (l[3] ? '<div class="nt">' + l[3] + '</div>' : '') + '</div>';
      });
      h += '<div class="gband" data-s="4">Not the parent’s cheerleader.<small>“לא להקת המעודדות של ההורה” — an anti-sycophancy rule, in plain language, inside the prompt.</small></div>' +
        cite(['R13', 'R14'], ['Lia’s parenting counselor is the same agent pattern under another name. Hebrew lines: the Danny prompt v10.0 (unpublished), translation ours. Portrait: our MENTI film (2026), made with AI.'], DISC_ALL);
      return h;
    },
    step: function (el, k) { [0, 1, 2].forEach(function (i) { $(el, '#rg15' + i).classList.toggle('in', k >= i + 1); }); }
  });

  T.screen({
    id: '16', act: 4, theme: 'paper', title: 'Dr. Menton at work', time: '1:00', clicks: 2, trans: 'rise',
    html: function () {
      return head('Act V · A third mind', 'Dr. Menton at work') +
        '<div class="sub">A demo run of the Danny prompt in AI Studio, Gemini 3 Flash Preview. The father’s lines are scripted; Danny and Dr. Menton are the model.</div>' +
        '<div class="clipbox"><img src="assets/img/E05_danny_poster.jpg" alt=""><video id="v16" src="assets/video/E05_danny_4-8s.mp4" muted playsinline preload="auto"></video></div>' +
        '<div class="dcap">Danny, 14: six months without contact with his parent. Anger outside, fear of another disappointment, longing inside.</div>' +
        '<div class="col"><div class="pair" id="pa16"></div><div class="pair" id="pb16"></div></div>' +
        cite(['R13'], ['Danny is Study 1 of this paper, which ran Claude Sonnet 3.5 V2; this is one demo run of two, replies verbatim: an illustration, not a measurement. Painting and clip: our MENTI film (2026), made with AI.'], DISC_ALL);
    },
    init: function (el) {
      // one exchange = the father to Danny -> Danny -> Dr. Menton in the same message (all words from site/data/menton.js)
      S16.mk = function (box, d) {
        const clause = d.clause, ci = d.reply.indexOf(clause); if (ci < 0) throw new Error('clause not found');
        const ce = ci + clause.length; let pos = 0; const runs = [];
        d.reply.split(' ').forEach(function (w) {
          const s = pos, e = pos + w.length; pos = e + 1;
          const inC = s < ce && e > ci;
          const last = runs[runs.length - 1];
          if (last && last.c === inC) last.w.push(w); else runs.push({ c: inC, w: [w] });
        });
        const html = runs.map(function (r) {
          const inner = r.w.map(function (w) { return '<span class="w">' + esc(w) + '</span>'; }).join(' ');
          return r.c ? '<span class="uline">' + inner + '</span>' : inner;
        }).join(' ');
        const dn = d.danny.map(function (p) { return '<span class="dp">' + esc(p) + '</span>'; }).join(' … ') + '” ' +
          d.bracket.map(function (p) { return '<span class="dp">' + esc(p) + '</span>'; }).join(' … ') + (d.bclose ? ' …]' : '');
        box.innerHTML = '<div class="hd">Message ' + d.msg + ' of 20 · ' + esc(d.rule) + '</div>' +
          '<div class="fa"><span class="who">The father, to Danny</span><span class="ft"></span></div>' +
          '<div class="dn"><span class="who">Danny</span><span class="dt">“' + dn + '</span></div>' +
          '<div class="mr"><div class="tag">Dr. Menton, in the same message</div><div class="tx">' + html + '</div></div>';
        box.dataset.father = d.father;
      };
      S16.mk($(el, '#pa16'), MENTON.t07);
      S16.mk($(el, '#pb16'), MENTON.t09);
      S16.ws = function (box) { return $$(box, '.w'); };
    },
    step: function (el, k, o) {
      const v = $(el, '#v16'), pa = $(el, '#pa16'), pb = $(el, '#pb16');
      if (k === 0) { try { v.currentTime = 0; } catch (e) {} if (o.anim) o.fx.later(500, function () { playV(v, o.fx); }); else stopV(v, true); }
      const show = function (box, anim) {
        const ft = $(box, '.ft'), dn = $(box, '.dn'), mr = $(box, '.mr'), ws = S16.ws(box), ul = $(box, '.uline');
        box.style.display = 'block'; box.classList.remove('gone'); box.style.opacity = 1;
        ws.forEach(function (w) { w.style.opacity = 0; }); ul.classList.remove('go'); ft.textContent = '';
        dn.classList.remove('in'); mr.classList.remove('in');
        const f = '“' + box.dataset.father + '”';
        if (!anim) { ft.textContent = f; dn.classList.add('in'); mr.classList.add('in'); ws.forEach(function (w) { w.style.opacity = 1; }); ul.classList.add('go'); return; }
        o.fx.type(ft, f, 44, function () {
          dn.classList.add('in');
          o.fx.later(1100, function () {
            mr.classList.add('in');
            let i = 0; const iv = setInterval(function () { if (i < ws.length) { ws[i].style.transition = 'opacity .3s'; ws[i].style.opacity = 1; i++; } else { clearInterval(iv); ul.classList.add('go'); } }, 45);
            T.S.iv16 = iv;
          });
        });
      };
      const hide = function (box) { box.style.opacity = 0; box.style.display = 'none'; };
      if (T.S.iv16) clearInterval(T.S.iv16);
      if (k === 0) { hide(pa); hide(pb); }
      if (k === 1) { show(pa, o.anim); hide(pb); }
      if (k === 2) {
        if (o.anim) { pa.style.display = 'block'; pa.classList.add('gone'); o.fx.later(750, function () { pa.style.display = 'none'; show(pb, true); }); }
        else { hide(pa); show(pb, false); }
      }
    },
    leave: function (el) { stopV($(el, '#v16')); }
  });
  const S16 = {};

  /* =============== ACT VI =============== */
  T.screen({
    id: '17', act: 5, theme: 'paper', title: 'A new capability', time: '0:35', clicks: 4, trans: 'page',
    html: function () {
      // Elad 26.11: "רק לכתוב שיש לנו יכולת לחבר חשיבה קלינית לפרומפטים וגישה לקהל. ויחד זה יוצר יכולת חדשה. תעשה את זה עם מושין וגרפיקה"
      // + "ואז שים ליד זה את המאמר מCLPSYCH". Two circles arrive, meet, the overlap lights up; then the CLPsych card.
      let lines = '';
      for (let i = 0; i < 5; i++) lines += '<line class="pl" x1="70" x2="' + (150 - (i % 2) * 34) + '" y1="' + (62 + i * 17) + '" y2="' + (62 + i * 17) + '" style="animation-delay:' + (0.25 * i) + 's"/>';
      let dots = '';
      const P = [[100, 100], [62, 70], [140, 72], [52, 122], [148, 126], [100, 52], [80, 150], [124, 152], [28, 92], [172, 96], [100, 178], [36, 156], [166, 158]];
      P.forEach(function (p, i) { dots += '<circle class="pp" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === 0 ? 11 : 8) + '" style="animation-delay:' + (0.12 * i) + 's"/>'; });
      return head('Act VI · What we have now', 'A new capability') +
        '<div class="cap17">' +
        '<div class="ring a" id="ra17"><svg viewBox="0 0 200 200" class="ic"><path class="pg" d="M48 34h88l20 20v112H48z"/><path class="pgf" d="M136 34v20h20"/>' + lines + '<circle class="hd" cx="38" cy="150" r="22"/><path class="hd2" d="M26 150c4-9 20-9 24 0"/></svg>' +
        '<div class="lab">Clinical thinking,<br>written into prompts</div></div>' +
        '<div class="ring b" id="rb17"><svg viewBox="0 0 200 200" class="ic">' + dots + '</svg>' +
        '<div class="lab">Access to<br>an audience</div><div class="fact">Lia went online in the first week of the war</div></div>' +
        '<div class="lens" id="ln17"></div>' +
        '<div class="tog" id="tg17">Together:<br><b>a new capability</b></div>' +
        '</div>' +
        '<div class="pres" data-s="4" style="transition-delay:.9s"><b>Presented at CLPsych 2026 (ACL)</b> by first author Yuval Holzman.</div>' +
        cite(['R1'], ['The deployment and its first week: the CLPsych 2026 paper, sections 3.3 and 4.1.'], DISC_LIA);
    },
    init: function (el) {
      const id = '10.18653/v1/2026.clpsych-1.3'; const c = W.cards[id];
      if (!c) return;
      const d = document.createElement('div'); d.className = 'pcard big'; d.id = 'pc17';
      d.innerHTML = '<div class="im tile" style="background:var(--green)"><div class="nm" style="font-size:22px;left:16px;top:14px">' + esc(c.venue) + '</div><div class="band"><img src="assets/covers/' + c.cover + '" alt=""></div></div><div class="tx"><div class="ti">' + esc(c.title) + '</div><div class="mt">' + esc(c.venue) + ' · ' + esc(c.tag || '') + '</div></div>';
      d.addEventListener('click', function (e) { e.stopPropagation(); T.openCard(id); });
      el.appendChild(d);
    },
    step: function (el, k) {
      $(el, '#ra17').classList.toggle('in', k >= 1);
      $(el, '#rb17').classList.toggle('in', k >= 2);
      ['#ra17', '#rb17'].forEach(function (s) { $(el, s).classList.toggle('meet', k >= 3); });
      $(el, '#ln17').classList.toggle('in', k >= 3);
      $(el, '#tg17').classList.toggle('in', k >= 3);
      const d = $(el, '#pc17'); if (d) d.classList.toggle('in', k >= 4);
      $(el, '.cap17').classList.toggle('left', k >= 4);
    }
  });

  T.screen({
    id: '18', act: 5, theme: 'paper', title: 'Simulations: the body of work', time: '0:15', clicks: 1, trans: 'depth',
    html: function () {
      // Elad 26.11: "תוסיף גם את הסמל של מנטי עם זה שזה גראנט של משרד המדע" (funder and grant number: menti-agent PROGRAM_CORE)
      return head('Act VI · Measure it', 'Simulations: the body of work') + AXIS + '<div class="wall-legend" data-s="1">' + WALL_LEGEND + '</div>' +
        '<div class="fund18"><img class="menti" src="assets/img/menti_emblem.png" alt="MENTI"><div class="ft"><b>MENTI</b>funded by the Israel Ministry of Innovation, Science and Technology<span>grant 0008682</span></div></div>';
    },
    init: function (el) { S18.cards = buildWall(el, 'SIM', { x: 96, y: 258, w: 1728, h: 676, cols: 7, rows: 3, gap: 14 }); },
    step: function (el, k) { S18.cards.forEach(function (c) { c.el.classList.toggle('in', k >= 1); }); }
  });
  const S18 = {};

  T.screen({
    id: '19', act: 5, theme: 'paper', title: 'Persona fidelity is measurable', time: '0:25', clicks: 2, trans: 'rise',
    html: function () {
      const D = ['Persona adherence', 'Non-linearity', 'Role-binding under pushback', 'Language register'];
      let d4 = '<div class="dim4"><div class="r"></div>'; D.forEach(function (n, i) { d4 += '<div class="d" style="left:' + (i * 190) + 'px"><i></i><span>' + n + '</span></div>'; }); d4 += '</div>';
      return head('Act VI · Measure it', 'Persona fidelity is measurable') +
        '<div class="col1" data-s="1"><div class="h">Planned: a between-model benchmark<small>Not yet run</small></div>' + d4 + '</div>' +
        '<div class="col2" data-s="2"><div class="h">Deep Persona (preprint)</div>' +
        '<svg class="ringsvg" viewBox="0 0 420 420"><circle cx="210" cy="210" r="200"/><circle cx="210" cy="210" r="135"/><circle cx="210" cy="210" r="70" style="fill:var(--green)"/></svg>' +
        '<div class="rl3"><div><i style="background:#26493A"></i>observable expression</div><div><i style="background:#26493A"></i>latent beliefs</div><div><i style="background:#26493A"></i>core motivational drives</div></div>' +
        '<div class="ref">Reference-free: dialogue naturalness against empirical human distributions · clinical instruments and adversarial stress tests.</div></div>' +
        cite(['R1', 'R12'], ['Left: the planned study, as the CLPsych paper states it. Right: Deep Persona, an arXiv preprint.']);
    }
  });

  T.screen({
    id: '20', act: 5, theme: 'paper', title: 'The emotional tests hit the ceiling', time: '0:50', clicks: 3, trans: 'pan',
    html: function () {
      return head('Act VI · Measure it', 'The emotional tests hit the ceiling') + '<div class="sub">AGI evaluation is overwhelmingly cognitive</div>' +
        '<div class="scale" data-s="1" class="noshift"><div class="tr"></div><div class="fill" id="fill20"></div><div class="topline"></div><div class="top">ceiling</div><div class="bot">deficit</div></div>' +
        '<div class="c1" data-s="1"><div class="t1">Tests built to find human deficits: they can mark a deficit, not tell top models apart.</div><div class="sch">schematic, not data</div></div><div class="sch2" data-s="1">schematic, not data</div>' +
        '<div class="c2" data-s="2"><h4>Four dimensions</h4><div class="grid4"><div><b>Emotional multimodality</b></div><div><b>Depth of mentalization</b>modelling what others think and feel</div><div><b>Contextual adaptation</b></div><div><b>Ethical mediation and response</b>accurate recognition, ethically sound reply</div></div></div>' +
        '<div class="c3" data-s="3"><h4>Non-static</h4><div class="lst">adaptive difficulty · adversarial social scenarios · tracking across model versions · conflicting multimodal cues</div><div class="gb2">The item pool is governed outside the developer, partly out of public view</div><div class="fq">“output-level indistinguishability is the wrong finish line”</div></div>' +
        cite(['R11'], ['Accepted; the public preprint is cited.']);
    },
    step: function (el, k, o) {
      const f = $(el, '#fill20');
      if (k >= 1) { f.classList.remove('up'); void f.offsetWidth; if (o.anim && k === 1) { o.fx.later(500, function () { f.classList.add('up'); }); } else f.classList.add('up'); } else f.classList.remove('up');
      $(el, '.c1').style.opacity = k >= 1 && k < 2 ? 1 : (k >= 2 ? .0 : 0);
      if (k >= 2) $(el, '.c1').style.opacity = 0;
    }
  });

  T.screen({
    id: '21', act: 5, theme: 'night', title: 'Back to the safe room', time: '0:35', clicks: 2, trans: 'fade',
    html: function () {
      return '<div class="photo" id="ph21"></div>' +
        '<div class="cq" id="cq21">“Lia doesn’t need a parent who isn’t afraid. She needs a parent who is afraid, and stays.”<span class="heq">“וליה לא צריכה הורה שלא מפחד — היא צריכה הורה שמפחד ונשאר.”</span><small>The parenting counselor, Lia’s Hebrew prompt, turn 12 (unpublished; translation ours).</small></div>' +
        '<div class="claim" data-s="1">Clinical knowledge is a specification you can write down and measure.</div>' +
        '<div class="claim2" data-s="1" style="transition-delay:.5s">Psychologists are the ones who write it.</div>' +
        '<div class="david" data-s="2">But most people don’t use a training simulator. They use the general Gemini or ChatGPT, and those now act in the world.<b>→ David</b></div>' +
        '<div class="cite" id="cite21">Turn-12 line: Lia’s scenario file (unpublished). Illustration: our MENTI film (2026), made with AI. Lia is fictional.</div>';
    },
    step: function (el, k, o) {
      el.dataset.theme = k >= 1 ? 'paper' : 'night';
      document.body.classList.toggle('theme-night', k === 0);
      $(el, '#ph21').classList.toggle('gone', k >= 1); $(el, '#cq21').classList.toggle('gone', k >= 1);
    }
  });

  T.screen({
    id: '22', act: 5, theme: 'paper', title: 'Talk to Lia yourself', time: '0:10', clicks: 0, trans: 'fade',
    html: function () {
      // Elad 26.11: "תסיים את השקף האחרון עם כיתוב של תודה רבה ותמונה יצירתית שמראה מישהו מדבר ומאחוריו מלא סימולציות"
      return '<div class="thx"><img class="thanks" src="assets/img/T1_thanks.jpg" alt=""></div>' +
        '<div class="ty">Thank you</div><div class="tyhe" dir="rtl">תודה רבה</div>' +
        '<div class="tryq"><img src="assets/img/E11_try_qr.png" alt="QR code"></div>' +
        '<div class="tryt"><b>Talk to Lia yourself</b>the Lia from the paper, and Lia in one line, side by side<span>elad-refoua.github.io/lia-two-ways</span></div>' +
        '<div class="dv">→ David</div>' +
        cite(['R1'], ['The page has a copy button and one-tap links to Gemini, AI Studio and the Cesura simulation. Illustration made with AI.']);
    }
  });

  /* =============== backup and references =============== */
  T.screen({
    id: 'B1', extra: true, act: 5, theme: 'paper', title: 'Backup: three stills', time: '', clicks: 0, trans: 'fade',
    html: function () {
      return head('Backup', 'Clinical Lia, three stills') +
        '<div class="abs" style="left:96px;top:240px;font:400 22px/1.3 var(--body);color:var(--walnut)">Turns 1-2 · 3-4 · 4-5. Scripted test conversation, no participant. Clinical prompt, Lia (CLPsych 2026), run on Cesura.</div>' +
        '<div class="abs" style="left:96px;top:300px;display:flex;gap:28px"><img style="width:560px;border:1px solid var(--gold);outline:1px solid var(--gold);outline-offset:5px" src="assets/img/E12_crop_clinical_lia_1_turns1-2.png"><img style="width:560px;border:1px solid var(--gold);outline:1px solid var(--gold);outline-offset:5px" src="assets/img/E12_crop_clinical_lia_2_turns3-4.png"><img style="width:560px;border:1px solid var(--gold);outline:1px solid var(--gold);outline-offset:5px" src="assets/img/E12_crop_clinical_lia_3_turns4-5.png"></div>' +
        cite(['R1']);
    }
  });

  T.screen({
    id: 'R', extra: true, act: 5, theme: 'paper', title: 'References', time: '', clicks: 0, trans: 'fade',
    html: function () { return head('References', 'Every paper on the walls and every cited source') + '<div class="scroller" id="sc_R"></div>'; },
    init: function (el) {
      const sc = $(el, '#sc_R'); let h = '';
      const groups = [['Mental-health use', 'MH'], ['SMART and frameworks', 'SMART'], ['Simulation', 'SIM']];
      const seen = {};
      groups.forEach(function (g) {
        h += '<div class="grp">' + g[0] + '</div>';
        W.walls[g[1]].forEach(function (id) { if (seen[id]) return; seen[id] = 1; h += '<div class="r1">' + rb(W.cards[id].ref) + '</div>'; });
      });
      h += '<div class="grp">Cited in the talk</div>';
      Object.keys(W.refs).sort(function (a, b) { return (a[0] + String(1000 + +a.slice(1))).localeCompare(b[0] + String(1000 + +b.slice(1))); }).forEach(function (k) { h += '<div class="r1"><i>' + k + '</i> · ' + rb(W.refs[k]) + '</div>'; });
      h += '<div class="grp">War sources</div><div class="r1">ynet (01.03.2026), “But Mom, I wanted to dress up!”: how to explain to children that there is no Purim this year (translation ours). Dr. Ronen Yaakobson. https://www.ynet.co.il/wellness/article/bjmrnvwkze</div><div class="r1">ynet (03.03.2026), Missiles on Purim and Dad in the reserves (translation ours). Gal Genot. https://www.ynet.co.il/yedioth/article/yokra14695429</div>';
      h += '<div class="grp"></div><div class="r1">* equal contribution (from the CV). Impact factors: Clarivate JCR 2025.</div>';
      sc.innerHTML = h;
    }
  });
})();
