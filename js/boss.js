// 主管位：狗管家的主管桌、高背皮椅、深色地毯，以及後牆的「Grok Bot 本週用量」儀表板（canvas 貼圖）
import * as THREE from 'three';
import { box, cyl, mat } from './kit.js';
import { esc } from './card.js';

const WOOD = '#5a3a26', WOOD_D = '#3d2618', LEATHER = '#2b211d', GOLD = '#c9a24a', DARK = '#23262d';
const FONT = '"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
const PH = 0.14;               // 桌子底下矮平台的高度
const TITLE = 'Grok Bot 本週用量', FAIL = '用量資料讀不到';

// 主管桌椅 + 地毯 + 平台。桌子在狗後方（-z）；回傳螢幕材質（跟一般桌一樣由主程式調亮度）
export function bossDesk(scene, seat, accent) {
  const x = seat.x, z = seat.z - 1.45;
  box(scene, 4.6, 0.03, 4.2, GOLD, x, 0, seat.z - 0.9, false).receiveShadow = true;       // 地毯金邊
  box(scene, 4.3, 0.04, 3.9, '#5a1f2a', x, 0, seat.z - 0.9, false).receiveShadow = true;  // 深酒紅地毯
  box(scene, 4.5, PH, 1.8, WOOD_D, x, 0, z + 0.05);                                       // 矮平台

  const g = new THREE.Group(); g.position.set(x, PH, z); scene.add(g);
  box(g, 4.0, 0.12, 1.5, WOOD_D, 0, 0.92, 0);
  box(g, 4.0, 0.04, 0.03, GOLD, 0, 0.96, 0.76, false);
  [-1.4, 1.4].forEach((px) => {
    box(g, 1.1, 0.92, 1.3, WOOD, px, 0, 0);
    [0.25, 0.6].forEach((py) => box(g, 0.5, 0.04, 0.03, GOLD, px, py, 0.66, false));        // 抽屜把手
  });
  box(g, 1.8, 0.7, 0.08, WOOD, 0, 0.22, 0.55);
  box(g, 1.6, 0.02, 0.7, '#1f4a3a', 0, 1.04, 0.3, false);                                 // 皮革桌墊
  box(g, 0.6, 0.04, 0.32, DARK, 0, 1.04, -0.35); box(g, 0.08, 0.3, 0.08, DARK, 0, 1.04, -0.35);
  box(g, 1.6, 0.9, 0.07, DARK, 0, 1.3, -0.35);
  const screen = new THREE.MeshStandardMaterial({ color: '#1c2430', emissive: '#7fd0ff', emissiveIntensity: 0, roughness: 0.4 });
  box(g, 1.48, 0.78, 0.02, screen, 0, 1.36, -0.31, false);
  cyl(g, 0.1, 0.18, accent, 1.0, 1.04, 0.4);                                              // 馬克杯
  box(g, 0.7, 0.16, 0.08, GOLD, -1.3, 1.04, 0.58);                                        // 名牌
  cyl(g, 0.14, 0.04, GOLD, -1.55, 1.04, -0.2); cyl(g, 0.025, 0.4, GOLD, -1.55, 1.08, -0.2); // 銀行家檯燈
  box(g, 0.5, 0.14, 0.24, mat('#2f7a55', { emissive: '#1d5a3c', emissiveIntensity: 0.6 }), -1.55, 1.46, -0.12);
  box(g, 0.5, 0.08, 0.36, '#7a2a2a', 1.5, 1.04, -0.25); box(g, 0.46, 0.07, 0.33, '#2c3e6b', 1.5, 1.12, -0.25);

  // 深色皮革高背主管椅（跟其他椅子一樣放在狗的左側）
  const c = new THREE.Group(); c.position.set(x - 1.75, 0, seat.z + 0.15); c.rotation.y = 0.5; scene.add(c);
  cyl(c, 0.5, 0.07, DARK, 0, 0, 0); cyl(c, 0.06, 0.5, '#8a8f98', 0, 0.07, 0);
  box(c, 1.0, 0.18, 0.95, LEATHER, 0, 0.57, 0); box(c, 1.0, 1.55, 0.16, LEATHER, 0, 0.7, -0.45);
  box(c, 0.8, 0.32, 0.22, '#3a2d27', 0, 1.9, -0.43);                                      // 頭枕
  [-0.52, 0.52].forEach((ax) => { box(c, 0.12, 0.1, 0.7, LEATHER, ax, 0.98, 0); box(c, 0.08, 0.26, 0.08, DARK, ax, 0.74, 0.2); });
  return screen;
}

