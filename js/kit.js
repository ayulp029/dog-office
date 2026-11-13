// 共用幾何／材質與小工具：全部用單位幾何縮放，材質依顏色快取，減少 GPU 物件
import * as THREE from 'three';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 18);
const POT = new THREE.CylinderGeometry(1, 0.72, 1, 14);
const BALL = new THREE.IcosahedronGeometry(1, 1);
const mats = {};

export function mat(color, opt) {
  const key = color + (opt ? JSON.stringify(opt) : '');
  if (!mats[key]) mats[key] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, opt));
  return mats[key];
}

function put(parent, geo, m, sx, sy, sz, x, y, z, shadow) {
  const mesh = new THREE.Mesh(geo, typeof m === 'string' ? mat(m) : m);
  mesh.scale.set(sx, sy, sz); mesh.position.set(x, y, z);
  if (shadow !== false) { mesh.castShadow = true; mesh.receiveShadow = true; }
  parent.add(mesh);
  return mesh;
}
// y 一律是「底部」高度，比較好排家具
export const box = (p, w, h, d, m, x, y, z, shadow) => put(p, BOX, m, w, h, d, x, y + h / 2, z, shadow);
export const cyl = (p, r, h, m, x, y, z, shadow) => put(p, CYL, m, r, h, r, x, y + h / 2, z, shadow);
export const pot = (p, r, h, m, x, y, z) => put(p, POT, m, r, h, r, x, y + h / 2, z);
export const ball = (p, rx, ry, rz, m, x, y, z) => put(p, BALL, m, rx, ry, rz, x, y, z);

export function canvasTex(w, h, draw, opt) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (opt && opt.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(opt.repeat[0], opt.repeat[1]); }
  t.anisotropy = 4;
  return t;
}

// 固定種子亂數，讓書本、建築每次長一樣
export function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
