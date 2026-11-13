// 家具：飲水機、咖啡機、植物、書櫃、窗戶、白板、時鐘、桌椅
(function () {
  const DO = window.DO;
  const { ell, poly, rrect, line, shade } = DO;

  DO.drawPlant = function (c, x, y, s, t, kind) { // 底部中心 (x,y)
    s = s || 1; const sw = Math.sin((t || 0) * 0.8 + x) * 0.04;
    c.save(); c.translate(x, y); c.scale(s, s);
    ell(c, 0, 2, 20, 6, 'rgba(60,35,10,.22)', false);
    poly(c, [[-15, -30], [15, -30], [11, 0], [-11, 0]], '#c8683f', DO.OUT, 1.5);
    rrect(c, -17, -34, 34, 7, 3, '#d9794d', DO.OUT, 1.5);
    const leaves = [[-0.9, 44], [-0.45, 56], [0, 62], [0.45, 54], [0.9, 42], [-0.2, 40], [0.25, 46]];
    leaves.forEach(([a, h], i) => {
      c.save(); c.translate(0, -32); c.rotate(a + sw * (i % 2 ? 1 : -1));
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-11, -h * 0.55, 0, -h); c.quadraticCurveTo(11, -h * 0.55, 0, 0);
      c.fillStyle = i % 2 ? '#4f9e5a' : '#3f8a4c'; c.fill(); c.strokeStyle = '#2d5e36'; c.lineWidth = 1.2; c.stroke();
      line(c, 0, -3, 0, -h + 6, '#2d5e36', 0.9);
      c.restore();
    });
    c.restore();
  };

  DO.drawCooler = function (c, x, y, t) {
    c.save(); c.translate(x, y);
    ell(c, 0, 2, 26, 7, 'rgba(60,35,10,.25)', false);
    rrect(c, -19, -50, 38, 50, 5, '#e9f1f7', DO.OUT, 1.6);
    rrect(c, -19, -50, 38, 12, 5, '#cfe0ec', DO.OUT, 1.6);
    rrect(c, -9, -40, 18, 7, 2, '#fff', '#8aa', 1);
    ell(c, -4, -30, 3, 3, '#4aa3df'); ell(c, 4, -30, 3, 3, '#ef6f6c');   // 冷熱水龍頭
    rrect(c, -8, -22, 16, 3, 1, '#9db4c4'); rrect(c, -7, -17, 14, 12, 2, '#b9cbd8'); // 出水口與接水盤
    // 水桶
    c.beginPath(); c.moveTo(-14, -52); c.lineTo(-14, -80); c.quadraticCurveTo(0, -94, 14, -80); c.lineTo(14, -52); c.closePath();
    c.fillStyle = 'rgba(130,200,240,.75)'; c.fill(); c.strokeStyle = '#4b7fa0'; c.lineWidth = 1.5; c.stroke();
    c.save(); c.beginPath(); c.rect(-13, -66, 26, 14); c.clip(); c.fillStyle = 'rgba(80,170,230,.55)'; c.fillRect(-14, -66, 28, 16); c.restore();
    for (let i = 0; i < 3; i++) { const p = ((t * 0.5 + i * 0.33) % 1); ell(c, Math.sin(i * 3 + t) * 5, -54 - p * 22, 1.8, 1.8, 'rgba(255,255,255,.85)', false); }
    c.restore();
  };

  DO.drawCoffee = function (c, x, y, t, busy) {
    c.save(); c.translate(x, y);
    ell(c, 0, 2, 34, 8, 'rgba(60,35,10,.25)', false);
    rrect(c, -29, -34, 58, 34, 4, '#b98652', DO.OUT, 1.6); // 櫃子
    line(c, 0, -34, 0, -2, '#8a5f36', 1.2); ell(c, -5, -20, 1.5, 1.5, '#e9c88f', false); ell(c, 5, -20, 1.5, 1.5, '#e9c88f', false);
    rrect(c, -31, -39, 62, 7, 3, '#d9a972', DO.OUT, 1.6);
    // 機器
    rrect(c, -16, -78, 32, 40, 4, '#b8423a', DO.OUT, 1.6);
    rrect(c, -16, -78, 32, 9, 4, '#8f2f2a', DO.OUT, 1.6);
    rrect(c, -11, -64, 22, 16, 2, '#2f2f35'); // 出口區
    ell(c, 9, -72, 2.2, 2.2, busy ? '#7dff9a' : '#ffd35c', false); ell(c, -9, -72, 2.2, 2.2, '#fff', false);
    rrect(c, -4, -49, 8, 5, 1, '#9a9aa2');
    rrect(c, -5, -46, 10, 7, 2, '#fff', DO.OUT, 1.2); // 杯子
    if (busy) { line(c, 0, -52, 0, -47, '#5a3a1e', 1.6); }
    for (let i = 0; i < 3; i++) { // 蒸氣
      const p = (t * 0.45 + i * 0.33) % 1;
      ell(c, Math.sin(p * 6 + i) * 3, -42 - p * 22, 2.2 + p * 2, 2.2 + p * 2, `rgba(255,255,255,${0.5 * (1 - p)})`, false);
    }
    c.restore();
  };

  DO.drawWindow = function (c, x, y, w, h, i) {
    rrect(c, x - 5, y - 5, w + 10, h + 10, 4, '#fff6e4', '#b99669', 2);
    const g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#8fd0f5'); g.addColorStop(1, '#e6f6ff');
    c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(255,255,255,.85)';
    ell(c, x + w * 0.3, y + h * 0.35, 16, 6, 'rgba(255,255,255,.9)', false); ell(c, x + w * 0.45, y + h * 0.3, 10, 5, 'rgba(255,255,255,.9)', false);
    poly(c, [[x, y + h], [x + w * 0.3, y + h * 0.62], [x + w * 0.6, y + h]], '#a9d99a', false); // 遠山
    poly(c, [[x + w * 0.4, y + h], [x + w * 0.75, y + h * 0.55], [x + w, y + h]], '#8fcb88', false);
    c.strokeStyle = '#fff6e4'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h * 0.5); c.lineTo(x + w, y + h * 0.5); c.stroke();
    // 窗簾
    poly(c, [[x - 6, y - 6], [x + 14, y - 6], [x + 6, y + h + 6], [x - 6, y + h + 6]], 'rgba(255,214,150,.85)', false);
    poly(c, [[x + w + 6, y - 6], [x + w - 14, y - 6], [x + w - 6, y + h + 6], [x + w + 6, y + h + 6]], 'rgba(255,214,150,.85)', false);
  };

  DO.drawShelf = function (c, x, y, w, h) {
    rrect(c, x, y, w, h, 3, '#9b6b3e', DO.OUT, 1.8);
    const rows = 3, rh = (h - 8) / rows, cols = ['#d9534f', '#4a8fd0', '#f0c14b', '#5cb176', '#9b6bd0', '#ef8a4a', '#3a7a8a'];
    const rnd = DO.rng(7);
    for (let r = 0; r < rows; r++) {
      const ry = y + 4 + r * rh;
      c.fillStyle = '#c8935c'; c.fillRect(x + 4, ry, w - 8, rh - 2);
      let bx = x + 6;
      while (bx < x + w - 12) {
        const bw = 5 + rnd() * 5, bhh = rh - 8 - rnd() * 8;
        rrect(c, bx, ry + rh - 3 - bhh, bw, bhh, 1, cols[Math.floor(rnd() * cols.length)], DO.OUT, 0.8);
        bx += bw + 1;
      }
      c.fillStyle = '#7a5230'; c.fillRect(x + 4, ry + rh - 3, w - 8, 3);
    }
  };

  DO.drawWhiteboard = function (c, x, y, w, h) {
    rrect(c, x, y, w, h, 3, '#fdfdfb', '#8a8a92', 3);
    c.font = 'bold 12px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif'; c.fillStyle = '#3a6ea5'; c.textAlign = 'left';
    c.fillText('本週目標', x + 10, y + 18);
    [['#e8866a', 0.8], ['#6bc08a', 0.55], ['#6aa6e8', 0.68]].forEach(([col, p], i) => {
      ell(c, x + 14, y + 33 + i * 14, 3, 3, col, false);
      rrect(c, x + 22, y + 30 + i * 14, (w - 40) * p, 6, 3, col);
    });
    rrect(c, x + w - 30, y + h + 1, 24, 4, 2, '#8a8a92');
  };

  DO.drawClock = function (c, x, y, d) {
    const t = new Date(Date.now() + 8 * 3600e3 - new Date().getTimezoneOffset() * -60e3 * 0);
    const utc = new Date(); const h = (utc.getUTCHours() + 8) % 24, m = utc.getUTCMinutes();
    ell(c, x, y, 21, 21, '#fffaf0', '#7a5230', 3);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(c, x + Math.sin(a) * 16, y - Math.cos(a) * 16, x + Math.sin(a) * 18.5, y - Math.cos(a) * 18.5, '#7a5230', 1.4); }
    const ha = ((h % 12) + m / 60) * Math.PI / 6, ma = m * Math.PI / 30;
    line(c, x, y, x + Math.sin(ha) * 10, y - Math.cos(ha) * 10, '#3a281c', 2.4);
    line(c, x, y, x + Math.sin(ma) * 15, y - Math.cos(ma) * 15, '#3a281c', 1.6);
    ell(c, x, y, 2, 2, '#c8372d', false);
  };

  // 椅背與桌子（座位座標）。sel：桌面主色
  DO.drawChair = function (c, col) {
    rrect(c, -27, -6, 54, 52, 14, col, DO.OUT, 1.6);
    rrect(c, -21, 0, 42, 40, 10, shade(col, 0.12), false);
  };
  DO.drawDeskTop = function (c, wood) {
    poly(c, [[-54, 44], [54, 44], [66, 28], [-42, 28]], shade(wood, 0.14), DO.OUT, 1.5);
    line(c, -48, 40, 56, 40, 'rgba(255,255,255,.28)', 1.2);
  };
  DO.drawDeskFront = function (c, wood, shadowBelow) {
    poly(c, [[54, 44], [66, 28], [66, 62], [54, 76]], shade(wood, -0.2), DO.OUT, 1.5);
    rrect(c, -54, 44, 108, 32, 2, wood, DO.OUT, 1.5);
    rrect(c, -46, 50, 40, 20, 2, shade(wood, -0.08), shade(wood, -0.3), 1); rrect(c, 6, 50, 40, 20, 2, shade(wood, -0.08), shade(wood, -0.3), 1);
    ell(c, -26, 60, 3, 2, '#f2d27a'); ell(c, 26, 60, 3, 2, '#f2d27a');
  };
})();