// 把用量資料（DO.normalizeUsage 的結果或 null）轉成要顯示的文字；key 有變才需要重畫
export function usageView(u, now, DO) {
  if (!u) return { ok: false, key: 'fail' };
  const remain = 100 - u.usedPercent, ms = u.resetAt - now;
  let left;
  if (ms <= 0) left = '已到重置時間';
  else if (ms >= 24 * 3600e3) { const th = Math.round(ms / 3600e3); left = '還有 ' + Math.floor(th / 24) + ' 天 ' + (th % 24) + ' 小時'; }
  else { const m = Math.floor(ms / 60e3); left = '還有 ' + (m >= 60 ? Math.floor(m / 60) + ' 小時 ' : '') + (m % 60) + ' 分'; }
  const v = {
    ok: true, pct: remain, remain: remain.toFixed(1), used: u.usedPercent.toFixed(1), plan: u.plan || '—', left,
    color: remain > 50 ? '#3ecf6e' : remain >= 20 ? '#ff9f2e' : '#ff4d4d',   // >50% 綠、20–50% 橙、<20% 紅
    reset: DO.taipeiDate(u.resetAt), upd: DO.taipeiDate(u.updatedAt),
  };
  v.key = [v.remain, v.plan, v.left, v.reset, v.upd].join('|');
  return v;
}

function draw(c, w, h, v) {
  c.fillStyle = '#121824'; c.fillRect(0, 0, w, h);
  c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  c.fillStyle = '#e8eef8'; c.font = 'bold 56px ' + FONT; c.fillText(TITLE, 44, 80);
  if (!v.ok) { c.textAlign = 'center'; c.fillStyle = '#aab4c4'; c.font = 'bold 88px ' + FONT; c.fillText(FAIL, w / 2, 330); return; }
  c.fillStyle = '#e8eef8'; c.font = 'bold 72px ' + FONT; c.fillText('剩餘', 44, 262);
  c.fillStyle = v.color; c.font = 'bold 200px ' + FONT; c.fillText(v.remain + '%', 212, 270);
  c.textAlign = 'right';
  c.fillStyle = '#9fb0c8'; c.font = 'bold 38px ' + FONT; c.fillText(v.plan, w - 44, 76);
  c.font = 'bold 44px ' + FONT; c.fillText('已使用', w - 44, 176);
  c.fillStyle = '#e8eef8'; c.font = 'bold 84px ' + FONT; c.fillText(v.used + '%', w - 44, 266);
  // gauge：亮色段 = 剩餘量
  const bar = (bw, col) => { c.fillStyle = col; c.beginPath(); if (c.roundRect) c.roundRect(44, 302, bw, 56, 28); else c.rect(44, 302, bw, 56); c.fill(); };
  bar(w - 88, '#2a3446');
  if (v.pct > 0) bar(Math.max(56, (w - 88) * v.pct / 100), v.color);
  c.textAlign = 'left';
  c.fillStyle = '#ffffff'; c.font = 'bold 50px ' + FONT; c.fillText(v.reset + ' 重置・' + v.left, 44, 436);
  c.fillStyle = '#9fb0c8'; c.font = '38px ' + FONT; c.fillText('更新時間 ' + v.upd + '（台北時間）', 44, 506);
}

// 後牆中央的儀表板。set(usage) 換資料；tick(now) 每秒呼叫更新倒數，內容有變回傳 true
export function buildUsageBoard(scene, DO) {
  const W = 5.6, H = 2.52, y = 4.2, z = DO.CFG.room.z0 + 0.05;
  box(scene, W + 0.24, H + 0.24, 0.12, DARK, 0, y - H / 2 - 0.12, z);
  const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 540;
  const ctx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  mesh.position.set(0, y, z + 0.07); scene.add(mesh);
  const b = { mesh, usage: null, view: null };
  b.tick = (now) => {
    const v = usageView(b.usage, now, DO);
    if (b.view && b.view.key === v.key) return false;
    b.view = v; draw(ctx, cv.width, cv.height, v); tex.needsUpdate = true;
    return true;
  };
  b.set = (u) => { b.usage = u; return b.tick(Date.now()); };
  b.tick(Date.now());            // 還沒有資料時先畫「讀不到」，不顯示任何數字
  return b;
}

// 點儀表板開的小詳情卡（沿用 #card 樣式）
export function usageCardHtml(v) {
  const head = `<div class="c-main"><div class="c-head"><span class="c-name">${TITLE}</span>`;
  if (!v || !v.ok) return head + `</div><div class="c-row">${FAIL}</div></div>`;
  return head + `<span class="c-role">方案：${esc(v.plan)}</span><span class="c-st" style="background:${v.color}">剩餘 ${v.remain}%</span></div>
    <div class="c-row">已用 ${v.used}%・剩餘 ${v.remain}%</div>
    <div class="c-bar"><div class="c-fill" style="width:${v.remain}%;background:${v.color}"></div></div>
    <div class="c-row">重置時間：${v.reset}（${v.left}）</div>
    <div class="c-row">更新時間：${v.upd}（台北時間）</div></div>`;
}
