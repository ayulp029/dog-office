// 起身走路：沿座位間的走道縫隙到飲水機／咖啡機，停一下再走回來（一次只有 1 隻）
(function () {
  const DO = window.DO;
  const SPEED = 78, SCALE = 1.12, AISLE_Y = 442;

  DO.startWalk = function (dog, dest, opts) {
    const s = dog.seat, C = DO.CFG;
    const lane = s.y + 24;
    const gx = s.idx < 6 ? s.x + 69 : s.x - 69;
    const target = dest === 'cooler' ? C.cooler : C.coffee;
    const tx = gx < target.x ? target.x - 68 : target.x + 68;
    const out = [{ x: s.x, y: lane }, { x: gx, y: lane }, { x: gx, y: AISLE_Y }, { x: tx, y: AISLE_Y }];
    dog.walk = { out, i: 1, phase: 'out', wait: 0, dest, hold: (opts && opts.hold) || 3.6, pts: out };
    dog.mode = 'walking';
    dog.pos = { x: s.x, y: lane };
    dog.moving = true;
    if (opts && opts.arrived) { // 測試用：直接站在機器旁
      dog.pos = { x: tx, y: AISLE_Y }; dog.walk.phase = 'wait'; dog.walk.i = out.length; dog.moving = false; dog.face = tx > target.x ? -1 : 1;
    }
  };

  DO.updateWalk = function (dog, dt) {
    const w = dog.walk; if (!w) return;
    if (w.phase === 'wait') {
      w.wait += dt; dog.moving = false;
      if (w.wait >= w.hold) { w.phase = 'back'; w.pts = w.out.slice().reverse(); w.i = 1; dog.moving = true; }
      return;
    }
    const tgt = w.pts[w.i], dx = tgt.x - dog.pos.x, dy = tgt.y - dog.pos.y, d = Math.hypot(dx, dy);
    const step = SPEED * dt;
    if (Math.abs(dx) > 1) dog.face = dx > 0 ? 1 : -1;
    dog.walkPh += dt * 11;
    if (d <= step) {
      dog.pos.x = tgt.x; dog.pos.y = tgt.y; w.i++;
      if (w.i >= w.pts.length) {
        if (w.phase === 'out') { w.phase = 'wait'; w.wait = 0; dog.moving = false; dog.face = (w.dest === 'cooler' ? DO.CFG.cooler.x : DO.CFG.coffee.x) > dog.pos.x ? 1 : -1; }
        else { dog.mode = 'seated'; dog.walk = null; dog.moving = false; dog.pos = { x: dog.seat.x, y: dog.seat.y }; }
      }
    } else { dog.pos.x += dx / d * step; dog.pos.y += dy / d * step; }
  };

  DO.drawWalker = function (c, dog, t) {
    const p = dog.pos;
    c.save(); c.translate(p.x, p.y);
    ell2(c);
    c.scale(dog.face * SCALE, SCALE);
    DO.drawSide(c, dog.S, { walk: dog.walkPh, moving: dog.moving, t, blink: (dog.pose(t).blink) });
    // 手上的杯子
    if (dog.walk && dog.walk.phase !== 'out' && dog.walk.i >= 1) {
      const sip = dog.moving ? 0 : Math.max(0, Math.sin(t * 2.4)) * 4;
      const cx = dog.S.side.len * 0.5 + dog.S.side.sn + 6;
      DO.rrect(c, cx - 4, -dog.S.side.leg - dog.S.side.bh * 0.5 - 4 - sip, 8, 9, 2, dog.walk.dest === 'cooler' ? '#cfeaff' : '#fff', DO.OUT, 1.1);
    }
    c.restore();
  };
  function ell2(c) { DO.ell(c, 0, 0, 30, 6, 'rgba(70,40,10,.25)', false); }

  // 標籤錨點：頭頂中心
  DO.headAnchor = function (dog) {
    if (dog.mode === 'walking') {
      const s = dog.S.side;
      return { x: dog.pos.x, y: dog.pos.y - (s.leg + s.bh + s.hr * 1.7) * SCALE - 8 };
    }
    return { x: dog.seat.x, y: dog.seat.y - DO.CFG.labelGap + 2 + (dog.status === 'resting' ? 28 : 0) };
  };
})();
