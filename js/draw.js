// 基本繪圖工具：全部掛在 window.DO
(function () {
  const DO = (window.DO = window.DO || {});
  const OUT = '#4a3426';
  DO.OUT = OUT;

  // 橢圓。stroke: false 表示不描邊
  DO.ell = function (c, x, y, rx, ry, fill, stroke, lw, rot) {
    c.beginPath();
    c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke !== false) { c.strokeStyle = stroke || OUT; c.lineWidth = lw || 1.5; c.stroke(); }
  };

  DO.poly = function (c, pts, fill, stroke, lw) {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke !== false) { c.strokeStyle = stroke || OUT; c.lineWidth = lw || 1.5; c.lineJoin = 'round'; c.stroke(); }
  };

  DO.rrect = function (c, x, y, w, h, r, fill, stroke, lw) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); }
  };

  DO.line = function (c, x1, y1, x2, y2, col, lw) {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
    c.strokeStyle = col; c.lineWidth = lw || 1.5; c.lineCap = 'round'; c.stroke();
  };

  // 顏色加深／變亮（amt -1..1）
  DO.shade = function (hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };

  DO.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  DO.lerp = (a, b, t) => a + (b - a) * t;

  // 簡單的可重現亂數
  DO.rng = function (seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
})();
