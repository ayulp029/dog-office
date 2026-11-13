// 主程式：Three.js 場景、相機與 OrbitControls、渲染迴圈、輪詢 status.json、點擊、走路排程
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { buildRoom } from './room.js';
import { buildFurniture } from './furniture.js';
import { Dog, loadDogArt } from './dogs.js';
import { startWalk, updateWalk } from './walker.js';
import { Labels } from './labels.js';
import { Card } from './card.js';

const DO = window.DO, CFG = DO.CFG, R = CFG.room;
const Q = new URLSearchParams(location.search);
const DEBUG = Q.get('debug') === '1';
const $ = (id) => document.getElementById(id);
const canvas = $('scene');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  $('loading').textContent = '這個裝置或瀏覽器無法啟動 3D 畫面（需要 WebGL）';
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;        // 家具不會動，陰影只算一次

const scene = new THREE.Scene();
scene.background = new THREE.Color('#c4e2f4');
const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 140);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.09;
controls.rotateSpeed = 0.55; controls.zoomSpeed = 0.9; controls.panSpeed = 0.7;
controls.screenSpacePanning = false;          // 平移時沿著地板
controls.minDistance = 8; controls.maxDistance = 48;
controls.minPolarAngle = 0.18; controls.maxPolarAngle = 1.4;      // 不會轉到地板下面
controls.minAzimuthAngle = -1.35; controls.maxAzimuthAngle = 1.35; // 不會繞到後牆背面
controls.addEventListener('change', () => {   // 目標點不離開房間，避免平移到外太空
  const t = controls.target;
  t.x = DO.clamp(t.x, R.x0 + 3, R.x1 - 3); t.z = DO.clamp(t.z, R.z0 + 2, R.z1 - 2); t.y = DO.clamp(t.y, 0.5, 2.5);
});

const room = buildRoom(scene, CFG);
const { screens } = buildFurniture(scene, DO);
const ring = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.12, 40).rotateX(-Math.PI / 2),
  new THREE.MeshBasicMaterial({ color: 0xffc94d, transparent: true, opacity: 0.95, depthWrite: false }));
ring.visible = false; ring.renderOrder = 2; scene.add(ring);

let dogs = [], byId = {}, labels, card, loaded = false, nextWalk = 6, last = 0, fpsAcc = 0, fpsN = 0, clockAt = -1;
const t0 = performance.now(), pts = {}, v3 = new THREE.Vector3(), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();

// 視角：az 方位角、polar 仰角（0 = 正上方）、dist 距離
function setView(az, polar, dist, tx, tz) {
  controls.target.set(tx, 1.1, tz);
  camera.position.setFromSphericalCoords(dist, polar, az).add(controls.target);
  controls.update();
}
function defaultView() {
  const a = camera.aspect, sh = Q.get('shot');
  if (sh === 'cooler') setView(-0.3, 0.92, 24, -3, 2.2);
  else if (sh === 'coffee') setView(0.3, 0.92, 24, 3, 2.2);
  else if (sh === 'closer') setView(0.3, 0.95, 20, 0, 1.8);
  else {
    const fit = Math.min(78, 31 * Math.max(1, 1.5 / a));   // 直式螢幕自動拉遠，才看得到整間
    controls.maxDistance = Math.max(48, fit * 1.15);
    setView(0.3, 0.8, fit, 0, 0.9);
  }
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}

function applyData(res) {
  const { data, demo } = res;
  $('demo-note').hidden = !demo;
  if (data.officeName) $('office-name').textContent = data.officeName;
  dogs.forEach((d) => {
    const b = data.bots[d.id];
    d.apply(b || { status: 'idle', offline: true, name: DO.META[d.id][0], role: DO.META[d.id][1] });
    if (d.status !== 'working' || d.offline) d.shown = 0;
    else if (!loaded || d.progress < d.shown - 30) d.shown = d.progress;
    const s = screens[d.id], st = d.offline ? 'off' : d.status;
    s.emissiveIntensity = st === 'working' ? 0.95 : st === 'idle' ? 0.3 : 0;
  });
  const u = data.updatedAt ? new Date(data.updatedAt) : null;
  $('clock-upd').textContent = u && !isNaN(u) ? '更新 ' + new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(u) : '';
  loaded = true;
}

async function poll() {
  try { applyData(await DO.fetchStatus()); } catch (e) { /* 保持現狀 */ }
  setTimeout(poll, CFG.poll);
}

// 點擊：先看標籤，再用射線找狗（略過立繪透明的地方）
function pick(x, y) {
  const id = labels.hit(x, y);
  if (id) return byId[id];
  ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(dogs.map((d) => d.mesh), false);
  for (const h of hits) if (h.uv && h.object.userData.dog.opaqueAt(h.uv)) return h.object.userData.dog;
  return null;
}
function bindTap() {
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = e.isPrimary ? { x: e.clientX, y: e.clientY, t: performance.now() } : null; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || !e.isPrimary) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t;
    down = null;
    if (moved > 8 || dt > 700) return;        // 那是拖曳旋轉，不是點擊
    const d = pick(e.clientX, e.clientY);
    if (d) card.toggle(d.id); else card.close();
  });
  canvas.addEventListener('pointercancel', () => { down = null; });
}

