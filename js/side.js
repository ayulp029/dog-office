// 側面走路的狗（朝右，原點＝腳底中央）。walk 為步伐相位。
(function () {
  const DO = window.DO;
  const { ell, poly, shade } = DO;

  DO.drawSide = function (c, S, o) {
    const s = S.side, L = s.len, bh = s.bh, lg = s.leg, ph = o.walk || 0, moving = o.moving ? 1 : 0;
    const bob = Math.abs(Math.sin(ph)) * 1.6 * moving;
    const by = -lg - bh * 0.5 - bob; // 身體中心
    const dark = shade(S.coat, -0.2);
    const swing = (k) => Math.sin(ph + k) * 7 * moving;
    c.save();
    // 後側的腿
    leg(c, -L * 0.32 + swing(Math.PI), by, lg + bob, dark, S);
    leg(c, L * 0.3 + swing(0), by, lg + bob, dark, S);
    // 尾巴
    tail(c, S, -L * 0.5, by - bh * 0.2, o);
    // 身體
    const bodyCol = s.saddle ? s.saddle : S.coat;
    ell(c, 0, by, L * 0.55, bh * 0.52, S.coat);
    if (s.saddle) { c.save(); c.beginPath(); c.ellipse(-2, by - 1, L * 0.5, bh * 0.4, 0, Math.PI, 2 * Math.PI); c.fillStyle = bodyCol; c.fill(); c.restore(); }
    if (S.chest !== S.coat && !s.saddle) ell(c, L * 0.28, by + bh * 0.14, L * 0.22, bh * 0.3, S.chest, false);
    if (s.rump) ell(c, -L * 0.32, by - 2, 10, bh * 0.55, S.coat);
    if (s.pom) ell(c, 0, by - 2, L * 0.4, bh * 0.4, S.coat, false);
    // 前側的腿
    leg(c, -L * 0.3 + swing(0), by, lg + bob, S.coat, S);
    leg(c, L * 0.32 + swing(Math.PI), by, lg + bob, S.coat, S);
    // 配件（背心／領巾）
    if (S.id === 'butler') { ell(c, 3, by + 1, L * 0.3, bh * 0.4, '#2a3350', false); }
    if (S.id === 'director') { ell(c, L * 0.42, by - bh * 0.35, 6, 4, '#e8b830', DO.OUT, 1); }
    // 頭
    const hx = L * 0.52, hy = by - bh * 0.55 - (s.hr * 0.2);
    head(c, S, hx, hy, o);
    c.restore();
  };

  function leg(c, x, by, h, col, S) {
    const top = by + 2, bottom = -1;
    c.beginPath(); c.moveTo(x, top); c.lineTo(x + 1.5, bottom - 1);
    c.lineCap = 'round'; c.strokeStyle = DO.OUT; c.lineWidth = 7; c.stroke();
    c.strokeStyle = col; c.lineWidth = 4.8; c.stroke();
    ell(c, x + 2.5, bottom - 1, 4.6, 2.8, S.chest === S.coat ? col : (S.id === 'apo' || S.id === 'shiba' || S.id === 'keke' ? S.chest : col));
  }

  function tail(c, S, x, y, o) {
    const T = S.tail, w = Math.sin((o.t || 0) * 9) * 0.25;
    c.save(); c.translate(x, y); c.rotate(w);
    c.lineCap = 'round';
    const stroke = (path, wd) => { c.strokeStyle = DO.OUT; c.lineWidth = wd + 2.5; c.stroke(path); c.strokeStyle = T.col; c.lineWidth = wd; c.stroke(path); };
    if (T.type === 'curl') { c.beginPath(); c.arc(-2, -9, 9, 0.3 * Math.PI, 2.1 * Math.PI); c.strokeStyle = DO.OUT; c.lineWidth = 8.5; c.stroke(); c.strokeStyle = T.col; c.lineWidth = 6; c.stroke(); }
    else if (T.type === 'nub') ell(c, -2, 0, 4, 3.5, T.col);
    else if (T.type === 'pom') { c.beginPath(); c.moveTo(0, 0); c.lineTo(-5, -6); c.strokeStyle = DO.OUT; c.lineWidth = 3; c.stroke(); ell(c, -8, -9, 7, 7, T.col); }
    else if (T.type === 'whip') stroke(new Path2D('M0 0 Q-16 -2 -26 -12'), 3.5);
    else if (T.type === 'upright') { stroke(new Path2D('M0 0 Q-6 -8 -6 -18'), 4.5); ell(c, -6, -19, 3, 3.6, T.tip); }
    else if (T.type === 'otter') ell(c, -12, 2, 12, 5, T.col, DO.OUT, 1.5, 0.3);
    else if (T.type === 'saber') stroke(new Path2D('M0 0 Q-16 4 -22 14'), 8);
    else stroke(new Path2D('M0 0 Q-14 -2 -22 10'), 8);
    c.restore();
  }

  function head(c, S, x, y, o) {
    const s = S.side, r = s.hr, sn = s.sn;
    c.save(); c.translate(x, y);
    // 後耳
    const ex = r * 0.1;
    if (s.ear === 'floppy') ell(c, -3, 4, 5.5, r * 0.85, s.earCol || shade(S.coat, -0.2), DO.OUT, 1.3, 0.25);
    if (s.ear === 'fluff') ell(c, -4, 6, 6.5, r * 0.9, S.coat);
    // 頭與口吻
    ell(c, 0, 0, r, r * 0.92, S.coat);
    ell(c, r * 0.6 + sn * 0.3, r * 0.28, sn * 0.7 + 3, r * 0.42, S.muzzle);
    if (s.mask) ell(c, r * 0.7 + sn * 0.3, r * 0.2, sn * 0.65 + 2, r * 0.38, '#2f2926', false);
    if (s.husky) ell(c, r * 0.35, r * 0.2, r * 0.6, r * 0.55, '#ffffff', false);
    if (s.beard) { poly(c, [[r * 0.3, r * 0.5], [r * 1.5, r * 0.5], [r * 1.2, r * 1.2], [r * 0.4, r * 1.1]], '#eceef0', DO.OUT, 1.1); }
    ell(c, r * 0.6 + sn * 0.75 + 2, r * 0.05, 2.8, 2.3, S.nose, false);
    // 眼
    const blink = o.blink > 0.5;
    if (blink) DO.line(c, r * 0.35, -r * 0.15, r * 0.65, -r * 0.15, DO.OUT, 1.5);
    else { ell(c, r * 0.5, -r * 0.15, 2.4, 2.6, S.eye === '#58b5e8' ? '#3a9ad8' : S.eye, false); ell(c, r * 0.43, -r * 0.25, 0.9, 0.9, '#fff', false); }
    if (s.beard || S.id === 'nana') { c.strokeStyle = '#6b4a2a'; c.lineWidth = 1.5; c.beginPath(); c.arc(r * 0.5, -r * 0.15, 4.2, 0, Math.PI * 2); c.stroke(); }
    if (S.id === 'maomao') { ell(c, 0, -r * 0.9, 7, 7, '#fbf8f1'); }
    if (S.id === 'director') { c.save(); c.translate(-1, -r * 0.85); c.rotate(-0.2); ell(c, 0, 0, 12, 4.5, '#c8372d'); c.restore(); }
    // 前耳
    if (s.ear === 'prick') poly(c, [[-r * 0.1, -r * 0.6], [r * 0.15, -r * 1.55], [r * 0.6, -r * 0.7]], S.coat);
    if (s.ear === 'semi') poly(c, [[-r * 0.2, -r * 0.6], [r * 0.2, -r * 1.5], [r * 0.4, -r * 1.2], [r * 0.6, -r * 0.7]], S.coat);
    if (s.ear === 'bat') poly(c, [[-r * 0.3, -r * 0.55], [r * 0.05, -r * 1.7], [r * 0.7, -r * 0.7]], S.coat);
    if (s.ear === 'rose') poly(c, [[-r * 0.1, -r * 0.7], [r * 0.2, -r * 1.2], [r * 0.7, -r * 0.4]], s.beard ? '#6b7078' : '#8f8f99');
    c.restore();
  }
})();
