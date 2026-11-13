// 坐姿半身：軀幹、尾巴、前腳、配件（背心／領結／圍巾）。原點＝脖子基準
(function () {
  const DO = window.DO;
  const { ell, poly, shade } = DO;

  // 尾巴（畫在身體側邊，wag 為擺動角 -1..1）
  DO.drawTail = function (c, S, sx, wag, t) {
    const T = S.tail, bw = S.body.w;
    c.save();
    c.translate(sx * (bw - 6), 22);
    c.scale(sx, 1);
    const a = wag * 0.5;
    c.rotate(a);
    const col = T.col, tip = T.tip;
    switch (T.type) {
      case 'curl': // 柴犬捲尾
        c.beginPath(); c.arc(8, -8, 12, 0.7 * Math.PI, 2.3 * Math.PI);
        c.lineWidth = 9; c.strokeStyle = DO.OUT; c.lineCap = 'round'; c.stroke();
        c.lineWidth = 6.5; c.strokeStyle = col; c.stroke();
        c.beginPath(); c.arc(8, -8, 12, 1.6 * Math.PI, 2.0 * Math.PI); c.strokeStyle = tip; c.lineWidth = 5; c.stroke();
        break;
      case 'nub':
        ell(c, 4, 0, 5, 4.5, col);
        break;
      case 'pom':
        c.beginPath(); c.moveTo(0, 4); c.lineTo(8, -6); c.strokeStyle = DO.OUT; c.lineWidth = 4; c.stroke();
        ell(c, 10, -10, 8, 8, col);
        break;
      case 'whip': // 臘腸細長尾
        c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(16, 2, 22, -16);
        c.lineCap = 'round'; c.strokeStyle = DO.OUT; c.lineWidth = 6; c.stroke(); c.strokeStyle = col; c.lineWidth = 3.8; c.stroke();
        break;
      case 'upright': // 米格魯尾巴白尖
        c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(10, -2, 11, -18);
        c.lineCap = 'round'; c.strokeStyle = DO.OUT; c.lineWidth = 7; c.stroke(); c.strokeStyle = col; c.lineWidth = 5; c.stroke();
        ell(c, 11, -19, 3.4, 4, tip);
        break;
      case 'otter': // 拉拉粗圓尾
        ell(c, 11, 2, 14, 5.5, col, DO.OUT, 1.5, -0.25);
        break;
      case 'saber': // 鐮刀形蓬尾
        c.beginPath(); c.moveTo(0, 8); c.quadraticCurveTo(20, 8, 20, -10);
        c.lineCap = 'round'; c.strokeStyle = DO.OUT; c.lineWidth = 11; c.stroke(); c.strokeStyle = col; c.lineWidth = 8.5; c.stroke();
        c.beginPath(); c.moveTo(18, 4); c.quadraticCurveTo(20.5, -2, 20, -10); c.strokeStyle = tip; c.lineWidth = 5; c.stroke();
        break;
      default: // plume 羽毛長尾
        c.beginPath(); c.moveTo(0, 8); c.quadraticCurveTo(18, 10, 22, -8);
        c.lineCap = 'round'; c.strokeStyle = DO.OUT; c.lineWidth = 12; c.stroke(); c.strokeStyle = col; c.lineWidth = 9.5; c.stroke();
        c.beginPath(); c.moveTo(19, 2); c.quadraticCurveTo(22, -2, 22, -8); c.strokeStyle = tip || col; c.lineWidth = 6; c.stroke();
    }
    c.restore();
  };

  // 軀幹與前腳。o: {breath(-1..1), lean, typing(0..1,t)}
  DO.drawTorso = function (c, S, o) {
    const b = S.body, br = o.breath || 0;
    ell(c, 0, 24, b.w + br * 0.6, b.h + br, S.coat);
    // 蓬鬆毛（貴賓／雪納瑞胸前）與胸前花色
    if (S.chest !== S.coat) ell(c, 0, 20 + br, b.w * 0.5, b.h * 0.62, S.chest, false);
    if (S.id === 'bibi') ell(c, 0, 8, b.w * 0.62, 10, S.coat, false);
    if (S.id === 'mumu') { ell(c, 0, 26, b.w * 0.9, b.h * 0.8, '#2f2926', false); ell(c, 0, 14, 11, 12, '#d8a65a', false); }
    if (S.id === 'xiaoha') ell(c, 0, 18, b.w * 0.55, b.h * 0.6, '#ffffff', false);
    if (S.id === 'jinjin') for (let i = -2; i <= 2; i++) ell(c, i * 5, 12 + Math.abs(i), 4, 5, '#f0c36c', false);
    // 脖子陰影
    ell(c, 0, -2, b.w * 0.55, 6, shade(S.coat, -0.12), false);
    const ex = DO.BODYEX[S.id]; if (ex) ex(c, S, o);
  };

  // 配件：穿戴在身上
  DO.BODYEX = {
    butler(c, S) { // 深色背心＋蝴蝶結
      poly(c, [[-22, 6], [-5, 4], [0, 40], [-24, 40]], '#2a3350', DO.OUT, 1.3);
      poly(c, [[22, 6], [5, 4], [0, 40], [24, 40]], '#2a3350', DO.OUT, 1.3);
      for (let i = 0; i < 3; i++) ell(c, 0, 14 + i * 9, 1.6, 1.6, '#d9b45a', false);
      poly(c, [[0, 3], [-11, -2], [-11, 9]], '#9c1f2e', DO.OUT, 1.2);
      poly(c, [[0, 3], [11, -2], [11, 9]], '#9c1f2e', DO.OUT, 1.2);
      ell(c, 0, 3, 3.2, 3.6, '#7a1220', DO.OUT, 1);
    },
    director(c) { // 小圍巾
      poly(c, [[-18, 0], [18, 0], [16, 8], [-16, 8]], '#e8b830', DO.OUT, 1.3);
      poly(c, [[6, 6], [14, 6], [16, 22], [8, 22]], '#e8b830', DO.OUT, 1.3);
      for (let i = 0; i < 3; i++) DO.line(c, -14 + i * 12, 2, -13 + i * 12, 7, '#c8372d', 2);
    },
    shiba(c) { ell(c, 0, 3, 17, 4, '#3b6ea5', DO.OUT, 1.2); ell(c, 0, 8, 3.2, 3.2, '#ffd35c', DO.OUT, 1); },
    lala(c) { ell(c, 0, 3, 18, 4, '#3aa07a', DO.OUT, 1.2); },
    keke(c) { ell(c, 0, 3, 17, 4, '#d84a4a', DO.OUT, 1.2); ell(c, 0, 8, 3, 3, '#fff', DO.OUT, 1); },
    nana(c) { // 胸前一小片白色毛（不是圍領）
      poly(c, [[-8, 4], [8, 4], [10, 14], [5, 20], [0, 15], [-5, 20], [-10, 14]], '#fffaf0', DO.OUT, 1.2);
    },
    lady(c) { // 胸口與肩側的長毛
      for (let i = 0; i < 4; i++) { ell(c, -14 + i * 9, 22 + (i % 2) * 3, 5, 9, '#d9a35c', false, 0, 0); }
    },
    jinjin(c) { ell(c, 0, 3, 18, 4, '#c9a02a', DO.OUT, 1.2); },
  };

  // 前腳（在桌面上）。x 為中心偏移，lift 為抬起量
  DO.drawPaw = function (c, S, x, y, lift) {
    ell(c, x, y - lift, 7.5, 5.5, S.id === 'mumu' || S.id === 'apo' ? S.chest : S.chest === S.coat ? S.coat : S.chest);
    c.strokeStyle = DO.OUT; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 1.5, y - lift + 1); c.lineTo(x - 1.5, y - lift + 4);
    c.moveTo(x + 2, y - lift + 1); c.lineTo(x + 2, y - lift + 4); c.stroke();
  };
})();