function scheduleWalk(t) {
  if (t < nextWalk || dogs.some((d) => d.mode === 'walking')) return;
  const c = dogs.filter((d) => d.status === 'working' && !d.offline);
  if (c.length < 4) { nextWalk = t + 5; return; }
  startWalk(c[Math.floor(Math.random() * c.length)], Math.random() < 0.5 ? 'cooler' : 'coffee', CFG);
  nextWalk = t + 16 + Math.random() * 10;
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  const t = (now - t0) / 1000;
  controls.update();
  room.updateWalls(camera);
  const az = controls.getAzimuthalAngle(), elev = Math.PI / 2 - controls.getPolarAngle();
  const tilt = DO.clamp(elev * 0.55, 0, 0.6);  // 略微後仰面向相機：俯視時不會被壓扁，也不會倒進後面的桌子
  const w = window.innerWidth, h = window.innerHeight, ui = DO.clamp(Math.min(w, h * 1.5) / 1150, 0.62, 1);
  scheduleWalk(t);
  for (let i = 0; i < dogs.length; i++) {
    const d = dogs[i];
    if (d.status === 'working') d.shown += (d.progress - d.shown) * Math.min(1, dt * 3);
    if (d.mode === 'walking') updateWalk(d, dt);
    d.update(t, dt, az, tilt);
    const dist = camera.position.distanceTo(d.anchor);
    v3.copy(d.anchor).project(camera);
    const p = pts[d.id];
    p.x = (v3.x * 0.5 + 0.5) * w; p.y = (-v3.y * 0.5 + 0.5) * h; p.depth = dist;
    p.s = DO.clamp(25 / dist, 0.6, 1) * ui;
    p.vis = v3.z < 1 && p.x > -60 && p.x < w + 60 && p.y > -10 && p.y < h + 90;
  }
  labels.update(dogs, pts);
  card.render();
  if (card.id) { const d = byId[card.id]; ring.position.set(d.pos.x, 0.07, d.pos.z); ring.scale.setScalar(d.W * 0.55); }
  const sec = Math.floor(now / 1000);
  if (sec !== clockAt) {
    clockAt = sec;
    const hm = DO.taipeiTime(); $('clock-time').textContent = hm;
    room.setClock(Number(hm.slice(0, 2)), Number(hm.slice(3, 5)));
  }
  renderer.render(scene, camera);
  if (DEBUG) {
    fpsAcc += dt; fpsN++;
    if (fpsAcc > 0.5) { const e = $('debug'); e.hidden = false; e.textContent = Math.round(fpsN / fpsAcc) + ' fps · ' + renderer.info.render.calls + ' draw calls'; fpsAcc = 0; fpsN = 0; }
  }
}

async function start() {
  resize(); defaultView();
  window.addEventListener('resize', resize); window.addEventListener('orientationchange', resize);
  const arts = await Promise.all(DO.ORDER.map(loadDogArt));
  dogs = DO.ORDER.map((id, i) => new Dog(id, i, arts[i], DO, scene));
  dogs.forEach((d) => { byId[d.id] = d; pts[d.id] = { x: 0, y: 0, s: 1, vis: false, depth: 0 }; });
  labels = new Labels($('labels'), dogs);
  card = new Card((id) => byId[id], (id) => { labels.setSelected(id); ring.visible = !!id; });
  bindTap();
  $('reset-view').addEventListener('click', defaultView);
  applyData(await DO.fetchStatus());
  setTimeout(poll, CFG.poll);

  // 測試／截圖 hook：?shot=cooler|coffee（&dog=id）讓一隻狗站在機器旁並拉近；?shot=closer 只拉近；?card=id 開詳情卡
  const sh = Q.get('shot');
  if (sh === 'cooler' || sh === 'coffee') {
    startWalk(byId[Q.get('dog')] || byId.lala, sh, CFG, { arrived: true, hold: 1e9 });
    nextWalk = 1e9;
  }
  if (Q.get('card')) card.open(Q.get('card'));

  renderer.shadowMap.needsUpdate = true;
  last = performance.now();
  frame(last);
  $('loading').hidden = true;
  DO.app = { scene, camera, controls, renderer, dogs, setView, startWalk: (id, dest) => startWalk(byId[id], dest, CFG) };
  requestAnimationFrame(() => { window.__ready = true; });   // 場景、立繪、第一輪資料都好，且已畫出第一幀
}
start().catch((e) => { console.error(e); $('loading').textContent = '載入失敗，請重新整理'; });
