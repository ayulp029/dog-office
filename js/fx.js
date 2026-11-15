// 互動特效（DOM，疊在標籤上面、不吃事件）：「汪！」泡泡、愛心、餅乾屑、飛向狗的骨頭餅乾。
// 固定數量的元素重複使用，用完就隱藏；位置每幀跟著 main.js 投影好的狗頭／腳螢幕座標走。
const N = 30;
const CLS = { woof: 'fx fx-woof', heart: 'fx fx-heart', crumb: 'fx fx-crumb', bone: 'fx fx-bone' };

export class Fx {
  constructor(host, pts) {
    this.pts = pts; this.items = []; this.last = {};   // last[id] = 最近一次特效的種類與時間（測試用）
    for (let i = 0; i < N; i++) {
      const el = document.createElement('div');
      el.className = 'fx'; el.style.display = 'none';
      host.appendChild(el);
      this.items.push({ el, on: false, kind: '', id: '', t: 0, life: 1, x0: 0, y0: 0, vx: 0, vy: 0, rot: 0, done: null });
    }
  }
  spawn(kind, id, life, delay) {
    let it = null;
    for (let i = 0; i < N && !it; i++) if (!this.items[i].on) it = this.items[i];
    if (!it) return null;
    it.on = true; it.kind = kind; it.id = id; it.t = -(delay || 0); it.life = life; it.done = null;
    it.x0 = it.y0 = it.vx = it.vy = it.rot = 0;
    it.el.className = CLS[kind]; it.el.textContent = '';
    this.last[id] = { kind, at: performance.now() };
    return it;
  }
  // 頭旁邊的叫聲泡泡
  woof(id, text) {
    for (let i = 0; i < N; i++) { const o = this.items[i]; if (o.on && o.kind === 'woof' && o.id === id) this.free(o); }   // 連點時只留最新的一顆
    const it = this.spawn('woof', id, 0.95, 0);
    if (it) it.el.textContent = text || '汪！';
  }
  hearts(id, n, delay) {
    for (let k = 0; k < n; k++) {
      const it = this.spawn('heart', id, 1.25, (delay || 0) + k * 0.16);
      if (!it) return;
      it.x0 = (Math.random() - 0.5) * 50; it.vx = (Math.random() - 0.5) * 36; it.vy = -(58 + Math.random() * 30); it.rot = (Math.random() - 0.5) * 30;
    }
  }
  crumbs(id, n) {
    for (let k = 0; k < n; k++) {
      const it = this.spawn('crumb', id, 0.75, Math.random() * 0.5);
      if (!it) return;
      it.vx = (Math.random() - 0.5) * 150; it.vy = -(30 + Math.random() * 90); it.rot = Math.random() * 360;
    }
  }
  // 骨頭餅乾從螢幕上的 (sx, sy) 飛向狗「現在」的嘴邊，到了呼叫 done
  bone(id, sx, sy, done) {
    const it = this.spawn('bone', id, 0.7, 0);
    if (!it) { if (done) done(); return; }
    it.x0 = sx; it.y0 = sy; it.done = done;
  }
  free(it) { it.on = false; it.el.style.display = 'none'; it.done = null; }
  count(kind) { let n = 0; for (let i = 0; i < N; i++) if (this.items[i].on && this.items[i].kind === kind) n++; return n; }

  update(dt) {
    for (let i = 0; i < N; i++) {
      const it = this.items[i];
      if (!it.on) continue;
      it.t += dt;
      const p = this.pts[it.id], st = it.el.style;
      if (it.t >= it.life) { const f = it.done; this.free(it); if (f) f(); continue; }
      if (it.t < 0 || !p || (!p.vis && it.kind !== 'bone')) { st.display = 'none'; continue; }
      const u = it.t / it.life, s = p.s, mx = p.x + (p.fx - p.x) * 0.38, my = p.y + (p.fy - p.y) * 0.38;   // 嘴巴大概在頭頂往下 38%
      let x, y, sc = s, rot = 0, op = 1;
      if (it.kind === 'woof') {
        const pop = u < 0.2 ? u / 0.2 : 1; sc = s * (0.5 + 0.5 * pop + 0.18 * Math.sin(Math.PI * Math.min(1, u / 0.35)));
        x = p.x + 60 * s; y = p.y - 44 * s - 8 * s * u; rot = -8; op = u > 0.75 ? (1 - u) / 0.25 : 1;
      } else if (it.kind === 'heart') {
        x = p.x + (it.x0 + it.vx * it.t + 7 * Math.sin(it.t * 7 + it.rot)) * s; y = p.y + (14 + it.vy * it.t) * s;
        sc = s * (0.55 + 0.6 * Math.min(1, u * 4)); rot = it.rot; op = u > 0.6 ? (1 - u) / 0.4 : 1;
      } else if (it.kind === 'crumb') {
        x = mx + it.vx * it.t * s; y = my + (it.vy * it.t + 320 * it.t * it.t) * s; rot = it.rot + it.t * 500; op = 1 - u * u;
      } else {
        const e = u * u * (3 - 2 * u);
        x = it.x0 + (mx - it.x0) * e; y = it.y0 + (my - it.y0) * e - 110 * Math.sin(Math.PI * u); rot = -30 + 540 * u; sc = 1.25 + (s * 0.85 - 1.25) * e;
      }
      st.display = 'block';
      st.opacity = op.toFixed(2);
      st.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%) rotate(' + rot.toFixed(0) + 'deg) scale(' + sc.toFixed(3) + ')';
    }
  }
}
