// 詳情卡：點狗（滑鼠或觸控）開啟，點空白或 × 關閉。左邊放真實頭像 assets/avatars/<id>.png
const STXT = { working: '工作中', idle: '待命', resting: '休息中', off: '離線' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class Card {
  constructor(getDog, onChange) {
    this.id = null; this.key = ''; this.getDog = getDog; this.onChange = onChange;
    this.el = document.getElementById('card'); this.body = document.getElementById('card-body');
    document.getElementById('card-close').addEventListener('click', (e) => { e.stopPropagation(); this.close(); });
  }
  open(id) { if (!this.getDog(id)) return; this.id = id; this.key = ''; this.el.hidden = false; this.render(); this.onChange(id); }
  close() { if (!this.id) return; this.id = null; this.el.hidden = true; this.onChange(null); }
  toggle(id) { if (this.id === id) this.close(); else this.open(id); }

  // 每幀呼叫：內容有變才重排 DOM，進度條只改寬度
  render() {
    if (!this.id) return;
    const d = this.getDog(this.id), st = d.offline ? 'off' : d.status;
    const key = [d.id, st, d.name, d.role, d.task, d.message].join('|');
    if (key !== this.key) {
      this.key = key;
      const msg = d.message || (st === 'off' ? '目前沒有收到狀態' : st === 'resting' ? '休息一下，馬上回來' : st === 'idle' ? '待命中，隨時可以開工' : '專心工作中');
      const task = st === 'working'
        ? `<div class="c-row">任務：${esc(d.task)}</div><div class="c-bar"><div class="c-fill"></div><div class="c-pc"></div></div>`
        : '<div class="c-row">目前沒有進行中的任務</div>';
      this.body.innerHTML = `<img class="c-av" src="assets/avatars/${d.id}.png" alt="${esc(d.name)}的頭像" width="84" height="84">
        <div class="c-main"><div class="c-head"><span class="c-name">${esc(d.name)}</span><span class="c-role">${esc(d.role)}</span>
        <span class="c-st ${st === 'working' ? '' : st}">${STXT[st]}</span></div>${task}<div class="c-msg">💬 ${esc(msg)}</div></div>`;
      this.fill = this.body.querySelector('.c-fill'); this.pc = this.body.querySelector('.c-pc');
    }
    if (this.fill) { this.fill.style.width = d.shown.toFixed(1) + '%'; this.pc.textContent = Math.round(d.shown) + '%'; }
  }
}
