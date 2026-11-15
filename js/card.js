// 詳情卡：點狗（滑鼠或觸控）開啟，點空白或 × 關閉。左邊放真實頭像 assets/avatars/<id>.png；
// 下面一排是親密度（摸頭次數、餅乾數）與「摸摸頭」「餵餅乾」按鈕（按鈕是固定的 DOM，事件在 interact.js）
const STXT = { working: '工作中', waiting: '等待中', idle: '待命', resting: '休息中', off: '離線' };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class Card {
  // getLove(id) 回傳「摸頭 3 次・餅乾 2 塊」這種字串；fmtTime(ms) 回傳台北時間字串
  constructor(getDog, onChange, getLove, fmtTime) {
    this.getLove = getLove; this.fmtTime = fmtTime; this.loveKey = '';
    this.act = document.getElementById('card-act'); this.love = document.getElementById('card-love');
    this.id = null; this.info = false; this.key = ''; this.getDog = getDog; this.onChange = onChange;
    this.el = document.getElementById('card'); this.body = document.getElementById('card-body');
    document.getElementById('card-close').addEventListener('click', (e) => { e.stopPropagation(); this.close(); });
  }
  open(id) { if (!this.getDog(id)) return; this.info = false; this.id = id; this.key = ''; this.loveKey = ''; this.act.hidden = false; this.el.hidden = false; this.render(); this.onChange(id); }
  close() { if (!this.id && !this.info) return; this.id = null; this.info = false; this.el.hidden = true; this.onChange(null); }
  // 非狗的資訊卡（用量儀表板）：共用同一張卡，所以不會跟狗的卡同時出現
  openInfo(html) { this.id = null; this.info = true; this.fill = null; this.act.hidden = true; this.onChange(null); this.el.hidden = false; this.setInfo(html); }
  setInfo(html) { if (this.info) this.body.innerHTML = html; }
  toggle(id) { if (this.id === id) this.close(); else this.open(id); }

  // 每幀呼叫：內容有變才重排 DOM，進度條只改寬度
  render() {
    if (!this.id) return;
    const d = this.getDog(this.id), st = d.offline ? 'off' : d.status;
    const key = [d.id, st, d.name, d.role, d.task, d.message, d.updatedAt].join('|');
    if (key !== this.key) {
      this.key = key;
      const msg = d.message || (st === 'off' ? '目前沒有收到狀態' : st === 'resting' ? '休息一下，馬上回來' : st === 'idle' ? '待命中，隨時可以開工' : st === 'waiting' ? '等對方回覆，暫時沒辦法往下做' : '專心工作中');
      const task = st === 'working'
        ? `<div class="c-row">任務：${esc(d.task)}</div><div class="c-bar"><div class="c-fill"></div><div class="c-pc"></div></div>`
        : st === 'waiting' ? `<div class="c-row">等待：${esc(d.task)}</div>`
        : '<div class="c-row">目前沒有進行中的任務</div>';
      this.body.innerHTML = `<img class="c-av" src="assets/avatars/${d.id}.png" alt="${esc(d.name)}的頭像" width="84" height="84">
        <div class="c-main"><div class="c-head"><span class="c-name">${esc(d.name)}</span><span class="c-role">${esc(d.role)}</span>
        <span class="c-st ${st === 'working' ? '' : st}">${STXT[st]}</span></div>${task}<div class="c-row c-upd">最後更新：${d.updatedAt && !d.offline ? esc(this.fmtTime(d.updatedAt)) + '（台北時間）' : '沒有資料'}</div><div class="c-msg">💬 ${esc(msg)}</div></div>`;
      this.fill = this.body.querySelector('.c-fill'); this.pc = this.body.querySelector('.c-pc');
    }
    const love = this.getLove(d.id);
    if (love !== this.loveKey) { this.loveKey = love; this.love.textContent = love; }
    if (this.fill) { this.fill.style.width = d.shown.toFixed(1) + '%'; this.pc.textContent = Math.round(d.shown) + '%'; }
  }
}
