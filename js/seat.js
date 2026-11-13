// 單隻狗的物件：狀態、動畫參數、座位繪製（分成「椅子＋狗」與「桌面＋道具」兩層做深度排序）
(function () {
  const DO = window.DO;
  const { ell, line, shade } = DO;
  const CHAIRS = ['#5b9aa0', '#c8683f', '#7a8fc8', '#6aa57a', '#b57aa0', '#d9a043', '#6b8fb5'];
  const LOOK_RIGHT = { apo: 1, lala: 1, mumu: 1, nana: 1, maomao: 1, xuebo: 1, keke: 1, director: -1, shiba: -1, bibi: 1, lady: 1, jinjin: 1, xiaoha: -1, butler: 1 };
  const TAIL_SIDE = { nana: -1, apo: -1, maomao: -1, butler: -1, shiba: 1, bibi: -1, lady: -1, lala: -1, xiaoha: 1, keke: -1, director: 1, jinjin: 1, mumu: -1, xuebo: -1 };

  DO.Dog = function (id, i) {
    const r = DO.rng(1000 + i * 77);
    this.id = id; this.i = i;
    this.S = Object.assign({ id }, DO.BREEDS[id]);
    this.seat = DO.SEATS[id];
    this.chair = CHAIRS[i % CHAIRS.length];
    this.wood = id === 'nana' ? '#b98652' : '#d9a86a';
    this.name = DO.META[id][0]; this.role = DO.META[id][1];
    this.status = 'idle'; this.task = ''; this.progress = 0; this.shown = 0; this.message = ''; this.offline = false;
    this.mode = 'seated';            // seated | walking
    this.ph = r() * 10; this.blinkAt = 1 + r() * 4; this.blinkEnd = 0;
    this.tiltAt = 4 + r() * 8; this.tiltEnd = 0; this.gestAt = 6 + r() * 10; this.gestEnd = 0;
    this.pos = { x: this.seat.x, y: this.seat.y }; // 目前位置（走路時為腳底）
    this.face = 1; this.walkPh = 0; this.moving = false;
    this.rand = r;
  };

  DO.Dog.prototype.apply = function (b) {
    this.status = b.status; this.task = b.task || ''; this.progress = b.progress || 0;
    this.message = b.message || ''; this.name = b.name || this.name; this.role = b.role || this.role; this.offline = !!b.offline;
  };

  // 逐幀更新眨眼／歪頭／手勢計時
  DO.Dog.prototype.tick = function (t) {
    if (t > this.blinkAt) { this.blinkEnd = t + 0.16; this.blinkAt = t + 2 + this.rand() * 4; }
    if (t > this.tiltAt) { this.tiltEnd = t + 1.4; this.tiltAt = t + 6 + this.rand() * 10; }
    if (t > this.gestAt) { this.gestEnd = t + 2.2; this.gestAt = t + 8 + this.rand() * 12; }
  };
  DO.Dog.prototype.pose = function (t) {
    const st = this.offline ? 'off' : this.status, w = st === 'working';
    const blink = t < this.blinkEnd ? 1 : 0;
    const tp = this.tiltEnd - t, tilt = tp > 0 ? Math.sin(Math.min(1, tp / 1.4) * Math.PI) * 0.16 : 0;
    const gp = this.gestEnd - t, gest = gp > 0 ? Math.sin(Math.min(1, gp / 2.2) * Math.PI) : 0;
    return {
      t, st, working: w, blink: blink, tilt: tilt * (this.i % 2 ? 1 : -1), gest,
      breath: Math.sin(t * 2.1 + this.ph), sleep: st === 'resting',
    };
  };

  // 層 1：陰影、椅子、狗（脖子基準座標）
  DO.drawSeatBack = function (c, dog, t) {
    const s = dog.seat, p = dog.pose(t), S = dog.S;
    c.save(); c.translate(s.x, s.y);
    ell(c, 6, 78, 78, 12, 'rgba(70,40,10,.22)', false);
    DO.drawChair(c, dog.chair);
    if (dog.mode === 'seated' && !dog.offline) {
      const off = p.sleep ? 5 : 0;
      const wagAmp = p.st === 'idle' ? 1 : p.working ? 0.35 : 0;
      const wag = Math.sin(t * (p.st === 'idle' ? 13 : 6) + dog.ph) * wagAmp;
      DO.drawTail(c, S, TAIL_SIDE[dog.id] || 1, wag, t);
      DO.drawTorso(c, S, { breath: p.breath * 0.8 });
      // 頭
      c.save();
      c.translate(0, -34 + off + (p.sleep ? 8 : p.breath * 0.6));
      c.rotate(p.sleep ? 0.09 : p.tilt);
      const look = LOOK_RIGHT[dog.id] || 1;
      let lx = 0;
      if (p.working) lx = look * (0.5 + 0.5 * Math.sin(t * 0.7 + dog.ph) * 0.5) * (dog.id === 'maomao' ? 1.2 : 1);
      else if (p.st === 'idle') lx = Math.sin(t * 0.9 + dog.ph) * 1.4;
      if (dog.id === 'maomao' && p.working) c.translate(Math.sin(t * 0.8) * 1.2, 0);
      const earWob = p.st === 'idle' ? Math.sin(t * 5 + dog.ph) * 1.5 : Math.sin(t * 2 + dog.ph) * 0.4;
      DO.drawHead(c, S, { t, blink: p.blink, sleep: p.sleep, lookX: lx, lookY: p.working ? 0.6 : 0, earWob, pant: p.st === 'idle' && Math.sin(t * 3 + dog.ph) > 0.2, happy: p.st === 'idle' });
      c.restore();
      if (p.sleep) zzz(c, t, dog.ph);
    }
    c.restore();
  };

  function zzz(c, t, ph) {
    c.save(); c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = 'rgba(40,30,60,.55)'; c.lineJoin = 'round';
    for (let i = 0; i < 3; i++) {
      const p = ((t * 0.4 + i / 3) % 1), a = Math.sin(p * Math.PI);
      c.font = `bold ${11 + i * 3}px sans-serif`; c.globalAlpha = a;
      const x = 22 + p * 14, y = -52 - p * 26;
      c.strokeText('Z', x, y); c.fillStyle = '#ffffff'; c.fillText('Z', x, y);
    }
    c.restore();
  }

  // 層 2：桌面、道具、前腳、桌子正面
  DO.drawSeatFront = function (c, dog, t) {
    const s = dog.seat, p = dog.pose(t), S = dog.S;
    c.save(); c.translate(s.x, s.y);
    DO.drawDeskTop(c, dog.wood);
    const present = dog.mode === 'seated' && !dog.offline;
    const prop = DO.PROPS[dog.id];
    const o = { t, working: p.working && present };
    if (prop) prop(c, o);
    if (present) {
      if (p.sleep) { // 趴睡：前腳墊在下巴下
        DO.drawPaw(c, S, -11, 33, 0); DO.drawPaw(c, S, 11, 33, 0);
      } else if (p.working) {
        const k = dog.id;
        if (k === 'maomao') { // 畫畫：右手在畫布前揮動
          DO.drawPaw(c, S, -12, 32, 0);
          const px = 20 + Math.sin(t * 3) * 6, py = 22 + Math.cos(t * 4.2) * 4;
          DO.drawPaw(c, S, px, py, 0); line(c, px + 2, py - 2, px + 9, py - 9, '#6b4a2a', 1.8);
        } else if (k === 'director' && p.gest > 0.05) { // 比出取景框
          DO.drawPaw(c, S, -14, 33 - 40 * p.gest, 0); DO.drawPaw(c, S, 14, 33 - 40 * p.gest, 0);
          c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.6; c.strokeRect(-14, 33 - 40 * p.gest - 9, 28, 14 * p.gest + 1);
        } else {
          DO.drawPaw(c, S, -11, 33, Math.max(0, Math.sin(t * 15 + dog.ph)) * 3);
          DO.drawPaw(c, S, 11, 33, Math.max(0, Math.sin(t * 15 + dog.ph + 2)) * 3);
        }
      } else {
        DO.drawPaw(c, S, -11, 33, 0); DO.drawPaw(c, S, 11, 33, 0);
      }
    }
    DO.drawDeskFront(c, dog.wood);
    c.restore();
  };
})();
