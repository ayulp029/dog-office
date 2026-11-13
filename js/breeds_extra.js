// 各品種的頭部特徵（back：頭後方；mark：毛色花紋；front：眼睛之後的前景）。座標原點＝頭中心
(function () {
  const DO = window.DO;
  const { ell, poly, shade } = DO;
  const X = (DO.EXTRA = DO.EXTRA || {});

  function glasses(c, col, r, dx, y) {
    c.strokeStyle = col; c.lineWidth = 2.2;
    for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * dx, y, r, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.22)'; c.fill(); c.stroke(); }
    c.beginPath(); c.moveTo(-dx + r, y); c.lineTo(dx - r, y); c.stroke();
    for (const sx of [-1, 1]) ell(c, sx * dx - 2, y - 2.5, 1.5, 1, 'rgba(255,255,255,.7)', false);
  }
  function blaze(c, col, topW, botW, topY, botY) {
    poly(c, [[-topW, topY], [topW, topY], [botW, botY], [-botW, botY]], col, false);
  }

  X.nana = {
    back(c, S) { // 淺茶色頸毛（只在兩側，不圍成一圈）
      ell(c, -19, 14, 6, 8, '#c8914f', DO.OUT, 1.2, 0.4); ell(c, 19, 14, 6, 8, '#c8914f', DO.OUT, 1.2, -0.4);
    },
    mark(c) { blaze(c, '#fff8ec', 3, 7, -22, 12); },
    front(c) { glasses(c, '#3a2a1c', 7, 10, -3); },
  };
  X.apo = {
    mark(c) { blaze(c, '#fbfbfb', 4, 9, -23, 10); ell(c, 0, 10, 12, 9, '#fbfbfb', false); },
    front(c) { ell(c, -10, -9, 2, 1.2, '#8a5a30', false); ell(c, 10, -9, 2, 1.2, '#8a5a30', false); },
  };
  X.maomao = {
    back(c) { // 蓬鬆頭毛與臉頰毛
      [[-12, -22, 11], [0, -27, 13], [12, -22, 11], [-24, -6, 9], [24, -6, 9], [-22, 12, 9], [22, 12, 9]].forEach(([x, y, r]) => ell(c, x, y, r, r, '#fbf8f1'));
    },
    front(c) {
      ell(c, -15, 6, 4.5, 3, 'rgba(255,150,170,.45)', false); ell(c, 15, 6, 4.5, 3, 'rgba(255,150,170,.45)', false);
      ell(c, 7, -26, 3.3, 3, '#ff7aa8', DO.OUT, 1); ell(c, 12, -26, 3.3, 3, '#ff7aa8', DO.OUT, 1); ell(c, 9.5, -26, 1.6, 1.6, '#c93f78', false);
    },
  };
  X.butler = {
    mark(c) {
      c.strokeStyle = '#8a8a96'; c.lineWidth = 1.3;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, -12 + i * 2.6, 10 - i, 1.2 * Math.PI, 1.8 * Math.PI); c.stroke(); }
      ell(c, -15, 8, 9, 7, '#b9b9c2', false); ell(c, 15, 8, 9, 7, '#b9b9c2', false);
    },
    front(c) {
      ell(c, -11, 13, 8, 6.5, '#d3d3da'); ell(c, 11, 13, 8, 6.5, '#d3d3da'); // 下垂的臉頰肉
      ell(c, 0, 9, 14, 8.5, '#d3d3da', false);
      ell(c, 0, 5.5, 5, 3, '#2a2a30', false); // 鼻
      c.strokeStyle = DO.OUT; c.lineWidth = 1.3; c.beginPath(); c.moveTo(0, 7); c.lineTo(0, 11); c.stroke();
      ell(c, -7, 14.5, 2, 2.4, '#fff', DO.OUT, 0.8); ell(c, 7, 14.5, 2, 2.4, '#fff', DO.OUT, 0.8);
    },
  };
  X.shiba = {
    mark(c) {
      ell(c, -13, 8, 11, 9, '#fff2dd', false); ell(c, 13, 8, 11, 9, '#fff2dd', false);
      ell(c, -10, -10, 3, 2, '#fff2dd', false); ell(c, 10, -10, 3, 2, '#fff2dd', false);
    },
  };
  X.bibi = {
    mark(c) {
      ell(c, 0, -16, 13, 8, '#8a4b25', false); blaze(c, '#ffffff', 3, 8, -20, 11);
      ell(c, -14, 4, 7, 9, '#c58a4a', false); ell(c, 14, 4, 7, 9, '#c58a4a', false);
    },
  };
  X.lady = {
    mark(c) { ell(c, 0, -17, 10, 5, '#dcaa66', false); ell(c, 0, -21, 6, 3, '#dcaa66', false); },
    front(c) { // 小小原創髮飾：粉紅小花
      const x = 17, y = -19;
      for (let i = 0; i < 5; i++) { const a = i * 1.2566; ell(c, x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3, 3, '#ff9bb8', DO.OUT, 0.9); }
      ell(c, x, y, 2.2, 2.2, '#fff0a0', DO.OUT, 0.8);
      ell(c, -9, 7, 3, 1.6, 'rgba(255,140,150,.35)', false); ell(c, 9, 7, 3, 1.6, 'rgba(255,140,150,.35)', false);
    },
  };
  X.lala = {
    mark(c) { ell(c, -13, 7, 8, 7, '#f6e2a0', false); ell(c, 13, 7, 8, 7, '#f6e2a0', false); },
  };
  X.xiaoha = {
    mark(c, S) {
      ell(c, 0, 6, 19, 17, '#ffffff', false);
      poly(c, [[-4, -22], [4, -22], [2, -8], [-2, -8]], '#ffffff', false);
      ell(c, -10, -9, 3, 1.8, '#ffffff', false); ell(c, 10, -9, 3, 1.8, '#ffffff', false);
      c.fillStyle = '#6a7482';
      c.beginPath(); c.arc(0, -4, 21, 1.18 * Math.PI, 1.82 * Math.PI); c.lineTo(0, -2); c.closePath(); c.globalAlpha = 0.0; c.fill(); c.globalAlpha = 1;
    },
  };
  X.keke = {
    mark(c) { blaze(c, '#ffffff', 3, 8, -20, 11); ell(c, 0, 9, 14, 11, '#fff4e2', false); },
    front(c, S, o) { if (!o.pant) { ell(c, 0, 16, 3, 3.2, '#f0808c', DO.OUT, 1); } },
  };
  X.director = {
    front(c, S, o) { // 原創紅貝雷帽
      c.save(); c.translate(-3, -20); c.rotate(-0.2);
      ell(c, 0, 0, 20, 8, '#c8372d'); ell(c, 0, -2, 14, 4.5, '#df5a4e', false);
      c.strokeStyle = DO.OUT; c.lineWidth = 1.5; c.beginPath(); c.moveTo(1, -8); c.lineTo(3, -12); c.stroke();
      c.restore();
    },
  };
  X.jinjin = {
    mark(c) { ell(c, 0, -20, 11, 5, '#eab560', false); ell(c, -13, 7, 8, 7, '#eab560', false); ell(c, 13, 7, 8, 7, '#eab560', false); },
  };
  X.mumu = {
    mark(c) {
      poly(c, [[-7, -22], [7, -22], [5, -3], [8, 10], [-8, 10], [-5, -3]], '#2f2926', false);
      ell(c, -12, -4, 6, 6, '#2f2926', false); ell(c, 12, -4, 6, 6, '#2f2926', false);
      ell(c, 0, 7, 12, 8, '#2f2926', false);
    },
  };
  X.xuebo = {
    mark(c) { ell(c, 0, -14, 17, 8, '#6b7078', false); },
    front(c) {
      // 濃眉
      poly(c, [[-17, -8], [-3, -11], [-4, -6], [-16, -4]], '#f0f0f0', DO.OUT, 1);
      poly(c, [[17, -8], [3, -11], [4, -6], [16, -4]], '#f0f0f0', DO.OUT, 1);
      // 學者鬍鬚
      poly(c, [[-13, 8], [13, 8], [10, 24], [0, 29], [-10, 24]], '#eceef0', DO.OUT, 1.3);
      ell(c, 0, 8, 6, 4, '#161616', false);
      c.strokeStyle = '#b8bcc2'; c.lineWidth = 1;
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 4, 14); c.lineTo(i * 3.2, 24); c.stroke(); }
      glasses(c, '#3a3f4a', 6.4, 9.5, -3);
    },
  };
})();
