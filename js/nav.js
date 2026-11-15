// 導航格：把辦公室切成 0.5 的格子，家具與牆邊（外擴半個狗身）標成不可走，
// 用 BFS 找路再用視線檢查拉直。所有陣列都預先配置，找路時不 new 物件（只在狗決定新目的地時才算，不是每幀）。
const CELL = 0.5, PAD = 0.5, WALL = 0.6;

export function buildNav(DO) {
  const CFG = DO.CFG, R = CFG.room;
  const NX = Math.round((R.x1 - R.x0) / CELL), NZ = Math.round((R.z1 - R.z0) / CELL), N = NX * NZ;
  const blocked = new Uint8Array(N), occ = new Uint8Array(N), prev = new Int16Array(N), queue = new Int16Array(N);
  const cx = (c) => R.x0 + ((c % NX) + 0.5) * CELL, cz = (c) => R.z0 + (Math.floor(c / NX) + 0.5) * CELL;
  const cellOf = (x, z) => {
    const i = Math.floor((x - R.x0) / CELL), j = Math.floor((z - R.z0) / CELL);
    return i < 0 || j < 0 || i >= NX || j >= NZ ? -1 : j * NX + i;
  };

  // 障礙物（未外擴）：矩形 [x0, x1, z0, z1]、圓 [x, z, r]
  const rects = [], circles = [];
  DO.ORDER.forEach((id) => {
    const s = DO.SEATS[id];
    if (s.boss) return;
    // 桌子＋椅子＋坐在位子上的狗；A 排桌子後面到後牆整塊不走（躲在螢幕後面看不到）
    rects.push([s.x - 1.95, s.x + 1.3, s.row === 'A' ? R.z0 : s.z - 1.85, s.z + 0.55]);
  });
  const A = CFG.rowZ.A;
  rects.push([-3.3, 2.3, R.z0, A + 0.55]);                       // 主管位與 A 排缺口：只有狗管家進出
  rects.push([CFG.cooler.x - 0.45, CFG.cooler.x + 0.45, CFG.cooler.z - 0.45, CFG.cooler.z + 0.9]);   // 飲水機＋紙杯筒
  rects.push([CFG.coffee.x - 0.7, CFG.coffee.x + 0.7, CFG.coffee.z - 1.85, CFG.coffee.z + 1.85]);    // 咖啡吧
  rects.push([R.x0 + 0.05, R.x0 + 0.75, -8.6, -5.2]);            // 書架
  rects.push([R.x1 - 1.3, R.x1 - 0.1, -6.8, -3.6]);              // 沙發
  [[R.x0 + 1.1, R.z0 + 1.0, 0.75], [R.x1 - 1.1, R.z0 + 1.0, 0.75], [R.x0 + 1.0, R.z1 - 0.9, 0.65], [R.x1 - 1.0, R.z1 - 0.9, 0.65],
    [R.x1 - 0.9, -1.4, 0.55]].forEach((c) => circles.push(c));   // 盆栽

  const free = [];
  for (let c = 0; c < N; c++) {
    const x = cx(c), z = cz(c);
    let b = x < R.x0 + WALL || x > R.x1 - WALL || z < R.z0 + WALL || z > R.z1 - WALL;
    for (let i = 0; i < rects.length && !b; i++) { const r = rects[i]; b = x > r[0] - PAD && x < r[1] + PAD && z > r[2] - PAD && z < r[3] + PAD; }
    for (let i = 0; i < circles.length && !b; i++) { const o = circles[i]; b = Math.hypot(x - o[0], z - o[1]) < o[2] + PAD; }
    blocked[c] = b ? 1 : 0;
    if (!b) free.push(c);
  }
  const freeCells = Int16Array.from(free);
  const solid = (c) => c < 0 || blocked[c] || occ[c];
  const isFree = (x, z) => !solid(cellOf(x, z));

  // 離 (x, z) 最近的可走格子；找不到回傳 -1
  function nearestFree(x, z) {
    const c0 = cellOf(DO.clamp(x, R.x0 + 0.01, R.x1 - 0.01), DO.clamp(z, R.z0 + 0.01, R.z1 - 0.01));
    if (!solid(c0)) return c0;
    const i0 = c0 % NX, j0 = Math.floor(c0 / NX);
    let best = -1, bd = 1e9;
    for (let rad = 1; rad <= 8 && best < 0; rad++) {
      for (let j = j0 - rad; j <= j0 + rad; j++) for (let i = i0 - rad; i <= i0 + rad; i++) {
        if (i < 0 || j < 0 || i >= NX || j >= NZ) continue;
        const c = j * NX + i; if (solid(c)) continue;
        const d = Math.hypot(cx(c) - x, cz(c) - z);
        if (d < bd) { bd = d; best = c; }
      }
    }
    return best;
  }

  // 兩點之間有沒有被擋住（每 0.2 取樣）
  function clear(x0, z0, x1, z1) {
    const d = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(d / 0.2));
    for (let k = 0; k <= n; k++) if (solid(cellOf(x0 + (x1 - x0) * k / n, z0 + (z1 - z0) * k / n))) return false;
    return true;
  }

  // 暫時障礙：把停著的狗周圍標起來，別的狗找路時會繞開
  function stamp(x, z, r) {
    const n = Math.ceil(r / CELL);
    const i0 = Math.floor((x - R.x0) / CELL), j0 = Math.floor((z - R.z0) / CELL);
    for (let j = j0 - n; j <= j0 + n; j++) for (let i = i0 - n; i <= i0 + n; i++) {
      if (i < 0 || j < 0 || i >= NX || j >= NZ) continue;
      const c = j * NX + i;
      if (Math.hypot(cx(c) - x, cz(c) - z) < r) occ[c] = 1;
    }
  }
  const clearOcc = () => occ.fill(0);

  // 從 (sx, sz) 走到 (gx, gz)：把轉折點寫進 out（Float32Array，[x0, z0, x1, z1, …]）從 at 開始，回傳寫完後的點數；找不到路回傳 -1
  function plan(sx, sz, gx, gz, out, at) {
    const s = nearestFree(sx, sz), g = nearestFree(gx, gz), max = out.length / 2;
    if (s < 0 || g < 0) return -1;
    prev.fill(-1); prev[g] = g;
    let h = 0, t = 0; queue[t++] = g;
    while (h < t && prev[s] < 0) {
      const c = queue[h++], i = c % NX;
      for (let k = 0; k < 4; k++) {
        const n = k === 0 ? c - 1 : k === 1 ? c + 1 : k === 2 ? c - NX : c + NX;
        if ((k === 0 && i === 0) || (k === 1 && i === NX - 1) || n < 0 || n >= N || prev[n] >= 0 || solid(n)) continue;
        prev[n] = c; queue[t++] = n;
      }
    }
    if (prev[s] < 0) return -1;
    // 拉直：從目前的錨點一路往後看，看得到的最遠那格才記成轉折點
    let n = at, ax = sx, az = sz, c = s, guard = 0;
    while (c !== g && n < max - 1 && guard++ < N) {
      let far = prev[c], q = prev[c], steps = 0;
      while (steps++ < 60) {
        if (clear(ax, az, cx(q), cz(q))) far = q;
        if (q === g) break;
        q = prev[q];
      }
      c = far; ax = cx(c); az = cz(c);
      out[n * 2] = ax; out[n * 2 + 1] = az; n++;
    }
    if (n === at) { out[n * 2] = cx(g); out[n * 2 + 1] = cz(g); n++; }
    // 終點格離真正的目的地很近又沒被擋，就直接走到目的地
    if (c === g && isFree(gx, gz) && Math.hypot(gx - ax, gz - az) < CELL) { out[(n - 1) * 2] = gx; out[(n - 1) * 2 + 1] = gz; }
    return n;
  }

  return { CELL, NX, NZ, blocked, freeCells, cx, cz, cellOf, isFree, nearestFree, clear, stamp, clearOcc, plan, rects, circles };
}
