// 房間外殼：地板、三面牆（含窗戶與窗外景）、梁、白板、時鐘、燈光
import * as THREE from 'three';
import { box, cyl, mat, canvasTex, rng } from './kit.js';

const T = 0.3;                 // 牆厚
const WIN = { y0: 1.5, y1: 4.7 };

function floorTex() {
  return canvasTex(256, 256, (c, w, h) => {
    const r = rng(7);
    c.fillStyle = '#d9b98c'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        const v = Math.floor(r() * 18) - 9;
        c.fillStyle = `rgb(${217 + v},${185 + v},${140 + v})`;
        c.fillRect(((j + (i % 2) * 0.5) % 2) * 128 - 64, i * 64, 128, 64);
        c.fillRect(((j + (i % 2) * 0.5) % 2) * 128 + 192, i * 64, 128, 64);
      }
      c.fillStyle = 'rgba(120,80,40,0.28)'; c.fillRect(0, i * 64, w, 2);
      c.fillRect((i % 2) * 64 + 62, i * 64, 2, 64); c.fillRect((i % 2) * 64 + 190, i * 64, 2, 64);
    }
  }, { repeat: [7, 5] });
}

// 窗外：天空、雲、遠方大樓、近處樹葉。平面高 12（y -5..7），所以用世界 y 來畫
function outdoorTex() {
  return canvasTex(1024, 512, (c, w, h) => {
    const Y = (y) => ((7 - y) / 12) * h, r = rng(21);
    const g = c.createLinearGradient(0, 0, 0, Y(1.5));
    g.addColorStop(0, '#9fd0f2'); g.addColorStop(1, '#e6f5fb');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 9; i++) {
      const x = r() * w, y = Y(4.6 + r() * 2), s = 26 + r() * 30;
      for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x + (k - 1.5) * s * 0.6, y + (k % 2) * 5, s * 0.6, s * 0.34, 0, 0, 7); c.fill(); }
    }
    const cols = ['#b9c6d6', '#c9d3df', '#a9b9cc', '#d6cfc6', '#bfd0d9'];
    for (let x = -10; x < w;) {
      const bw = 36 + r() * 46, top = Y(2.6 + r() * 2.6);
      c.fillStyle = cols[Math.floor(r() * cols.length)]; c.fillRect(x, top, bw, h - top);
      c.fillStyle = 'rgba(255,255,255,0.55)';
      for (let yy = top + 8; yy < Y(1.2); yy += 13) for (let xx = x + 6; xx < x + bw - 8; xx += 11) if (r() > 0.25) c.fillRect(xx, yy, 5, 7);
      x += bw + 2 + r() * 14;
    }
    c.fillStyle = '#7fb56b'; c.fillRect(0, Y(1.3), w, h);
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = Y(1.2 + r() * 1.3), s = 22 + r() * 26;
      c.fillStyle = ['#6fae5e', '#86c172', '#5c9a50', '#9bcf83'][Math.floor(r() * 4)];
      c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
    }
  });
}

function boardTex() {
  return canvasTex(512, 256, (c, w, h) => {
    c.fillStyle = '#fdfdf8'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#3a4a6a'; c.font = 'bold 34px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
    c.fillText('本週目標', 26, 50);
    c.font = '24px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
    ['塔防成長系統驗收', '京都五日遊行程', '本月預算對帳'].forEach((s, i) => {
      c.fillStyle = ['#e0703a', '#3a9a6a', '#7a5ac8'][i]; c.fillRect(30, 80 + i * 44, 16, 16);
      c.fillStyle = '#444'; c.fillText(s, 58, 97 + i * 44);
    });
    // 小長條圖與腳印
    [[60, '#f2a65a'], [95, '#6fb7d9'], [130, '#8fce8a'], [80, '#e58aa0']].forEach(([bh, col], i) => { c.fillStyle = col; c.fillRect(330 + i * 40, 200 - bh, 28, bh); });
    c.strokeStyle = '#3a4a6a'; c.lineWidth = 3; c.beginPath(); c.moveTo(320, 60); c.lineTo(320, 202); c.lineTo(494, 202); c.stroke();
    c.fillStyle = '#e0703a'; c.beginPath(); c.ellipse(455, 44, 13, 11, 0, 0, 7); c.fill();
    [[-15, -14], [-5, -21], [6, -21], [16, -14]].forEach(([dx, dy]) => { c.beginPath(); c.arc(455 + dx, 44 + dy, 5, 0, 7); c.fill(); });
  });
}

