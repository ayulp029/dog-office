// 家具：辦公桌椅、盆栽、飲水機、咖啡吧、書架、地毯
import * as THREE from 'three';
import { box, cyl, pot, ball, mat, rng } from './kit.js';

const WOOD = '#e2c49a', WOOD_D = '#b98f62', WHITE = '#fbf7ef', DARK = '#3b3f48', GREY = '#c9ced6';

// 一組桌椅。回傳螢幕材質，讓主程式依狀態調亮度
function desk(scene, seat, accent, CFG) {
  const g = new THREE.Group(); g.position.set(seat.x, 0, seat.z - CFG.deskBack); scene.add(g);
  box(g, 2.6, 0.1, 1.2, WOOD, 0, 0.9, 0);
  box(g, 0.1, 0.9, 1.1, WHITE, -1.2, 0, 0); box(g, 0.1, 0.9, 1.1, WHITE, 1.2, 0, 0);
  box(g, 2.3, 0.45, 0.06, WHITE, 0, 0.4, -0.5);
  // 螢幕面向 +z（面向預設相機）
  box(g, 0.5, 0.04, 0.3, DARK, 0, 1.0, -0.3); box(g, 0.08, 0.3, 0.08, DARK, 0, 1.0, -0.3);
  box(g, 1.25, 0.76, 0.07, DARK, 0, 1.26, -0.3);
  const screen = new THREE.MeshStandardMaterial({ color: '#1c2430', emissive: '#7fd0ff', emissiveIntensity: 0, roughness: 0.4 });
  box(g, 1.13, 0.64, 0.02, screen, 0, 1.32, -0.26, false);
  box(g, 0.75, 0.03, 0.25, GREY, -0.05, 1.0, 0.2, false);                       // 鍵盤
  box(g, 0.14, 0.03, 0.2, GREY, 0.5, 1.0, 0.22, false);                         // 滑鼠
  cyl(g, 0.09, 0.17, accent, 0.95, 1.0, 0.25);                                  // 馬克杯
  box(g, 0.5, 0.05, 0.36, accent, -0.92, 1.0, 0.1); box(g, 0.44, 0.04, 0.32, WHITE, -0.9, 1.05, 0.12, false); // 筆記本

  const c = new THREE.Group(); c.position.set(seat.x - 1.35, 0, seat.z - 0.2); c.rotation.y = 0.55; scene.add(c);
  cyl(c, 0.4, 0.06, DARK, 0, 0, 0); cyl(c, 0.05, 0.5, GREY, 0, 0.06, 0);
  box(c, 0.8, 0.12, 0.8, accent, 0, 0.56, 0); box(c, 0.8, 0.85, 0.12, accent, 0, 0.68, -0.38);
  return screen;
}

function plant(scene, x, z, s) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g);
  pot(g, 0.42, 0.6, '#d98a5f', 0, 0, 0); cyl(g, 0.36, 0.04, '#5a4030', 0, 0.58, 0, false);
  cyl(g, 0.05, 0.7, '#7a5a3a', 0, 0.6, 0);
  const lf = [mat('#5fa55a', { flatShading: true }), mat('#7cbf6a', { flatShading: true }), mat('#4a8f4f', { flatShading: true })];
  [[0, 1.6, 0, 0.55], [0.38, 1.25, 0.12, 0.42], [-0.36, 1.3, -0.1, 0.44], [0.05, 1.2, -0.38, 0.38], [-0.1, 1.15, 0.4, 0.38], [0.1, 2.0, 0.05, 0.36]]
    .forEach(([px, py, pz, r], i) => ball(g, r, r * 1.1, r, lf[i % 3], px, py, pz));
}

function cooler(scene, P) {
  const g = new THREE.Group(); g.position.set(P.x, 0, P.z); scene.add(g);
  box(g, 0.85, 1.55, 0.85, WHITE, 0, 0, 0); box(g, 0.87, 0.5, 0.87, '#dfe6ee', 0, 0.2, 0, false);
  cyl(g, 0.2, 0.1, GREY, 0, 1.55, 0);
  cyl(g, 0.34, 0.85, mat('#8fcff2', { transparent: true, opacity: 0.78, roughness: 0.2 }), 0, 1.65, 0);
  cyl(g, 0.3, 0.42, mat('#5fb4ea', { roughness: 0.2 }), 0, 1.66, 0, false);     // 水
  box(g, 0.1, 0.1, 0.12, '#4a90c8', 0.46, 1.1, -0.18, false); box(g, 0.1, 0.1, 0.12, '#e0604a', 0.46, 1.1, 0.18, false);
  box(g, 0.3, 0.04, 0.6, GREY, 0.5, 0.8, 0, false);
  cyl(g, 0.11, 0.32, WHITE, 0.1, 0, 0.75);                                      // 紙杯筒
}

