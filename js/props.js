// 桌面小道具（座位座標：桌面約 y 28～44，x -50～50）。上半：阿波、納納、毛毛、狗管家、柴柴、比比、蕾蒂
(function () {
  const DO = window.DO;
  const { ell, poly, rrect, line } = DO;
  const P = (DO.PROPS = DO.PROPS || {});

  DO.monitor = function (c, x, y, w, h, o, kind) { // y 為底部；畫成微微朝向觀眾
    line(c, x, y, x, y - 5, '#555', 4);
    rrect(c, x - 9, y - 1, 18, 3, 1.5, '#666');
    rrect(c, x - w / 2, y - 5 - h, w, h, 3, '#33363f', '#1d1f26', 1.2);
    const sx = x - w / 2 + 2.5, sy = y - 5 - h + 2.5, sw = w - 5, sh = h - 5;
    c.fillStyle = kind === 'chart' ? '#17314a' : '#13243a'; c.fillRect(sx, sy, sw, sh);
    const t = (o && o.t) || 0;
    if (kind === 'chart') {
      for (let i = 0; i < 6; i++) {
        const v = 6 + ((Math.sin(i * 1.7 + t * (o && o.working ? 1.2 : 0)) + 1) * sh * 0.22);
        const up = i % 3 !== 1;
        c.fillStyle = up ? '#4ade80' : '#f87171';
        c.fillRect(sx + 3 + i * (sw - 6) / 6, sy + sh - v - 4, 3.4, v);
      }
    } else if (kind === 'files') {
      for (let i = 0; i < 6; i++) { rrect(c, sx + 3 + (i % 3) * 11, sy + 3 + Math.floor(i / 3) * 10, 8, 7, 1.5, ['#ffd166', '#6ec6ff', '#a5e887'][i % 3]); }
    } else {
      const n = Math.floor(sh / 4.5);
      for (let i = 0; i < n; i++) {
        const lw = 8 + ((i * 7 + Math.floor(t * (o && o.working ? 2 : 0))) % 4) * 6;
        c.fillStyle = ['#7ee787', '#79c0ff', '#ffa657', '#d2a8ff'][i % 4];
        c.fillRect(sx + 2 + (i % 3) * 3, sy + 2 + i * 4.5, Math.min(lw, sw - 8), 2);
      }
    }
  };
  const mug = (c, x, y, col) => { rrect(c, x - 4.5, y - 8, 9, 9, 2, col || '#fff', DO.OUT, 1.2); c.strokeStyle = DO.OUT; c.lineWidth = 1.2; c.beginPath(); c.arc(x + 5, y - 4, 2.6, -1.4, 1.4); c.stroke(); };
  const keyboard = (c, o) => {
    poly(c, [[-18, 41], [18, 41], [21, 34], [-15, 34]], '#e7e2d6', DO.OUT, 1);
    for (let i = 0; i < 5; i++) DO.line(c, -13 + i * 7.2, 37.5, -10 + i * 7.2, 37.5, '#a8a294', 1.4);
  };
  DO.keyboard = keyboard;

  P.apo = (c, o) => { DO.monitor(c, 34, 40, 34, 26, o); keyboard(c, o); mug(c, -38, 38, '#e5533d'); };

  P.nana = (c, o) => { // 小白板＋夾板＋星星名牌
    rrect(c, 18, 8, 32, 24, 2, '#fdfdfb', '#7a6a58', 1.5);
    line(c, 22, 14, 44, 14, '#6aa6e8', 1.8); line(c, 22, 19, 38, 19, '#e8866a', 1.8); line(c, 22, 24, 42, 24, '#6bc08a', 1.8);
    line(c, 34, 32, 34, 40, '#7a6a58', 2);
    rrect(c, -48, 31, 22, 9, 2, '#f7e6a8', DO.OUT, 1);
    c.fillStyle = '#c8372d'; c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.fillText('★ PM', -37, 38);
    mug(c, -20, 40, '#cfe8ff');
  };

  P.maomao = (c, o) => { // 畫架＋調色盤
    line(c, 26, 40, 34, 14, '#8a5a30', 2.2); line(c, 46, 40, 38, 14, '#8a5a30', 2.2); line(c, 36, 40, 36, 20, '#8a5a30', 2.2);
    rrect(c, 22, 8, 28, 22, 2, '#fffdf6', '#8a5a30', 1.5);
    ell(c, 32, 20, 6, 4, '#ff9f68', false); ell(c, 40, 17, 5, 5, '#7ac6e8', false); ell(c, 36, 24, 4, 3, '#b58cf0', false);
    ell(c, -34, 37, 14, 6, '#e8c48a', DO.OUT, 1.2);
    [['#e5533d', -41], ['#f2c14e', -35], ['#4aa3df', -29], ['#5cbf7a', -23]].forEach(([col, x]) => ell(c, x, 36.5, 2.4, 1.8, col, false));
    line(c, -44, 40, -30, 30, '#6b4a2a', 1.6); // 畫筆
  };

  P.butler = (c, o) => { // 整齊的書疊、筆筒、小檯燈
    rrect(c, -48, 33, 22, 7, 1, '#3a5a8a', DO.OUT, 1); rrect(c, -47, 27, 20, 6, 1, '#8a3a3a', DO.OUT, 1); rrect(c, -48, 22, 22, 5, 1, '#3a7a5a', DO.OUT, 1);
    rrect(c, 24, 32, 7, 9, 1.5, '#d9d2c2', DO.OUT, 1); line(c, 26, 32, 25, 25, '#222', 1.5); line(c, 29, 32, 30, 24, '#c33', 1.5);
    line(c, 44, 40, 44, 22, '#555', 2); poly(c, [[38, 22], [50, 22], [47, 15], [41, 15]], '#d9b45a', DO.OUT, 1);
    rrect(c, 34, 36, 14, 5, 1, '#fff8e8', DO.OUT, 1); // 便條
  };

  P.shiba = (c, o) => { // 信件袋＋信
    c.beginPath(); c.moveTo(-50, 41); c.lineTo(-48, 24); c.quadraticCurveTo(-36, 18, -24, 24); c.lineTo(-22, 41); c.closePath();
    c.fillStyle = '#4a6fa5'; c.fill(); c.strokeStyle = DO.OUT; c.lineWidth = 1.3; c.stroke();
    poly(c, [[-49, 26], [-23, 26], [-36, 34]], '#5b82bb', DO.OUT, 1.2); ell(c, -36, 33, 2, 2, '#ffd35c', false);
    [[24, 38, '#fff'], [30, 35, '#ffe9b0'], [36, 38, '#fff']].forEach(([x, y, col], i) => {
      rrect(c, x, y - 7 - i % 2, 15, 9, 1, col, DO.OUT, 1); c.strokeStyle = '#c0392b'; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(x + 1, y - 6 - i % 2); c.lineTo(x + 7.5, y - 2); c.lineTo(x + 14, y - 6 - i % 2); c.stroke();
    });
    keyboard(c, o);
  };

  P.bibi = (c, o) => { // 單字卡＋字母積木＋耳機
    const cols = ['#ef6f6c', '#6bb5f0', '#f4c95d'];
    ['A', 'B', 'C'].forEach((ch, i) => {
      rrect(c, 22 + i * 10, 33 - (i === 1 ? 7 : 0), 9, 9, 1.5, cols[i], DO.OUT, 1);
      c.fillStyle = '#fff'; c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.fillText(ch, 26.5 + i * 10, 40 - (i === 1 ? 7 : 0));
    });
    rrect(c, -48, 28, 20, 13, 1.5, '#fff', DO.OUT, 1); line(c, -45, 33, -31, 33, '#6bb5f0', 1.4); line(c, -45, 37, -36, 37, '#ef6f6c', 1.4);
    c.beginPath(); c.arc(-14, 32, 7, Math.PI, 0); c.strokeStyle = '#444'; c.lineWidth = 2; c.stroke();
    ell(c, -21, 33, 2.6, 3.4, '#ef6f6c'); ell(c, -7, 33, 2.6, 3.4, '#ef6f6c');
  };

  P.lady = (c, o) => { // 花瓶＋茶杯＋愛心
    rrect(c, 28, 31, 10, 11, 3, '#b8d8f0', DO.OUT, 1.2);
    line(c, 33, 31, 31, 20, '#4a9a5a', 1.6); line(c, 33, 31, 37, 18, '#4a9a5a', 1.6);
    ell(c, 31, 19, 4, 4, '#ff8fb0'); ell(c, 37, 17, 4, 4, '#ffd36b');
    ell(c, -36, 40, 9, 3, '#fff', DO.OUT, 1); rrect(c, -41, 32, 10, 8, 3, '#fff', DO.OUT, 1.2);
    const bob = Math.sin(((o && o.t) || 0) * 2) * 1.5; // 熱氣
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-37, 30); c.quadraticCurveTo(-34 + bob, 26, -37, 22); c.stroke();
    c.fillStyle = '#ff6f91'; c.beginPath(); c.moveTo(-18, 36); c.bezierCurveTo(-24, 30, -14, 28, -18, 33); c.bezierCurveTo(-22, 28, -12, 30, -18, 36); c.fill();
  };
})();
