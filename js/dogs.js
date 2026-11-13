// 狗狗 billboard：用 assets/dogs/<id>.png 貼在平面上，繞 y 軸面向相機並略微後仰
import * as THREE from 'three';
import { canvasTex } from './kit.js';

const PLANE = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);   // 原點在腳底
const BLOB = new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2);
let blobMat = null, zTex = null;

// 載入立繪並縮到最高 768px（省 GPU 記憶體，iPad 比較順）；保留 canvas 供點擊時查透明度
export function loadDogArt(id) {
  return new Promise((resolve) => {
    const img = new Image();
    const done = (ok) => {
      const s = ok ? Math.min(1, 768 / img.naturalHeight) : 1;
      const c = document.createElement('canvas');
      c.width = ok ? Math.round(img.naturalWidth * s) : 64; c.height = ok ? Math.round(img.naturalHeight * s) : 96;
      const x = c.getContext('2d', { willReadFrequently: true });
      if (ok) x.drawImage(img, 0, 0, c.width, c.height);
      else { x.fillStyle = '#c9a57a'; x.beginPath(); x.ellipse(32, 52, 26, 40, 0, 0, 7); x.fill(); }
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      resolve({ tex, canvas: c, aspect: c.width / c.height });
    };
    img.onload = () => done(true); img.onerror = () => done(false);
    img.src = 'assets/dogs/' + id + '.png';
  });
}

export class Dog {
  constructor(id, idx, art, DO, scene) {
    const CFG = DO.CFG;
    this.id = id; this.seat = DO.SEATS[id]; this.art = art;
    this.home = { x: this.seat.x + 0.2, z: this.seat.z };
    this.pos = { x: this.home.x, z: this.home.z };
    this.H = CFG.dogH; this.W = CFG.dogH * art.aspect;
    this.ph = idx * 1.7; this.k = 1; this.h = this.H;
    this.name = DO.META[id][0]; this.role = DO.META[id][1];
    this.status = 'idle'; this.offline = false; this.task = ''; this.progress = 0; this.shown = 0; this.message = '';
    this.mode = 'seat'; this.walk = null;
    this.anchor = new THREE.Vector3();

    this.mat = new THREE.MeshBasicMaterial({ map: art.tex, transparent: true, alphaTest: 0.08, toneMapped: false });
    this.mesh = new THREE.Mesh(PLANE, this.mat);
    this.mesh.rotation.order = 'YXZ'; this.mesh.userData.dog = this;
    scene.add(this.mesh);

    if (!blobMat) {
      blobMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.42, map: canvasTex(64, 64, (c) => {
        const g = c.createRadialGradient(32, 32, 4, 32, 32, 32);
        g.addColorStop(0, 'rgba(60,40,20,1)'); g.addColorStop(1, 'rgba(60,40,20,0)');
        c.fillStyle = g; c.fillRect(0, 0, 64, 64);
      }) });
    }
    this.blob = new THREE.Mesh(BLOB, blobMat);
    this.blob.scale.set(this.W * 0.5, 1, 0.42); this.blob.renderOrder = 1;
    scene.add(this.blob);
    this.zzz = null; this.scene = scene;
  }

  apply(b) {
    this.offline = !!b.offline; this.status = b.status;
    this.name = b.name; this.role = b.role;
    this.task = b.task || ''; this.progress = b.progress || 0; this.message = b.message || '';
    this.mat.color.set(this.offline ? 0x8f8f8f : 0xffffff);
    this.mat.opacity = this.offline ? 0.6 : 1;
  }

  // t 秒、dt 秒、az 相機方位角、tilt 後仰角
  update(t, dt, az, tilt) {
    let sy = 1, y = 0, rz = 0, k = 1;
    const p = t + this.ph;
    if (this.mode === 'walking' && this.walk.phase !== 'wait') { y = Math.abs(Math.sin(t * 9)) * 0.16; rz = Math.sin(t * 9) * 0.06; }
    else if (this.offline) { k = 0.9; }
    else if (this.status === 'working') { sy = 1 + 0.018 * Math.sin(p * 3.2); y = 0.035 * Math.max(0, Math.sin(p * 3.2)); }
    else if (this.status === 'idle') { rz = 0.055 * Math.sin(p * 1.5); }
    else { k = 0.82; sy = 1 + 0.03 * Math.sin(p * 1.2); rz = 0.1; }   // 休息：縮低、慢慢呼吸、歪頭
    this.k += (k - this.k) * Math.min(1, dt * 4);
    const m = this.mesh, h = this.H * this.k * sy;
    m.position.set(this.pos.x, y + 0.05, this.pos.z);
    m.rotation.set(-tilt, az, rz);
    m.scale.set(this.W * this.k, h, 1);
    this.blob.position.set(this.pos.x, 0.06, this.pos.z);
    this.h = h;
    // 頭頂錨點（給標籤用）：平面的上方向 = Ry·Rx·(0,1,0)
    const st = Math.sin(tilt), ct = Math.cos(tilt), sa = Math.sin(az), ca = Math.cos(az);
    this.anchor.set(this.pos.x - st * sa * h, y + ct * h + 0.12, this.pos.z - st * ca * h);

    const rest = this.status === 'resting' && !this.offline && this.mode !== 'walking';
    if (rest && !this.zzz) this.makeZzz();
    if (this.zzz) {
      this.zzz.forEach((s, i) => {
        s.visible = rest;
        if (!rest) return;
        const q = (t * 0.32 + i / 3 + this.ph) % 1, off = this.W * 0.3 + q * 0.7;
        s.position.set(this.anchor.x + ca * off, this.anchor.y - 0.55 + q * 1.0, this.anchor.z - sa * off);
        s.scale.setScalar(0.3 + q * 0.4);
        s.material.opacity = Math.sin(Math.PI * q);
      });
    }
  }

  makeZzz() {
    if (!zTex) {
      zTex = canvasTex(64, 64, (c) => {
        c.font = 'bold 54px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineWidth = 8; c.strokeStyle = '#ffffff'; c.strokeText('Z', 32, 34);
        c.fillStyle = '#6a5fc0'; c.fillText('Z', 32, 34);
      });
    }
    this.zzz = [0, 1, 2].map(() => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false, toneMapped: false }));
      s.renderOrder = 3; this.scene.add(s); return s;
    });
  }

  // 點擊位置（平面 uv）是不是真的點在狗身上
  opaqueAt(uv) {
    const c = this.art.canvas;
    try {
      const d = c.getContext('2d').getImageData(Math.floor(uv.x * (c.width - 1)), Math.floor((1 - uv.y) * (c.height - 1)), 1, 1).data;
      return d[3] > 40;
    } catch (e) { return true; }
  }
}