function coffeeBar(scene, P) {
  const g = new THREE.Group(); g.position.set(P.x, 0, P.z); scene.add(g);
  box(g, 1.3, 1.05, 3.6, WOOD_D, 0, 0, 0); box(g, 1.4, 0.08, 3.7, WHITE, 0, 1.05, 0);
  // 咖啡機（面向 -x）
  box(g, 0.8, 0.95, 1.0, '#b5483c', 0.1, 1.13, 0); box(g, 0.84, 0.16, 1.04, DARK, 0.1, 1.95, 0, false);
  box(g, 0.35, 0.06, 0.8, DARK, -0.42, 1.13, 0, false); box(g, 0.2, 0.2, 0.3, DARK, -0.36, 1.7, 0, false);
  cyl(g, 0.1, 0.16, WHITE, -0.42, 1.19, 0, false);
  box(g, 0.02, 0.2, 0.5, '#ffd98a', -0.31, 1.45, 0, false);
  [[-0.1, 1.2], [0.15, 1.3], [-0.05, 1.45]].forEach(([x, z], i) => cyl(g, 0.1, 0.18, ['#f2c14e', '#7fc4e8', '#e58aa0'][i], x, 1.13, z));
  cyl(g, 0.16, 0.34, '#8a5a3c', 0.15, 1.13, -1.25); cyl(g, 0.17, 0.04, DARK, 0.15, 1.47, -1.25, false); // 咖啡豆罐
  // 牆上小層板與杯子
  box(g, 0.4, 0.06, 2.4, WOOD, 0.55, 3.0, 0);
  [-0.8, -0.3, 0.3, 0.8].forEach((z, i) => cyl(g, 0.11, 0.2, ['#fbf7ef', '#d9534f', '#5aa469', '#8e6bd1'][i], 0.55, 3.06, z));
}

// 書架靠左牆，正面朝 +x
function bookshelf(scene, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const w = 3.4, h = 3.6, d = 0.7, r = rng(5);
  box(g, d, h, 0.1, WOOD_D, 0, 0, -w / 2); box(g, d, h, 0.1, WOOD_D, 0, 0, w / 2);
  box(g, 0.06, h, w, '#a57c52', -d / 2 + 0.03, 0, 0, false);
  const cols = ['#d9534f', '#f2c14e', '#5aa469', '#4a90c8', '#8e6bd1', '#e58aa0', '#fbf7ef', '#e08a4a', '#3d6f8a'];
  for (let i = 0; i <= 4; i++) {
    const y = i * (h - 0.1) / 4;
    box(g, d, 0.1, w, WOOD_D, 0, y, 0);
    if (i === 4) break;
    for (let zz = -w / 2 + 0.2; zz < w / 2 - 0.3;) {
      const bw = 0.12 + r() * 0.12, bh = 0.5 + r() * 0.25;
      if (r() > 0.14) box(g, 0.44, bh, bw, cols[Math.floor(r() * cols.length)], 0.05, y + 0.1, zz + bw / 2, false);
      zz += bw + 0.02;
    }
  }
  pot(g, 0.2, 0.28, '#d98a5f', 0, h, 0.9); ball(g, 0.3, 0.3, 0.3, mat('#7cbf6a', { flatShading: true }), 0, h + 0.5, 0.9);
}

export function buildFurniture(scene, DO) {
  const CFG = DO.CFG, R = CFG.room, screens = {};
  DO.ORDER.forEach((id) => { screens[id] = desk(scene, DO.SEATS[id], DO.ACCENT[id], CFG); });

  // 地毯：中央大地毯 + 前排走道小地毯
  box(scene, 21, 0.03, 7.8, '#9cc5c1', 0, 0, 0.5, false).receiveShadow = true;
  box(scene, 20.2, 0.035, 7.0, '#b7d8d2', 0, 0, 0.5, false).receiveShadow = true;

  cooler(scene, CFG.cooler);
  coffeeBar(scene, CFG.coffee);
  bookshelf(scene, R.x0 + 0.4, -6.9);
  [[R.x0 + 1.1, R.z0 + 1.0, 1.25], [R.x1 - 1.1, R.z0 + 1.0, 1.25], [R.x0 + 1.0, R.z1 - 0.9, 1.1], [R.x1 - 1.0, R.z1 - 0.9, 1.1],
    [-3.6, R.z0 + 0.8, 0.9], [3.6, R.z0 + 0.8, 0.9], [R.x1 - 0.9, -1.4, 0.95]].forEach(([x, z, s]) => plant(scene, x, z, s));
  // 右牆邊的小沙發，讓空間不那麼空
  const s = new THREE.Group(); s.position.set(R.x1 - 0.9, 0, -5.2); scene.add(s);
  box(s, 1.2, 0.5, 3.2, '#e8b9a0', 0, 0.15, 0); box(s, 0.35, 0.8, 3.2, '#e0a78c', 0.45, 0.6, 0);
  box(s, 1.2, 0.35, 0.3, '#e0a78c', 0, 0.6, -1.5); box(s, 1.2, 0.35, 0.3, '#e0a78c', 0, 0.6, 1.5);
  box(s, 0.5, 0.5, 0.5, '#f2c14e', 0.1, 0.65, -0.8).rotation.y = 0.4;
  return { screens };
}