// 沿區域 x 軸的一面牆；區域 +z 是室內側。openings: [{c, w}]（窗中心與寬）
function wall(len, h, color, openings, backdrop) {
  const g = new THREE.Group(), frame = '#fbf7ef';
  box(g, len, WIN.y0, T, color, 0, 0, 0);
  box(g, len, h - WIN.y1, T, color, 0, WIN.y1, 0);
  const ops = openings.slice().sort((a, b) => a.c - b.c);
  let x = -len / 2;
  ops.concat([{ c: len / 2, w: 0 }]).forEach((o) => {
    const x1 = o.c - o.w / 2;
    if (x1 - x > 0.01) box(g, x1 - x, WIN.y1 - WIN.y0, T, color, (x + x1) / 2, WIN.y0, 0);
    x = o.c + o.w / 2;
  });
  const wh = WIN.y1 - WIN.y0;
  ops.forEach((o) => {
    box(g, o.w + 0.4, 0.1, T + 0.36, frame, o.c, WIN.y0 - 0.1, 0.1);            // 窗台
    box(g, o.w + 0.2, 0.12, T + 0.06, frame, o.c, WIN.y1 - 0.06, 0);            // 上框
    [-0.5, -1 / 6, 1 / 6, 0.5].forEach((f) => box(g, 0.1, wh, T * 0.5, frame, o.c + f * o.w, WIN.y0, 0));
    box(g, o.w, 0.08, T * 0.5, frame, o.c, WIN.y0 + wh * 0.62, 0);
  });
  box(g, len, 0.28, 0.06, frame, 0, 0, T / 2 + 0.03, false);                    // 踢腳板
  box(g, len, 0.18, T + 0.12, '#c9a57a', 0, h, 0);                              // 牆頂木條
  const bd = new THREE.Mesh(new THREE.PlaneGeometry(len + 14, 12), backdrop);
  bd.position.set(0, 1, -3.2); g.add(bd);
  return g;
}

export function buildRoom(scene, CFG) {
  const R = CFG.room, W = R.x1 - R.x0, D = R.z1 - R.z0, cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2;
  const room = { walls: {} };

  // 地板：厚底座 + 木紋面
  box(scene, W + T * 2, 0.5, D + T, '#b08a5e', cx, -0.52, cz - T / 2);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTex(), roughness: 0.9 }));
  fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0, cz); fl.receiveShadow = true; scene.add(fl);

  const bdMat = new THREE.MeshBasicMaterial({ map: outdoorTex(), toneMapped: false });
  const back = wall(W + T * 2, R.h, '#f6ead6', [{ c: -8, w: 7 }, { c: 8, w: 7 }], bdMat);
  back.position.set(cx, 0, R.z0 - T / 2); scene.add(back);
  // 左牆：區域 +x 對應世界 -z；右牆：區域 +x 對應世界 +z
  const left = wall(D, R.h, '#f1e3cc', [{ c: -(5.4 - cz), w: 6.4 }], bdMat);
  left.position.set(R.x0 - T / 2, 0, cz); left.rotation.y = Math.PI / 2; scene.add(left);
  const right = wall(D, R.h, '#f1e3cc', [{ c: -5.4 - cz, w: 6.4 }], bdMat);
  right.position.set(R.x1 + T / 2, 0, cz); right.rotation.y = -Math.PI / 2; scene.add(right);
  room.walls = { left, right };

  // 露出的木梁：貼著後牆與兩側牆頂，不擋到狗
  const beams = new THREE.Group(); scene.add(beams);
  [-9.4, -4.7, 0, 4.7, 9.4].forEach((x) => box(beams, 0.3, 0.3, 2.6, '#b98f62', x, R.h - 0.3, R.z0 + 1.3));
  box(beams, W, 0.3, 0.3, '#b98f62', cx, R.h - 0.3, R.z0 + 2.6);

  // 白板與時鐘（後牆中央）
  const z = R.z0 + 0.05;
  box(scene, 5.3, 2.7, 0.1, '#c9ced6', 0, 1.75, z);
  const wb = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 2.4), new THREE.MeshStandardMaterial({ map: boardTex(), roughness: 0.6 }));
  wb.position.set(0, 3.1, z + 0.06); scene.add(wb);
  box(scene, 2.2, 0.08, 0.22, '#aeb4bd', 0, 1.68, z + 0.1);

  const clock = new THREE.Group(); clock.position.set(0, 5.15, z); scene.add(clock);
  const rim = cyl(clock, 0.56, 0.08, '#5a4636', 0, 0, 0); rim.rotation.x = Math.PI / 2; rim.position.set(0, 0, 0.04);
  const face = cyl(clock, 0.48, 0.02, '#fffdf6', 0, 0, 0, false); face.rotation.x = Math.PI / 2; face.position.set(0, 0, 0.085);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box(clock, 0.04, i % 3 ? 0.05 : 0.1, 0.01, '#5a4636', Math.sin(a) * 0.4, Math.cos(a) * 0.4 - 0.03, 0.1, false);
  }
  const hand = (len, wd, col) => { const p = new THREE.Group(); p.position.z = 0.11; box(p, wd, len, 0.012, col, 0, -0.04, 0, false); clock.add(p); return p; };
  const hh = hand(0.28, 0.05, '#3a281c'), mh = hand(0.4, 0.035, '#3a281c');
  room.setClock = (hours, minutes) => {
    mh.rotation.z = -(minutes / 60) * Math.PI * 2;
    hh.rotation.z = -(((hours % 12) + minutes / 60) / 12) * Math.PI * 2;
  };

  // 燈光：一盞半球光 + 一盞會投影的方向光（場景是靜態的，陰影只算一次）
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcdb89a, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.1);
  sun.position.set(-11, 20, 13); sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  const sc = sun.shadow.camera; sc.left = -19; sc.right = 19; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 60;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04; sun.shadow.radius = 5;
  scene.add(sun, sun.target);

  // 相機繞到側牆外面時把那面牆藏起來，才看得到裡面
  room.updateWalls = (cam) => {
    left.visible = cam.position.x > R.x0 + 6;   // 靠近或越過牆面就藏，免得擋住室內
    right.visible = cam.position.x < R.x1 - 6;
  };
  return room;
}
