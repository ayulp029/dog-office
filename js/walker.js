// 走路：座位 → 前方走道（座位間縫隙）→ 側邊走道 → 飲水機／咖啡機，停一下再原路走回。
// 路徑只走走道，不會穿過桌子；同時只有一隻在走（由 main.js 排程）。
const SPEED = 2.7;

export function startWalk(dog, destKey, CFG, opt) {
  const D = CFG[destKey].stand, a = dog.seat.z + CFG.aisle, h = dog.home;
  const pts = [[h.x, h.z], [h.x, a], [D.x, a], [D.x, D.z]].filter((p, i, l) => i === 0 || Math.hypot(p[0] - l[i - 1][0], p[1] - l[i - 1][1]) > 0.01);
  dog.walk = { pts, i: 1, dir: 1, phase: 'go', dest: destKey, hold: opt && opt.hold != null ? opt.hold : 3.5 };
  dog.mode = 'walking';
  if (opt && opt.arrived) {
    const e = pts[pts.length - 1];
    dog.pos.x = e[0]; dog.pos.z = e[1]; dog.walk.phase = 'wait'; dog.walk.i = pts.length - 1;
  }
}

export function updateWalk(dog, dt) {
  const w = dog.walk; if (!w) return;
  if (w.phase === 'wait') {
    w.hold -= dt;
    if (w.hold <= 0) { w.phase = 'back'; w.dir = -1; w.i = w.pts.length - 2; }
    return;
  }
  let step = SPEED * dt;
  while (step > 0) {
    const p = w.pts[w.i], dx = p[0] - dog.pos.x, dz = p[1] - dog.pos.z, d = Math.hypot(dx, dz);
    if (d > step) { dog.pos.x += (dx / d) * step; dog.pos.z += (dz / d) * step; return; }
    dog.pos.x = p[0]; dog.pos.z = p[1]; step -= d; w.i += w.dir;
    if (w.i >= w.pts.length) { w.phase = 'wait'; return; }
    if (w.i < 0) { dog.mode = 'seat'; dog.walk = null; return; }
  }
}
