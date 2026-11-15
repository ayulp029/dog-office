// 互動：點一下狗（汪！＋詳情卡）、長按摸摸頭、詳情卡上的「摸摸頭」「餵餅乾」，以及每隻狗的親密度計數（localStorage）。
// 點擊判斷沿用原本的規則：短觸（< 700ms）而且幾乎沒移動（滑鼠 ≤ 8px、觸控／筆 ≤ 28px）才是點一下，其餘是拖曳旋轉。
import { Sound } from './sound.js?v=20261115c';

const KEY = 'dog-office-affection';   // { "<id>": { "pet": 次數, "treat": 塊數 } }
const MOVE_MOUSE = 8, MOVE_TOUCH = 28, TAP_MS = 700, LONG_MS = 550;   // 手指輕點常抖超過 8px，touch／pen 放寬到 28px
const moveLimit = (t) => (t === 'mouse' ? MOVE_MOUSE : MOVE_TOUCH);

// 被摸次數與餅乾數：單一 key 的 JSON；讀寫失敗（隱私模式等）就只記在記憶體
export class Affection {
  constructor() {
    this.data = {};
    try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); if (o && typeof o === 'object' && !Array.isArray(o)) this.data = o; } catch (e) { this.data = {}; }
  }
  get(id) { const o = this.data[id] || {}; return { pet: Math.max(0, Math.floor(Number(o.pet) || 0)), treat: Math.max(0, Math.floor(Number(o.treat) || 0)) }; }
  add(id, k) {
    const o = this.get(id); o[k]++; this.data[id] = o;
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* 存不了就算了 */ }
    return o;
  }
  text(id) { const o = this.get(id); return '摸頭 ' + o.pet + ' 次・餅乾 ' + o.treat + ' 塊'; }
}

// o：{ canvas, pick(x, y) → Dog|null, card, fx, byId, onBlank(x, y) }
export function buildInteract(o) {
  const { canvas, card, fx } = o, aff = new Affection();
  const api = { aff, stats: { taps: 0, barks: 0, pets: 0, treats: 0, longPress: 0 } };

  api.bark = (d) => {
    d.react('bark', 0.6); d.hold = Math.max(d.hold, 1.3);        // 正在走的話先停下來回應
    fx.woof(d.id, '汪！'); Sound.bark(0.86 + (d.ix % 5) * 0.08);
    api.stats.barks++;
  };
  api.pet = (d) => {
    d.react('pet', 1.6); d.hold = Math.max(d.hold, 2);
    fx.hearts(d.id, 4); Sound.pet();
    aff.add(d.id, 'pet'); api.stats.pets++;
  };
  // 骨頭餅乾從 (sx, sy)（按鈕的位置）飛向狗現在的位置，到了才開始吃
  api.treat = (d, sx, sy) => {
    aff.add(d.id, 'treat'); api.stats.treats++;
    d.hold = Math.max(d.hold, 3);
    fx.bone(d.id, sx, sy, () => { d.react('eat', 1.5); d.hold = Math.max(d.hold, 1.8); fx.crumbs(d.id, 7); fx.hearts(d.id, 2, 0.9); Sound.crunch(); });
  };

  // ── 畫布上的點一下／長按／拖曳 ──
  const ids = new Set();
  let down = null, timer = 0;
  const cancel = () => { down = null; clearTimeout(timer); };
  canvas.addEventListener('pointerdown', (e) => {
    ids.add(e.pointerId);
    if (!e.isPrimary || ids.size > 1 || (e.pointerType === 'mouse' && e.button !== 0)) return cancel();   // 第二根手指或右鍵：是捏合／平移
    down = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, lim: moveLimit(e.pointerType), t: performance.now(), drag: false, used: false, dog: o.pick(e.clientX, e.clientY) };
    clearTimeout(timer);
    if (down.dog) {
      // 按住不動約半秒 = 摸摸頭；不開也不關詳情卡
      timer = setTimeout(() => { if (down && !down.drag && ids.size === 1) { down.used = true; api.stats.longPress++; api.pet(down.dog); } }, LONG_MS);
    }
  });
  // 還沒超過移動門檻前把 pointermove 擋下來，OrbitControls 就不會因為手指微微抖動而開始轉；一超過門檻就放行，之後照常旋轉
  window.addEventListener('pointermove', (e) => {
    if (!down || e.pointerId !== down.id || down.drag) return;
    down.lx = e.clientX; down.ly = e.clientY;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > down.lim) { down.drag = true; clearTimeout(timer); return; }
    e.stopImmediatePropagation();
  }, true);
  // 放開（或 iOS 常見的 pointercancel）：時間短、幾乎沒移動就當成點一下；汪！／音效出錯不可擋住開卡
  const finish = (e, x, y, cancelled) => {
    ids.delete(e.pointerId);
    if (!down || e.pointerId !== down.id) return;
    const d = down, moved = Math.hypot(x - d.x, y - d.y), dt = performance.now() - d.t;
    cancel();
    if (d.drag || d.used || moved > d.lim || dt > TAP_MS) return;   // 拖曳、長按、按太久都不算點一下
    api.stats.taps++;
    const dog = o.pick(x, y);
    if (dog) {
      try { api.bark(dog); } catch (err) { /* 汪！或音效出錯也要開卡 */ }
      card.toggle(dog.id);                                          // 每次點都會汪；同一隻再點一次會收起卡片
    } else if (!cancelled) o.onBlank(x, y);
  };
  window.addEventListener('pointerup', (e) => finish(e, e.clientX, e.clientY, false), true);
  window.addEventListener('pointercancel', (e) => finish(e, down ? down.lx : e.clientX, down ? down.ly : e.clientY, true), true);
  window.addEventListener('blur', () => { ids.clear(); cancel(); });

  // ── 詳情卡上的兩顆按鈕：用 pointer 事件並擋住冒泡 ──
  const act = (btn) => {
    const d = o.byId[card.id];
    if (!d) return;
    const r = btn.getBoundingClientRect();
    if (btn.dataset.act === 'pet') api.pet(d); else api.treat(d, r.left + r.width / 2, r.top);
    card.render();
  };
  card.el.addEventListener('pointerdown', (e) => e.stopPropagation());
  card.el.addEventListener('pointerup', (e) => e.stopPropagation());
  card.el.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
    btn.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      const r = btn.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) act(btn);
    });
    btn.addEventListener('click', (e) => { e.stopPropagation(); if (e.detail === 0) act(btn); });   // 鍵盤 Enter／空白鍵
  });
  return api;
}
