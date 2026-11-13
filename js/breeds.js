// 14 種犬的外觀參數（正面半身 + 側面走路共用毛色）
(function () {
  const DO = (window.DO = window.DO || {});
  // ears.type: prick | bat | semi | floppy | rose | fluff
  // tail.type: curl | nub | pom | whip | plume | otter | saber | upright
  // side: 側面走路參數  len 身長, bh 身高(厚度), leg 腿長, hr 頭半徑, sn 口吻長, ear
  DO.BREEDS = {
    nana: { // 喜樂蒂牧羊犬
      coat: '#d6a064', chest: '#fff8ec', muzzle: '#fff3e0', nose: '#2b2320', eye: '#3a2418',
      head: { w: 22, h: 24 }, body: { w: 27, h: 30 }, eyeDx: 10, eyeY: -3, eyeR: 3.3,
      snout: { w: 9, h: 11, y: 11 }, ears: { type: 'semi', w: 10, h: 18, x: 13, y: -17, col: '#b9783a', inner: '#f2c9a0', tilt: 5 },
      tail: { type: 'plume', col: '#d6a064', tip: '#fff8ec' },
      side: { len: 40, bh: 22, leg: 17, hr: 12, sn: 13, ear: 'semi', fluff: '#fff8ec' },
    },
    apo: { // 邊境牧羊犬
      coat: '#2d2d33', chest: '#fbfbfb', muzzle: '#fbfbfb', nose: '#161616', eye: '#6a3a1a',
      head: { w: 23, h: 24 }, body: { w: 26, h: 30 }, eyeDx: 10, eyeY: -3, eyeR: 3.2,
      snout: { w: 9, h: 11, y: 11 }, ears: { type: 'semi', w: 10, h: 17, x: 15, y: -18, col: '#2d2d33', inner: '#6b5a5a', tilt: 9 },
      tail: { type: 'plume', col: '#2d2d33', tip: '#fbfbfb' },
      side: { len: 40, bh: 20, leg: 19, hr: 12, sn: 13, ear: 'semi', white: true },
    },
    maomao: { // 貴賓
      coat: '#fbf8f1', chest: '#fbf8f1', muzzle: '#fffdf8', nose: '#262626', eye: '#2a1f1a',
      head: { w: 21, h: 22 }, body: { w: 25, h: 29 }, eyeDx: 9, eyeY: -2, eyeR: 3,
      snout: { w: 8, h: 10, y: 10 }, ears: { type: 'fluff', w: 12, h: 22, x: 18, y: 2, col: '#f6efe2', inner: '#fbf8f1' },
      tail: { type: 'pom', col: '#fbf8f1' },
      side: { len: 34, bh: 21, leg: 20, hr: 11, sn: 12, ear: 'fluff', pom: true },
    },
    butler: { // 英國鬥牛犬
      coat: '#b9b9c2', chest: '#e6e6ec', muzzle: '#d3d3da', nose: '#2a2a30', eye: '#2a1f1a',
      head: { w: 29, h: 24 }, body: { w: 33, h: 30 }, eyeDx: 12, eyeY: -4, eyeR: 3.2,
      snout: { w: 15, h: 10, y: 9 }, ears: { type: 'rose', w: 9, h: 9, x: 21, y: -17, col: '#8f8f99', inner: '#c9a0a8' },
      tail: { type: 'nub', col: '#b9b9c2' },
      side: { len: 38, bh: 25, leg: 12, hr: 14, sn: 7, ear: 'rose', wide: true },
    },
    shiba: { // 柴犬
      coat: '#d2762f', chest: '#fff2dd', muzzle: '#fff2dd', nose: '#222', eye: '#2b1a10',
      head: { w: 25, h: 22 }, body: { w: 26, h: 29 }, eyeDx: 11, eyeY: -3, eyeR: 3,
      snout: { w: 10, h: 9, y: 9 }, ears: { type: 'prick', w: 9, h: 15, x: 15, y: -17, col: '#d2762f', inner: '#f4b98a', tilt: 3 },
      tail: { type: 'curl', col: '#d2762f', tip: '#fff2dd' },
      side: { len: 36, bh: 20, leg: 17, hr: 12, sn: 9, ear: 'prick', cream: true },
    },
    bibi: { // 米格魯
      coat: '#b9763a', chest: '#ffffff', muzzle: '#fff7ea', nose: '#222', eye: '#3a2214',
      head: { w: 24, h: 22 }, body: { w: 27, h: 29 }, eyeDx: 10, eyeY: -3, eyeR: 3.2,
      snout: { w: 10, h: 10, y: 10 }, ears: { type: 'floppy', w: 10, h: 21, x: 21, y: 4, col: '#7a4320', inner: '#7a4320', tilt: 0.12 },
      tail: { type: 'upright', col: '#b9763a', tip: '#ffffff' },
      side: { len: 38, bh: 20, leg: 16, hr: 12, sn: 12, ear: 'floppy', earCol: '#7a4320', saddle: '#2f2a28' },
    },
    lady: { // 美國可卡
      coat: '#cf9650', chest: '#e5b779', muzzle: '#e8c288', nose: '#2a1d18', eye: '#35200f',
      head: { w: 22, h: 23 }, body: { w: 26, h: 29 }, eyeDx: 10, eyeY: -3, eyeR: 3.4,
      snout: { w: 9, h: 9, y: 10 }, ears: { type: 'floppy', w: 8.5, h: 22, x: 21, y: 2, col: '#a8691f', inner: '#a8691f', tilt: 0.1, wavy: true },
      tail: { type: 'plume', col: '#cf9650', tip: '#e5b779' },
      side: { len: 36, bh: 20, leg: 14, hr: 12, sn: 11, ear: 'floppy', earCol: '#b87a34' },
    },
    lala: { // 黃色拉布拉多
      coat: '#eed07a', chest: '#f6e2a0', muzzle: '#f6e2a0', nose: '#2a2420', eye: '#3b2512',
      head: { w: 25, h: 23 }, body: { w: 29, h: 31 }, eyeDx: 11, eyeY: -3, eyeR: 3.3,
      snout: { w: 12, h: 10, y: 10 }, ears: { type: 'floppy', w: 9, h: 15, x: 23, y: -5, col: '#d8b45a', inner: '#d8b45a', tilt: 0.45 },
      tail: { type: 'otter', col: '#e8c264' },
      side: { len: 42, bh: 23, leg: 18, hr: 13, sn: 13, ear: 'floppy', earCol: '#d1a548' },
    },
    xiaoha: { // 哈士奇
      coat: '#7d8795', chest: '#ffffff', muzzle: '#ffffff', nose: '#222', eye: '#58b5e8',
      head: { w: 24, h: 23 }, body: { w: 27, h: 30 }, eyeDx: 10, eyeY: -4, eyeR: 3.4,
      snout: { w: 10, h: 10, y: 10 }, ears: { type: 'prick', w: 9, h: 17, x: 15, y: -17, col: '#6a7482', inner: '#f2c7c7', tilt: 0 },
      tail: { type: 'saber', col: '#7d8795', tip: '#ffffff' },
      side: { len: 40, bh: 21, leg: 18, hr: 12, sn: 12, ear: 'prick', husky: true },
    },
    keke: { // 柯基
      coat: '#e48a2c', chest: '#ffffff', muzzle: '#fff4e2', nose: '#222', eye: '#3a2010',
      head: { w: 24, h: 21 }, body: { w: 28, h: 28 }, eyeDx: 10, eyeY: -3, eyeR: 3.3,
      snout: { w: 9, h: 10, y: 9 }, ears: { type: 'bat', w: 11, h: 24, x: 14, y: -15, col: '#e48a2c', inner: '#f5b8a0', tilt: 5 },
      tail: { type: 'nub', col: '#e48a2c' },
      side: { len: 38, bh: 22, leg: 8, hr: 12, sn: 11, ear: 'bat', white: true, rump: true },
    },
    director: { // 臘腸
      coat: '#9c4a22', chest: '#b8663a', muzzle: '#b8663a', nose: '#1d1512', eye: '#2a170c',
      head: { w: 19, h: 22 }, body: { w: 22, h: 30 }, eyeDx: 9, eyeY: -3, eyeR: 3,
      snout: { w: 8, h: 12, y: 12 }, ears: { type: 'floppy', w: 9, h: 20, x: 18, y: 4, col: '#7c3718', inner: '#7c3718', tilt: 0.08 },
      tail: { type: 'whip', col: '#9c4a22' },
      side: { len: 54, bh: 17, leg: 8, hr: 11, sn: 15, ear: 'floppy', earCol: '#7c3718' },
    },
    jinjin: { // 黃金獵犬
      coat: '#d8942e', chest: '#eab560', muzzle: '#edc280', nose: '#2a2018', eye: '#3a210e',
      head: { w: 24, h: 23 }, body: { w: 29, h: 31 }, eyeDx: 10.5, eyeY: -3, eyeR: 3.3,
      snout: { w: 11, h: 10, y: 10 }, ears: { type: 'floppy', w: 10, h: 25, x: 21, y: 8, col: '#b97a1f', inner: '#b97a1f', tilt: 0.1 },
      tail: { type: 'plume', col: '#e3a53f', tip: '#f0c36c' },
      side: { len: 42, bh: 23, leg: 18, hr: 13, sn: 12, ear: 'floppy', earCol: '#c98826', feather: '#f0c36c' },
    },
    mumu: { // 德國牧羊犬
      coat: '#cc9142', chest: '#d8a65a', muzzle: '#2f2926', nose: '#111', eye: '#2a1608',
      head: { w: 23, h: 24 }, body: { w: 28, h: 31 }, eyeDx: 10, eyeY: -4, eyeR: 3.1,
      snout: { w: 10, h: 12, y: 11 }, ears: { type: 'prick', w: 11, h: 21, x: 14, y: -18, col: '#cc9142', inner: '#3a2c24', tilt: 1 },
      tail: { type: 'saber', col: '#3a2f28', tip: '#cc9142' },
      side: { len: 42, bh: 22, leg: 20, hr: 12, sn: 14, ear: 'prick', saddle: '#2f2926', mask: true },
    },
    xuebo: { // 雪納瑞
      coat: '#8d9299', chest: '#c9cdd2', muzzle: '#e6e8ea', nose: '#161616', eye: '#25201c',
      head: { w: 21, h: 23 }, body: { w: 26, h: 29 }, eyeDx: 9.5, eyeY: -4, eyeR: 2.9,
      snout: { w: 12, h: 11, y: 11 }, ears: { type: 'rose', w: 8, h: 12, x: 17, y: -17, col: '#6b7078', inner: '#a8a0a0' },
      tail: { type: 'nub', col: '#8d9299' },
      side: { len: 36, bh: 22, leg: 16, hr: 12, sn: 10, ear: 'rose', beard: true },
    },
  };
})();
