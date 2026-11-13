// 頭上標籤（DOM）：名字、職務、任務、進度條；避免重疊、不超出畫面
(function () {
  const DO = window.DO;
  const L = (DO.Labels = {});
  const els = {};

  L.init = function (dogs, onTap) {
    const host = document.getElementById('labels');
    dogs.forEach((d) => {
      const e = document.createElement('div');
      e.className = 'label';
      e.innerHTML = '<div class="nm"></div><div class="rl"></div><div class="tk"></div><div class="bar"><div class="fill"></div><div class="pc"></div></div>';
      e.style.pointerEvents = 'auto';
      const tap = (ev) => { ev.stopPropagation(); onTap(d.id); };
      e.addEventListener('click', tap);
      host.appendChild(e);
      els[d.id] = { e, nm: e.children[0], rl: e.children[1], tk: e.children[2], bar: e.children[3], fill: e.children[3].children[0], pc: e.children[3].children[1], last: '' };
    });
  };

  L.setSelected = (id) => Object.keys(els).forEach((k) => els[k].e.classList.toggle('sel', k === id));

  // 更新內容與位置。anchors: id -> {x,y}（頭頂中心）
  L.update = function (dogs, anchors) {
    const W = DO.CFG.W, H = DO.CFG.H, lw = DO.CFG.labelW;
    const boxes = [];
    // 先放固定座位的，再處理走動中的（它會閃避別人）
    const sorted = dogs.slice().sort((a, b) => (a.mode === 'walking') - (b.mode === 'walking'));
    sorted.forEach((d) => {
      const o = els[d.id], st = d.offline ? 'off' : d.status;
      const key = [st, d.name, d.role, d.task].join('|');
      if (key !== o.last) {
        o.last = key;
        o.nm.textContent = d.name; o.rl.textContent = d.role;
        o.tk.textContent = st === 'working' ? d.task : st === 'idle' ? '待命' : st === 'resting' ? '休息中' : '離線';
        o.e.className = 'label' + (st === 'resting' ? ' rest' : st === 'idle' ? ' idle' : st === 'off' ? ' off' : '') + (o.e.classList.contains('sel') ? ' sel' : '');
        o.bar.style.display = st === 'working' ? '' : 'none';
      }
      if (st === 'working') {
        o.fill.style.width = d.shown.toFixed(1) + '%';
        o.pc.textContent = Math.round(d.shown) + '%';
      }
      const h = st === 'working' ? 66 : 50;
      const a = anchors[d.id];
      let x = a.x - lw / 2, y = a.y - h - 6;
      const place = (px, py) => ({ x: DO.clamp(px, 4, W - lw - 4), y: DO.clamp(py, 40, H - h - 4), w: lw, h });
      let box = place(x, y);
      if (d.mode === 'walking') { // 走道標籤：放在地毯帶，站在狗的側邊，不蓋桌子與狗頭
        const side = d.pos.x < DO.CFG.W / 2 ? 1 : -1;
        const bx = d.pos.x + side * (lw / 2 + 42) - lw / 2;
        const tries = [[0, 0], [0, 12], [0, -4], [side * 60, 0]];
        for (const [dx, dy] of tries) {
          const b = place(bx + dx, 354 + dy);
          if (!boxes.some((q) => hit(b, q))) { box = b; break; }
        }
      }
      boxes.push(box);
      o.e.style.transform = `translate(${box.x.toFixed(1)}px, ${box.y.toFixed(1)}px)`;
      o.e.style.zIndex = d.mode === 'walking' ? 6 : 5;
    });
  };
  function hit(a, b) { return a.x < b.x + b.w + 2 && a.x + a.w + 2 > b.x && a.y < b.y + b.h + 2 && a.y + a.h + 2 > b.y; }
})();
