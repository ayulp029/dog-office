// 頭上標籤（DOM）：名字、職務、任務、進度條。位置由 main.js 把 3D 頭頂座標投影到螢幕後傳入。
const LW = 112;
const TXT = { working: '', idle: '待命', resting: '休息中', off: '離線' };

export class Labels {
  constructor(host, dogs) {
    this.els = {}; this.boxes = []; this.sel = null;
    dogs.forEach((d) => {
      const e = document.createElement('div');
      e.className = 'label';
      e.innerHTML = '<div class="nm"></div><div class="rl"></div><div class="tk"></div><div class="bar"><div class="fill"></div><div class="pc"></div></div>';
      host.appendChild(e);
      this.els[d.id] = { e, nm: e.children[0], rl: e.children[1], tk: e.children[2], bar: e.children[3], fill: e.children[3].children[0], pc: e.children[3].children[1], last: '', vis: true, pcv: -1 };
    });
  }

  setSelected(id) { this.sel = id; Object.keys(this.els).forEach((k) => this.els[k].e.classList.toggle('sel', k === id)); }

  // pts: id -> { x, y, s, vis, depth }（x,y 是頭頂的螢幕座標，s 是縮放）
  update(dogs, pts) {
    this.boxes.length = 0;
    for (let i = 0; i < dogs.length; i++) {
      const d = dogs[i], o = this.els[d.id], st = d.offline ? 'off' : d.status, p = pts[d.id];
      const key = st + '|' + d.name + '|' + d.role + '|' + d.task;
      if (key !== o.last) {
        o.last = key;
        o.nm.textContent = d.name; o.rl.textContent = d.role;
        o.tk.textContent = st === 'working' ? d.task : TXT[st];
        o.e.className = 'label' + (st === 'working' ? '' : ' ' + (st === 'resting' ? 'rest' : st)) + (this.sel === d.id ? ' sel' : '');
        o.bar.style.display = st === 'working' ? '' : 'none';
      }
      if (st === 'working') {
        const pc = Math.round(d.shown * 2) / 2;
        if (pc !== o.pcv) { o.pcv = pc; o.fill.style.width = pc + '%'; o.pc.textContent = Math.round(d.shown) + '%'; }
      }
      if (p.vis !== o.vis) { o.vis = p.vis; o.e.style.display = p.vis ? '' : 'none'; }
      if (!p.vis) continue;
      const h = (st === 'working' ? 68 : 52) * p.s, w = LW * p.s;
      o.e.style.transform = 'translate(' + (p.x - LW / 2).toFixed(1) + 'px,' + (p.y - 7 * p.s).toFixed(1) + 'px) translateY(-100%) scale(' + p.s.toFixed(3) + ')';
      o.e.style.zIndex = this.sel === d.id ? 9999 : 1000 - Math.round(p.depth * 10);
      this.boxes.push({ id: d.id, x: p.x - w / 2, y: p.y - 7 * p.s - h, w, h, depth: p.depth });
    }
  }

  // 點擊命中哪張標籤（最靠近相機的優先）
  hit(x, y) {
    let best = null;
    this.boxes.forEach((b) => { if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h && (!best || b.depth < best.depth)) best = b; });
    return best ? best.id : null;
  }
}
