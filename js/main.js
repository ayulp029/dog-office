// 主程式：初始化、渲染迴圈（requestAnimationFrame）、輪詢、點擊、走路排程
(function () {
  const DO = window.DO;
  const Q = new URLSearchParams(location.search);
  const DEBUG = Q.get('debug') === '1';
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('stage');
  const dogs = DO.ORDER.map((id, i) => new DO.Dog(id, i));
  const byId = {}; dogs.forEach((d) => (byId[d.id] = d));
  let bg, last = 0, t0 = performance.now(), nextWalk = 6, loaded = false, fpsAcc = 0, fpsN = 0;
  const plants = [[34, 436, 1], [990, 436, 1], [30, 752, 1.25], [992, 756, 1.35]];

  function fit() {
    const s = Math.min(window.innerWidth / DO.CFG.W, window.innerHeight / DO.CFG.H);
    stage.style.transform = `scale(${s})`;
    stage.dataset.scale = s;
  }

  function applyData(res) {
    const { data, demo } = res;
    document.getElementById('demo-note').hidden = !demo;
    if (data.officeName) document.getElementById('office-name').textContent = data.officeName;
    dogs.forEach((d) => {
      const b = data.bots[d.id];
      if (b) d.apply(b); else d.apply({ status: 'idle', offline: true, name: DO.META[d.id][0], role: DO.META[d.id][1] });
      if (d.status !== 'working' || d.offline) d.shown = 0;
      else if (!loaded || d.progress < d.shown - 30) d.shown = d.progress;
    });
    const u = data.updatedAt ? new Date(data.updatedAt) : null;
    document.getElementById('clock-upd').textContent = u && !isNaN(u) ? '更新 ' + new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(u) : '';
    loaded = true;
  }

  async function poll() {
    try { applyData(await DO.fetchStatus()); } catch (e) { /* 保持現狀 */ }
    setTimeout(poll, DO.CFG.poll);
  }

  function hitTest(x, y) {
    for (let i = dogs.length - 1; i >= 0; i--) {
      const d = dogs[i];
      if (d.mode === 'walking') { if (Math.abs(x - d.pos.x) < 36 && y > d.pos.y - 80 && y < d.pos.y + 6) return d; }
      else if (Math.abs(x - d.seat.x) < 52 && y > d.seat.y - 78 && y < d.seat.y + 78) return d;
    }
    return null;
  }
  function onTap(ev) {
    const r = stage.getBoundingClientRect(), s = r.width / DO.CFG.W;
    const d = hitTest((ev.clientX - r.left) / s, (ev.clientY - r.top) / s);
    if (d) { if (DO.Card.id === d.id) DO.Card.close(); else DO.Card.open(d.id); } else DO.Card.close();
  }

  function scheduleWalk(t) {
    if (dogs.some((d) => d.mode === 'walking') || t < nextWalk) return;
    const c = dogs.filter((d) => d.status === 'working' && !d.offline);
    if (c.length < 6) { nextWalk = t + 5; return; }
    DO.startWalk(c[Math.floor(Math.random() * c.length)], Math.random() < 0.5 ? 'cooler' : 'coffee');
    nextWalk = t + 16 + Math.random() * 10;
  }

  function draw(t) {
    ctx.clearRect(0, 0, DO.CFG.W, DO.CFG.H);
    ctx.drawImage(bg, 0, 0);
    DO.drawClock(ctx, 600, 64);
    const items = [];
    dogs.forEach((d) => {
      items.push([d.seat.y, () => DO.drawSeatBack(ctx, d, t)]);
      items.push([d.seat.y + 76, () => DO.drawSeatFront(ctx, d, t)]);
      if (d.mode === 'walking') items.push([d.pos.y, () => DO.drawWalker(ctx, d, t)]);
    });
    const busy = dogs.some((d) => d.walk && d.walk.dest === 'coffee' && d.walk.phase === 'wait');
    items.push([DO.CFG.cooler.y, () => DO.drawCooler(ctx, DO.CFG.cooler.x, DO.CFG.cooler.y, t)]);
    items.push([DO.CFG.coffee.y, () => DO.drawCoffee(ctx, DO.CFG.coffee.x, DO.CFG.coffee.y, t, busy)]);
    plants.forEach(([x, y, s]) => items.push([y, () => DO.drawPlant(ctx, x, y, s, t)]));
    items.sort((a, b) => a[0] - b[0]).forEach((it) => it[1]());
    if (DEBUG) {
      ctx.strokeStyle = 'red'; ctx.lineWidth = 1;
      dogs.forEach((d) => ctx.strokeRect(d.seat.x - 52, d.seat.y - 78, 104, 156));
    }
  }

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    if (loaded) {
      dogs.forEach((d) => {
        d.tick(t);
        if (d.status === 'working') d.shown += (d.progress - d.shown) * Math.min(1, dt * 3);
        if (d.mode === 'walking') DO.updateWalk(d, dt);
      });
      scheduleWalk(t);
      draw(t);
      const anchors = {}; dogs.forEach((d) => (anchors[d.id] = DO.headAnchor(d)));
      DO.Labels.update(dogs, anchors);
      if (DO.Card.id) DO.Card.render();
      document.getElementById('clock-time').textContent = DO.taipeiTime();
    }
    if (DEBUG) {
      fpsAcc += dt; fpsN++;
      if (fpsAcc > 0.5) { const e = document.getElementById('debug'); e.hidden = false; e.textContent = Math.round(fpsN / fpsAcc) + ' fps'; fpsAcc = 0; fpsN = 0; }
    }
    requestAnimationFrame(frame);
  }

  async function start() {
    bg = DO.buildRoom();
    DO.Labels.init(dogs, (id) => (DO.Card.id === id ? DO.Card.close() : DO.Card.open(id)));
    DO.Card.init((id) => byId[id]);
    fit(); window.addEventListener('resize', fit); window.addEventListener('orientationchange', fit);
    document.getElementById('viewport').addEventListener('click', onTap);
    applyData(await DO.fetchStatus());
    setTimeout(poll, DO.CFG.poll);
    // 測試用 hook：?shot=cooler 讓一隻狗站在飲水機旁、?card=id 開詳情卡
    const sh = Q.get('shot');
    if (sh === 'cooler' || sh === 'coffee') {
      const d = byId[Q.get('dog') || 'lala'];
      DO.startWalk(d, sh, { arrived: true, hold: 9999 });
      nextWalk = 1e9;
    }
    if (Q.get('card')) DO.Card.open(Q.get('card'));
    requestAnimationFrame((n) => { last = n; frame(n); });
    window.__ready = true;
  }
  start();
})();
