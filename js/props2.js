// 桌面小道具（下半）：拉拉、小哈、柯柯、腸導、金金、牧牧、雪博
(function () {
  const DO = window.DO;
  const { ell, poly, rrect, line } = DO;
  const P = (DO.PROPS = DO.PROPS || {});

  P.lala = (c, o) => { DO.monitor(c, 34, 40, 32, 24, o, 'files'); DO.keyboard(c, o);
    rrect(c, -46, 34, 8, 6, 1, '#6bb5f0', DO.OUT, 1); rrect(c, -34, 36, 12, 5, 1, '#ddd', DO.OUT, 1); };

  P.xiaoha = (c, o) => { // 瑜珈墊捲＋水壺
    ell(c, -36, 36, 13, 6, '#6fcf97', DO.OUT, 1.3); ell(c, -48, 36, 3, 6, '#4aa874', DO.OUT, 1.1);
    rrect(c, 28, 24, 11, 17, 4, '#4aa3df', DO.OUT, 1.3); rrect(c, 30, 20, 7, 5, 2, '#fff', DO.OUT, 1.1);
    line(c, 30, 31, 37, 31, '#fff', 1.5);
    ell(c, 46, 37, 4, 4, '#ff7a59'); ell(c, 46, 37, 1.5, 1.5, '#fff', false); // 小啞鈴/球
  };

  P.keke = (c, o) => { // 地圖＋小行李箱
    poly(c, [[-50, 40], [-26, 40], [-24, 30], [-48, 30]], '#f6e7bd', DO.OUT, 1.2);
    c.strokeStyle = '#d9534f'; c.setLineDash([2, 2]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(-45, 37); c.lineTo(-38, 33); c.lineTo(-30, 37); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#d9534f'; c.fillRect(-31, 35, 3, 3);
    rrect(c, 28, 20, 20, 21, 3, '#e8833a', DO.OUT, 1.4); line(c, 38, 20, 38, 15, DO.OUT, 1.6); line(c, 33, 15, 43, 15, DO.OUT, 1.8);
    line(c, 33, 22, 33, 40, '#c46a24', 1.3); line(c, 43, 22, 43, 40, '#c46a24', 1.3);
    ell(c, 24, 28, 3, 3, '#7ac6e8'); // 小地球
  };

  P.director = (c, o) => { // 場記板＋小攝影機
    const t = (o && o.t) || 0, snap = o && o.working ? Math.max(0, Math.sin(t * 1.2) * 6) : 0;
    c.save(); c.translate(-48, 38);
    rrect(c, 0, -14, 24, 14, 1.5, '#2b2b2b', DO.OUT, 1.2);
    c.save(); c.translate(0, -14); c.rotate(-snap * 0.03);
    rrect(c, 0, -5, 24, 5, 1, '#fff', DO.OUT, 1);
    for (let i = 0; i < 4; i++) poly(c, [[2 + i * 6, 0], [6 + i * 6, 0], [8 + i * 6, -5], [4 + i * 6, -5]], '#222', false);
    c.restore();
    line(c, 3, -9, 21, -9, '#ddd', 1); line(c, 3, -5, 15, -5, '#ddd', 1);
    c.restore();
    rrect(c, 26, 26, 20, 13, 3, '#444', DO.OUT, 1.3); ell(c, 44, 32, 5, 5, '#222'); ell(c, 44, 32, 2.5, 2.5, '#6bb5f0', false);
    ell(c, 31, 24, 4, 4, '#555'); ell(c, 39, 24, 4, 4, '#555');
    line(c, 36, 39, 36, 41, '#666', 2);
    if (o && o.working && Math.sin(t * 3) > 0) ell(c, 29, 29, 1.6, 1.6, '#ff3b30', false);
  };

  P.jinjin = (c, o) => { // 計算機＋金幣＋小存錢筒
    rrect(c, 22, 28, 15, 13, 2, '#3d4452', DO.OUT, 1.2); rrect(c, 24, 30, 11, 4, 1, '#bfe8c8');
    for (let i = 0; i < 6; i++) ell(c, 26 + (i % 3) * 4, 37 + Math.floor(i / 3) * 0, 1, 1, '#ddd', false);
    for (let i = 0; i < 4; i++) ell(c, -42, 40 - i * 3, 6, 2.4, '#f6c445', DO.OUT, 1);
    ell(c, -30, 38, 5, 2.2, '#f6c445', DO.OUT, 1);
    c.fillStyle = '#c8372d'; c.font = 'bold 8px sans-serif'; c.textAlign = 'center'; c.fillText('$', -42, 27);
    rrect(c, 40, 34, 11, 7, 2, '#fff', DO.OUT, 1); line(c, 42, 37, 49, 37, '#4aa874', 1.2);
  };

  P.mumu = (c, o) => { DO.monitor(c, 34, 40, 36, 26, o, 'chart'); DO.keyboard(c, o);
    rrect(c, -46, 33, 14, 8, 1.5, '#fff', DO.OUT, 1); line(c, -43, 39, -40, 35, '#4ade80', 1.4); line(c, -40, 35, -37, 37, '#4ade80', 1.4); line(c, -37, 37, -34, 34, '#4ade80', 1.4); };

  P.xuebo = (c, o) => { // 黑板（晶片圖）＋攤開的書
    rrect(c, 18, 6, 34, 26, 2, '#2f4a3c', '#8a5a30', 2);
    rrect(c, 28, 13, 12, 12, 1, 'rgba(255,255,255,0)', '#e8f0e0', 1.3);
    for (let i = 0; i < 3; i++) { line(c, 31 + i * 4, 13, 31 + i * 4, 10, '#e8f0e0', 1); line(c, 31 + i * 4, 25, 31 + i * 4, 28, '#e8f0e0', 1); }
    line(c, 21, 14, 27, 14, '#e8f0e0', 1.2); line(c, 21, 20, 27, 20, '#e8f0e0', 1.2);
    line(c, 38, 31, 38, 40, '#8a5a30', 2);
    poly(c, [[-50, 38], [-36, 34], [-22, 38], [-36, 42]], '#fff8e8', DO.OUT, 1.2);
    line(c, -36, 34, -36, 42, DO.OUT, 1.2);
    rrect(c, -34, 22, 12, 9, 1.5, '#7a8088', DO.OUT, 1); // 小晶片
    for (let i = 0; i < 3; i++) { line(c, -32 + i * 4, 22, -32 + i * 4, 20, '#bbb', 1); line(c, -32 + i * 4, 31, -32 + i * 4, 33, '#bbb', 1); }
  };
})();
