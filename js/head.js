// 正面頭部（原點＝頭中心）。依 spec 畫耳朵、臉、口吻、眼睛，品種特色由 DO.EXTRA 補。
(function () {
  const DO = window.DO;
  const { ell, poly, line, shade } = DO;
  DO.EXTRA = DO.EXTRA || {};

  function earPrick(c, S, sx, wob) {
    const e = S.ears, bx = sx * e.x, by = e.y;
    const tipx = bx + sx * (e.tilt + 2) + wob, tipy = by - e.h;
    poly(c, [[bx - e.w * 0.9, by + 6], [tipx, tipy], [bx + e.w * 0.9, by + 6]], e.col);
    poly(c, [[bx - e.w * 0.4, by + 3], [tipx, tipy + 6], [bx + e.w * 0.4, by + 3]], e.inner, false);
  }
  function earSemi(c, S, sx, wob) { // 尖端折向前
    const e = S.ears, bx = sx * e.x, by = e.y;
    const tipx = bx + sx * e.tilt + wob, tipy = by - e.h;
    poly(c, [[bx - e.w * 0.9, by + 6], [tipx - sx * 2, tipy + 3], [tipx + sx * 4, tipy + 10], [bx + e.w * 0.9, by + 6]], e.col);
    poly(c, [[bx - e.w * 0.4, by + 3], [tipx - sx, tipy + 9], [bx + e.w * 0.4, by + 3]], e.inner, false);
  }
  function earBat(c, S, sx, wob) { // 柯基大圓耳
    const e = S.ears, bx = sx * e.x, by = e.y;
    c.beginPath();
    c.moveTo(bx - e.w, by + 8);
    c.quadraticCurveTo(bx - e.w * 0.9 + sx * 3, by - e.h * 1.05, bx + sx * (e.tilt + 4) + wob, by - e.h);
    c.quadraticCurveTo(bx + e.w * 1.3 + sx * 3, by - e.h * 0.5, bx + e.w, by + 8);
    c.closePath(); c.fillStyle = e.col; c.fill(); c.strokeStyle = DO.OUT; c.lineWidth = 1.5; c.stroke();
    ell(c, bx + sx * 1, by - e.h * 0.35, e.w * 0.45, e.h * 0.42, e.inner, false);
  }
  function earFloppy(c, S, sx, wob) {
    const e = S.ears;
    if (e.wavy) { // 可卡波浪長耳
      // 長而下垂的波浪耳：從頭側一路掛到肩膀
      for (let i = 0; i < 6; i++) {
        const off = Math.sin(i * 1.5 + wob * 0.15) * 2.2;
        const w = e.w + (i < 4 ? i * 0.5 : 2 - (i - 4) * 1.5);
        ell(c, sx * (e.x + off + i * 0.5), e.y - 4 + i * 8, w, 7.2, i % 2 ? shade(e.col, -0.1) : e.col);
      }
      return;
    }
    c.save(); c.translate(sx * e.x, e.y); c.rotate(sx * e.tilt + wob * 0.01);
    ell(c, 0, 0, e.w, e.h, e.col);
    c.restore();
  }
  function earRose(c, S, sx) {
    const e = S.ears;
    poly(c, [[sx * (e.x - e.w), e.y - e.h * 0.2], [sx * (e.x + 2), e.y - e.h * 0.9], [sx * (e.x + e.w * 0.9), e.y + e.h * 0.4]], e.col);
    poly(c, [[sx * (e.x - e.w * 0.3), e.y - e.h * 0.1], [sx * (e.x + 2), e.y - e.h * 0.6], [sx * (e.x + e.w * 0.6), e.y + e.h * 0.2]], e.inner, false);
  }
  function earFluff(c, S, sx, wob) { // 貴賓蓬鬆耳
    const e = S.ears;
    for (let i = 0; i < 6; i++) {
      const a = i / 5;
      ell(c, sx * (e.x + Math.sin(a * 3 + wob * 0.1) * 2), e.y - 8 + a * 22, e.w - a * 2, 8.5, e.col);
    }
  }
  const EARS = { prick: earPrick, semi: earSemi, bat: earBat, floppy: earFloppy, rose: earRose, fluff: earFluff };
  const EAR_FRONT = { floppy: 1, fluff: 1 }; // 垂耳畫在頭後方（head 蓋住內緣）

  function eyes(c, S, o) {
    const closed = o.sleep || o.blink > 0.5;
    for (const sx of [-1, 1]) {
      const x = sx * S.eyeDx, y = S.eyeY;
      if (closed) {
        c.beginPath(); c.arc(x, y + (o.sleep ? 0 : 1), S.eyeR * 0.9, o.sleep ? 0.15 * Math.PI : 1.15 * Math.PI, o.sleep ? 0.85 * Math.PI : 1.85 * Math.PI, !o.sleep);
        c.strokeStyle = DO.OUT; c.lineWidth = 1.8; c.lineCap = 'round'; c.stroke();
        continue;
      }
      const lx = (o.lookX || 0) * 1.6, ly = (o.lookY || 0) * 1.2;
      if (S.husky || S.eye === '#58b5e8') {
        ell(c, x, y, S.eyeR + 0.6, S.eyeR + 0.6, '#ffffff', false);
        ell(c, x + lx, y + ly, S.eyeR, S.eyeR, S.eye, false);
        ell(c, x + lx, y + ly, S.eyeR * 0.5, S.eyeR * 0.5, '#101820', false);
      } else {
        ell(c, x + lx, y + ly, S.eyeR, S.eyeR * 1.1, S.eye, false);
      }
      ell(c, x + lx - 1, y + ly - 1.2, 1.1, 1.1, '#ffffff', false);
    }
  }

  function snout(c, S, o) {
    const sn = S.snout;
    ell(c, 0, sn.y, sn.w, sn.h, S.muzzle, DO.OUT, 1.2);
    // 鼻子
    const ny = sn.y - sn.h * 0.45;
    ell(c, 0, ny, sn.w * 0.42, sn.h * 0.3, S.nose, false);
    ell(c, -1.2, ny - 1, 1.5, 0.9, 'rgba(255,255,255,.55)', false);
    // 嘴
    c.strokeStyle = DO.OUT; c.lineWidth = 1.3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, ny + 2); c.lineTo(0, sn.y + 1.5); c.stroke();
    const open = o.pant ? 3 : 0;
    c.beginPath();
    c.moveTo(-sn.w * 0.55, sn.y + 1); c.quadraticCurveTo(-sn.w * 0.25, sn.y + 4 + open, 0, sn.y + 1.5);
    c.quadraticCurveTo(sn.w * 0.25, sn.y + 4 + open, sn.w * 0.55, sn.y + 1); c.stroke();
    if (o.pant || o.happy) ell(c, 0, sn.y + 5 + open, 3, 3.2 + open * 0.5, '#f0808c', DO.OUT, 1);
  }

  // o: {t, blink, lookX, lookY, sleep, pant, happy, wob}
  DO.drawHead = function (c, S, o) {
    const ex = DO.EXTRA[S.id] || {};
    const ear = EARS[S.ears.type], wob = o.earWob || 0;
    c.save();
    if (ex.back) ex.back(c, S, o);
    ear(c, S, -1, wob); ear(c, S, 1, -wob);
    ell(c, 0, 0, S.head.w, S.head.h, S.coat);
    if (ex.mark) ex.mark(c, S, o);
    snout(c, S, o);
    eyes(c, S, o);
    if (ex.front) ex.front(c, S, o);
    c.restore();
  };
})();
