// 詳情卡：點狗（滑鼠或觸控）開啟，點空白或 × 關閉
(function () {
  const DO = window.DO;
  const Card = (DO.Card = { id: null });
  let el, body;
  const STXT = { working: '工作中', idle: '待命', resting: '休息中', off: '離線' };

  Card.init = function (getDog) {
    el = document.getElementById('card'); body = document.getElementById('card-body');
    document.getElementById('card-close').addEventListener('click', (e) => { e.stopPropagation(); Card.close(); });
    el.addEventListener('click', (e) => e.stopPropagation());
    Card.getDog = getDog;
  };
  Card.open = function (id) { Card.id = id; el.hidden = false; Card.render(); DO.Labels.setSelected(id); };
  Card.close = function () { Card.id = null; if (el) el.hidden = true; DO.Labels.setSelected(null); };

  Card.render = function () {
    if (!Card.id) return;
    const d = Card.getDog(Card.id); if (!d) return;
    const st = d.offline ? 'off' : d.status;
    const r = st === 'working' ? `<div class="c-row">任務：${esc(d.task)}</div>
      <div class="c-bar"><div class="c-fill" style="width:${d.shown.toFixed(1)}%"></div><div class="c-pc">${Math.round(d.shown)}%</div></div>` : '';
    const msg = d.message || (st === 'off' ? '目前沒有收到狀態' : st === 'resting' ? '休息一下，馬上回來' : st === 'idle' ? '待命中，隨時可以開工' : '專心工作中');
    body.innerHTML = `<div><div class="c-name">${esc(d.name)}</div><div class="c-role">${esc(d.role)} ·
      <span class="c-st ${st === 'working' ? '' : st === 'off' ? 'off' : st}">${STXT[st]}</span></div></div>
      <div>${r || '<div class="c-row">目前沒有進行中的任務</div>'}</div>
      <div class="c-msg">💬 ${esc(msg)}</div>`;
    // 固定在畫面底部中央（桌子下方的空地），不擋住任何一隻狗
    el.style.left = '150px'; el.style.top = '690px';
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
})();
