// 閒逛：只有「待命」（含過期變待命）的狗會離開座位在辦公室裡走動，偶爾找另一隻一起玩（play.js）。
// 狀態一變成工作中／等待中／休息中／離線，就小跑步回座位並留在座位。
// 每隻狗的 d.r.st：seat 在座位、walk 走向目的地、pause 停下來看看、meet 等玩伴走過來、play 玩耍中、home 回座位、hold 被測試／截圖固定住
import { buildNav } from './nav.js';
import { buildPlay } from './play.js';

const WALK = 1.9, RUN = 3.5, MAXP = 48;
const rnd = (a, b) => a + Math.random() * (b - a);

export function buildRoam(DO, dogs, scene, fx, opt) {
  const CFG = DO.CFG, nav = buildNav(DO);
  const api = { nav, speed: 1, maxAway: 8, maxPlay: 2, playChance: 0.4 };
  const byId = {};
  const play = buildPlay(scene, nav, fx, (a, b) => { settle(a); settle(b); });

  dogs.forEach((d, i) => {
    const s = d.seat;
    byId[d.id] = d; d.ix = i;
    // 門口：離開座位先直走到這裡再開始找路；狗管家要先穿過 A 排缺口
    d.door = { x: d.home.x, z: s.aisleZ != null ? s.aisleZ : s.z + CFG.aisle - 0.4 };
    d.r = { st: 'seat', timer: rnd(5, 24), path: new Float32Array(MAXP * 2), n: 0, i: 0, trips: 0, maxTrips: 2, mate: null, lead: false, kind: '', gx: 0, gz: 0, yieldT: 0, noYield: 0 };
  });
  // 一開始就挑幾隻很快出門，預設總覽不必等很久就看得到有狗在走
  dogs.slice().sort(() => Math.random() - 0.5).slice(0, opt && opt.eager ? 7 : 4).forEach((d, k) => { d.r.timer = opt && opt.eager ? 0.05 + k * 0.15 : 0.4 + k * 0.9; });

  const canRoam = (d) => d.status === 'idle' && !d.offline;
  const still = (st) => st === 'pause' || st === 'meet' || st === 'play' || st === 'hold';

  // 找路：停著的其他狗當成暫時障礙；真的繞不過去就當牠們不存在
  function route(d, sx, sz, gx, gz, at, skip) {
    nav.clearOcc();
    for (let i = 0; i < dogs.length; i++) { const o = dogs[i]; if (o !== d && o !== skip && still(o.r.st)) nav.stamp(o.pos.x, o.pos.z, 0.9); }
    let n = nav.plan(sx, sz, gx, gz, d.r.path, at);
    nav.clearOcc();
    if (n < 0) n = nav.plan(sx, sz, gx, gz, d.r.path, at);
    return n;
  }
  // 從現在的位置（在座位上就先走到門口）走到 (gx, gz)
  function walkTo(d, gx, gz, skip) {
    const r = d.r, p = r.path, seated = r.st === 'seat';
    if (seated) { p[0] = d.door.x; p[1] = d.door.z; }
    const n = seated ? route(d, d.door.x, d.door.z, gx, gz, 1, skip) : route(d, d.pos.x, d.pos.z, gx, gz, 0, skip);
    if (n < 0) return false;
    r.n = n; r.i = 0; r.gx = p[(n - 1) * 2]; r.gz = p[(n - 1) * 2 + 1]; r.st = 'walk'; r.yieldT = 0;
    return true;
  }
  function pickTarget(d) {
    for (let k = 0; k < 12; k++) {
      let x, z;
      if (Math.random() < 0.12) { const s = CFG[Math.random() < 0.5 ? 'cooler' : 'coffee'].stand; x = s.x; z = s.z; }   // 偶爾去飲水機／咖啡機晃晃
      else { const c = nav.freeCells[Math.floor(Math.random() * nav.freeCells.length)]; x = nav.cx(c); z = nav.cz(c); }
      if (z < -3.8 || Math.hypot(x - d.pos.x, z - d.pos.z) < 2.5) continue;
      let ok = true;
      for (let i = 0; i < dogs.length && ok; i++) {
        const o = dogs[i]; if (o === d || o.r.st === 'seat') continue;
        ok = Math.hypot(o.pos.x - x, o.pos.z - z) > 1.9 && Math.hypot(o.r.gx - x, o.r.gz - z) > 1.9;
      }
      if (ok && walkTo(d, x, z)) return true;
    }
    return false;
  }
  function leave(d) {
    if (!pickTarget(d)) return false;
    d.r.trips = 0; d.r.maxTrips = 1 + Math.floor(Math.random() * 3);
    return true;
  }
  // 放開玩伴（對方停在原地一下再繼續逛）
  function release(d) {
    const r = d.r, o = r.mate;
    play.stop(d);
    r.mate = null; r.lead = false;
    if (!o) return;
    o.r.mate = null; o.r.lead = false;
    if (o.r.st === 'meet' || o.r.st === 'play') { o.r.st = 'pause'; o.r.timer = rnd(0.6, 1.6); }
  }
  function settle(d) { const r = d.r; r.mate = null; r.lead = false; r.st = 'pause'; r.timer = rnd(1.5, 3.5); r.trips++; r.gx = d.pos.x; r.gz = d.pos.z; }
  function goHome(d) {
    const r = d.r, p = r.path;
    release(d);
    if (r.st === 'seat') return;
    let n = 0;
    if (Math.hypot(d.pos.x - d.home.x, d.pos.z - d.home.z) > 1.7) {
      n = route(d, d.pos.x, d.pos.z, d.door.x, d.door.z, 0, null);
      if (n < 0) n = 0;
      p[n * 2] = d.door.x; p[n * 2 + 1] = d.door.z; n++;
    }
    p[n * 2] = d.home.x; p[n * 2 + 1] = d.home.z; n++;
    r.n = n; r.i = 0; r.st = 'home'; r.gx = d.home.x; r.gz = d.home.z; r.noYield = 0; r.yieldT = 0;
  }
  function playCount() { let n = 0; for (let i = 0; i < dogs.length; i++) if (dogs[i].r.lead) n++; return n; }
  // 找一隻也在外面閒逛的狗，走到牠旁邊玩：sniff 互嗅、chase 追跑一圈、ball 玩球
  function tryPlay(d, mate, kind) {
    let o = mate || null;
    if (!o) {
      let seen = 0;
      for (let i = 0; i < dogs.length; i++) {
        const c = dogs[i];
        if (c === d || !canRoam(c) || c.r.mate || c.hold > 0 || (c.r.st !== 'pause' && c.r.st !== 'walk')) continue;
        if (Math.hypot(c.pos.x - d.pos.x, c.pos.z - d.pos.z) > 16) continue;
        if (Math.random() * ++seen < 1) o = c;
      }
    }
    if (!o) return false;
    const q = Math.random();
    kind = kind || (q < 0.4 ? 'sniff' : q < 0.7 ? 'chase' : 'ball');
    const first = Math.random() < 0.5 ? 1 : -1;
    for (let pass = 0; pass < 2; pass++) {
      const off = kind === 'sniff' ? 1.25 : kind === 'chase' ? 2.4 : 2.9;
      for (let s = 0; s < 2; s++) {
        const sx = s ? -first : first, gx = o.pos.x + sx * off, gz = o.pos.z;
        if (!nav.isFree(gx, gz) || !nav.clear(o.pos.x, o.pos.z, gx, gz)) continue;
        if (kind === 'chase' && !play.ringFree(o.pos.x + sx * off / 2, gz, off / 2)) continue;
        const st0 = o.r.st;
        o.r.st = 'meet';                       // 先讓對方停下來，找路時才不會把牠當障礙繞太遠
        if (!walkTo(d, gx, gz, o)) { o.r.st = st0; continue; }
        o.r.mate = d; o.r.timer = 16; o.r.gx = o.pos.x; o.r.gz = o.pos.z;
        d.r.mate = o; d.r.lead = true; d.r.kind = kind;
        return true;
      }
      kind = 'sniff';                          // 空間不夠追跑／丟球就改成互嗅
    }
    return false;
  }
  function arrive(d) {
    const r = d.r, o = r.mate;
    if (o) {
      if (o.r.st === 'meet' && o.r.mate === d && Math.hypot(o.pos.x - d.pos.x, o.pos.z - d.pos.z) < 3.6 && play.begin(d, o, r.kind)) { r.st = o.r.st = 'play'; return; }
      release(d);
    }
    r.st = 'pause'; r.timer = rnd(2, 6); r.trips++;
  }
  function next(d) {
    const r = d.r;
    if (r.trips >= r.maxTrips) return goHome(d);
    if (playCount() < api.maxPlay && Math.random() < api.playChance && tryPlay(d)) return;
    if (!pickTarget(d)) goHome(d);
  }
  // 沿路徑前進；走完回傳 true。前面有優先權較高（編號較小）的狗正在走就讓一下，最多讓 1.2 秒
  function step(d, dt, speed) {
    const r = d.r, p = r.path;
    if (d.hold > 0) return false;
    if (r.i >= r.n) return true;
    if (r.noYield > 0) r.noYield -= dt;
    else {
      const tx = p[r.i * 2] - d.pos.x, tz = p[r.i * 2 + 1] - d.pos.z;
      for (let i = 0; i < d.ix; i++) {
        const o = dogs[i];
        if (!o.moving || !o.away) continue;
        const ox = o.pos.x - d.pos.x, oz = o.pos.z - d.pos.z;
        if (ox * ox + oz * oz < 1.3 && ox * tx + oz * tz > 0) {
          r.yieldT += dt;
          if (r.yieldT > 1.2) { r.yieldT = 0; r.noYield = 2.5; }
          return false;
        }
      }
    }
    let left = speed * dt;
    d.moving = true; d.fast = speed > 3;
    while (left > 0) {
      const dx = p[r.i * 2] - d.pos.x, dz = p[r.i * 2 + 1] - d.pos.z, dist = Math.hypot(dx, dz);
      if (dist > left) { d.pos.x += (dx / dist) * left; d.pos.z += (dz / dist) * left; return false; }
      d.pos.x = p[r.i * 2]; d.pos.z = p[r.i * 2 + 1]; left -= dist;
      if (++r.i >= r.n) return true;
    }
    return false;
  }

  // 每幀呼叫一次（在 Dog.update 之前）
  api.update = (dt) => {
    dt *= api.speed;
    let away = 0;
    for (let i = 0; i < dogs.length; i++) if (dogs[i].r.st !== 'seat') away++;
    for (let i = 0; i < dogs.length; i++) {
      const d = dogs[i], r = d.r, can = canRoam(d);
      if (d.hold > 0) d.hold -= dt;
      d.moving = false; d.fast = false;
      if (r.st === 'seat') {
        if (can && (r.timer -= dt) <= 0) {
          if (away < api.maxAway && d.hold <= 0 && leave(d)) away++;
          else r.timer = rnd(2, 6);
        }
      } else if (r.st === 'home') {
        if (step(d, dt, can ? WALK : RUN)) { r.st = 'seat'; r.timer = rnd(8, 24); d.pos.x = d.home.x; d.pos.z = d.home.z; }
      } else if (r.st === 'hold') { /* 固定住，不動 */ }
      else if (!can) goHome(d);
      else if (r.st === 'walk') { if (step(d, dt, WALK)) arrive(d); }
      else if (r.st === 'pause') { if ((r.timer -= dt) <= 0 && d.hold <= 0) next(d); }
      else if (r.st === 'meet') { if ((r.timer -= dt) <= 0) { const o = r.mate; release(d); if (o) release(o); r.st = 'pause'; r.timer = 1; } }
      d.away = r.st !== 'seat';
    }
    play.update(dt);
  };

  // ── 測試／截圖 hook ──
  api.nudge = (id) => { const d = byId[id]; return !!d && d.r.st === 'seat' && canRoam(d) && leave(d); };   // 立刻出門
  api.home = (id) => { if (byId[id]) goHome(byId[id]); };
  api.state = (id) => { const d = byId[id]; return { st: d.r.st, x: d.pos.x, z: d.pos.z, away: d.r.st !== 'seat', moving: d.moving, fromHome: Math.hypot(d.pos.x - d.home.x, d.pos.z - d.home.z) }; };
  api.awayIds = () => dogs.filter((d) => d.r.st !== 'seat').map((d) => d.id);
  // 把狗固定在某個點（?shot=cooler 用）
  api.hold = (id, x, z) => { const d = byId[id]; release(d); d.pos.x = x; d.pos.z = z; d.r.st = 'hold'; d.r.gx = x; d.r.gz = z; d.away = true; };
  // 讓兩隻待命的狗直接在 (x, z) 附近玩起來
  api.stage = (kind, a, b, x, z) => {
    const A = byId[a], B = byId[b], off = kind === 'sniff' ? 1.25 : kind === 'chase' ? 2.4 : 2.9;
    if (!A || !B || !canRoam(A) || !canRoam(B)) return false;
    release(A); release(B);
    A.pos.x = x - off / 2; B.pos.x = x + off / 2; A.pos.z = B.pos.z = z;
    if (!play.begin(A, B, kind)) return false;
    A.r.st = B.r.st = 'play'; A.r.mate = B; B.r.mate = A; A.r.lead = true; A.r.kind = kind; A.away = B.away = true;
    return true;
  };
  api.playing = () => play.active();
  api.blockedAt = (x, z) => !nav.isFree(x, z);
  return api;
}
