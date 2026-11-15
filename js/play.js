// 兩隻待命的狗玩一小段：sniff 互嗅、chase 互相追跑一圈半、ball 小球丟來丟去。
// 固定幾個「場次」重複使用（球與球影也是），玩完就隱藏，渲染迴圈裡不 new 物件。
import * as THREE from 'three';
import { ball as kitBall, mat } from './kit.js';

const SLOTS = 3, SNIFF = 3.4, CHASE = 3.3, TOSS = 0.8, GAP = 0.3, TOSSES = 5;

export function buildPlay(scene, nav, fx, onDone) {
  const slots = [];
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x3c2814, transparent: true, opacity: 0.3, depthWrite: false });
  const shadowGeo = new THREE.CircleGeometry(1, 16).rotateX(-Math.PI / 2);
  for (let i = 0; i < SLOTS; i++) {
    const b = kitBall(scene, 0.2, 0.2, 0.2, mat(['#e8574a', '#4a90c8', '#f2c14e'][i], { roughness: 0.5 }), 0, 0, 0);
    b.castShadow = false; b.receiveShadow = false; b.visible = false;
    const sh = new THREE.Mesh(shadowGeo, shadowMat); sh.scale.setScalar(0.22); sh.visible = false; sh.renderOrder = 1; scene.add(sh);
    slots.push({ on: false, a: null, b: null, kind: '', t: 0, cx: 0, cz: 0, rad: 0, a0: 0, dir: 1, toss: -1, heart: false, ball: b, shadow: sh });
  }

  // 追跑用的圓圈上有沒有東西擋著
  function ringFree(cx, cz, rad) {
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; if (!nav.isFree(cx + Math.cos(a) * rad, cz + Math.sin(a) * rad * 0.8)) return false; }
    return true;
  }

  function begin(a, b, kind) {
    const s = slots.find((x) => !x.on);
    if (!s) return false;
    s.on = true; s.a = a; s.b = b; s.kind = kind; s.t = 0; s.toss = -1; s.heart = false;
    s.cx = (a.pos.x + b.pos.x) / 2; s.cz = (a.pos.z + b.pos.z) / 2;
    s.rad = Math.hypot(a.pos.x - b.pos.x, a.pos.z - b.pos.z) / 2;
    s.a0 = Math.atan2(a.pos.z - s.cz, a.pos.x - s.cx); s.dir = Math.random() < 0.5 ? 1 : -1;
    if (kind === 'sniff') { const dir = a.pos.x < b.pos.x ? -1 : 1; a.react('sniff', SNIFF, dir); b.react('sniff', SNIFF, -dir); }
    return true;
  }
  function finish(s, natural) {
    s.on = false; s.ball.visible = false; s.shadow.visible = false;
    const a = s.a, b = s.b; s.a = s.b = null;
    if (natural) onDone(a, b);
  }
  // 某隻狗被叫回座位：牠那一場直接收掉
  function stop(d) { for (let i = 0; i < SLOTS; i++) { const s = slots[i]; if (s.on && (s.a === d || s.b === d)) finish(s, false); } }

  function update(dt) {
    for (let i = 0; i < SLOTS; i++) {
      const s = slots[i];
      if (!s.on) continue;
      const a = s.a, b = s.b;
      s.t += dt;
      if (s.kind === 'sniff') {
        if (!s.heart && s.t > SNIFF * 0.55) { s.heart = true; fx.hearts(a.id, 1); fx.hearts(b.id, 1); }
        if (s.t >= SNIFF) finish(s, true);
      } else if (s.kind === 'chase') {
        // 繞著中點跑一圈半；後面那隻中途會追近一點，最後兩隻交換位置停下
        const u = Math.min(1, s.t / CHASE), e = u * u * (3 - 2 * u), th = s.a0 + s.dir * e * Math.PI * 3;
        const tb = th + Math.PI - s.dir * 0.9 * Math.sin(Math.PI * u);
        a.pos.x = s.cx + Math.cos(th) * s.rad; a.pos.z = s.cz + Math.sin(th) * s.rad * 0.8;
        b.pos.x = s.cx + Math.cos(tb) * s.rad; b.pos.z = s.cz + Math.sin(tb) * s.rad * 0.8;
        a.moving = b.moving = a.fast = b.fast = u < 1;
        if (!s.heart && u > 0.92) { s.heart = true; fx.hearts(a.id, 1); }
        if (s.t >= CHASE + 0.3) finish(s, true);
      } else {
        const k = Math.floor(s.t / (TOSS + GAP)), u = (s.t - k * (TOSS + GAP)) / TOSS;
        if (k >= TOSSES) { finish(s, true); continue; }
        const from = k % 2 ? b : a, to = k % 2 ? a : b;
        if (k !== s.toss) { s.toss = k; from.react('hop', 0.35); }
        const v = Math.min(1, u), bx = from.pos.x + (to.pos.x - from.pos.x) * v, bz = from.pos.z + (to.pos.z - from.pos.z) * v + 0.25;
        s.ball.position.set(bx, 0.85 + 1.7 * 4 * v * (1 - v), bz);
        s.ball.rotation.z -= dt * 9;
        s.shadow.position.set(bx, 0.07, bz);
        s.ball.visible = s.shadow.visible = true;
        if (u >= 1 && !s.heart) { s.heart = true; to.react('hop', 0.4); if (k === TOSSES - 1) { fx.hearts(a.id, 1); fx.hearts(b.id, 1); } }
        if (u < 1) s.heart = false;
      }
    }
  }
  const active = () => slots.filter((s) => s.on).map((s) => ({ kind: s.kind, a: s.a.id, b: s.b.id, t: s.t }));
  return { begin, stop, update, ringFree, active };
}
