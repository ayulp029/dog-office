// 靜態房間：牆、地板、窗、書櫃、白板、地毯、陽光（畫一次存成離屏畫布）
(function () {
  const DO = window.DO;
  const { rrect, line, poly, ell } = DO;
  const WALL_H = 158;

  DO.buildRoom = function () {
    const W = DO.CFG.W, H = DO.CFG.H;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');

    // 牆
    const wg = c.createLinearGradient(0, 0, 0, WALL_H);
    wg.addColorStop(0, '#fbe9c8'); wg.addColorStop(1, '#f3d8a8');
    c.fillStyle = wg; c.fillRect(0, 0, W, WALL_H);
    // 牆面淡淡直條紋
    c.fillStyle = 'rgba(255,255,255,.18)';
    for (let x = 0; x < W; x += 48) c.fillRect(x, 0, 24, WALL_H);
    // 木頭地板（橫向木條，交錯接縫）
    const fy = WALL_H + 8, rnd = DO.rng(11);
    const woods = ['#e8c28a', '#e1b87c', '#ebc994', '#dfb578'];
    let row = 0;
    for (let y = fy; y < H; y += 26, row++) {
      let x = -((row * 97) % 180);
      while (x < W) {
        const w = 140 + (rnd() * 80) | 0;
        c.fillStyle = woods[(rnd() * woods.length) | 0]; c.fillRect(x, y, w, 26);
        c.fillStyle = 'rgba(120,70,20,.25)'; c.fillRect(x, y, w, 1.5); c.fillRect(x + w - 1.5, y, 1.5, 26);
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x, y + 2, w, 3);
        x += w;
      }
    }
    // 地板遠處加深（靠牆處陰影）
    const sg = c.createLinearGradient(0, WALL_H, 0, WALL_H + 70);
    sg.addColorStop(0, 'rgba(90,50,10,.28)'); sg.addColorStop(1, 'rgba(90,50,10,0)');
    c.fillStyle = sg; c.fillRect(0, WALL_H, W, 70);
    // 踢腳板
    c.fillStyle = '#b98652'; c.fillRect(0, WALL_H, W, 8); c.fillStyle = '#8a5f36'; c.fillRect(0, WALL_H + 7, W, 2);

    // 中央走道地毯
    const rx = 70, rw = W - 140, ry = 352, rh = 96;
    rrect(c, rx, ry, rw, rh, 16, '#d9755a', '#a8503a', 3);
    rrect(c, rx + 10, ry + 8, rw - 20, rh - 16, 10, false, 'rgba(255,240,210,.8)', 2);
    c.fillStyle = 'rgba(255,240,210,.35)';
    for (let x = rx + 36; x < rx + rw - 30; x += 44) { poly(c, [[x, ry + rh / 2], [x + 8, ry + rh / 2 - 8], [x + 16, ry + rh / 2], [x + 8, ry + rh / 2 + 8]], 'rgba(255,240,210,.4)', false); }

    // 牆上家具
    DO.drawShelf(c, 10, 46, 118, 82);
    DO.drawWindow(c, 160, 22, 112, 84);
    DO.drawWindow(c, 308, 22, 112, 84);
    DO.drawWhiteboard(c, 448, 14, 128, 92);
    DO.drawWindow(c, 628, 22, 112, 84);
    DO.drawWindow(c, 776, 22, 112, 84);
    // 掛畫
    rrect(c, 922, 24, 54, 44, 3, '#fff6e4', '#8a5a30', 3);
    poly(c, [[926, 64], [942, 44], [956, 56], [964, 48], [972, 64]], '#7bbf8a', false); ell(c, 958, 36, 5, 5, '#ffd35c', false);

    // 陽光斜影（從窗戶打到地板）
    c.save();
    c.globalCompositeOperation = 'source-over';
    [[160, 112], [308, 112], [628, 112], [776, 112]].forEach(([x, w]) => {
      const g = c.createLinearGradient(x, WALL_H, x + 90, H);
      g.addColorStop(0, 'rgba(255,244,200,.30)'); g.addColorStop(1, 'rgba(255,244,200,0)');
      c.fillStyle = g;
      c.beginPath(); c.moveTo(x, WALL_H + 8); c.lineTo(x + w, WALL_H + 8); c.lineTo(x + w + 150, H); c.lineTo(x + 40, H); c.closePath(); c.fill();
    });
    c.restore();
    return cv;
  };
})();
