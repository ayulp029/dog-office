// 音效：全部用 Web Audio 現場合成（沒有音檔、不下載任何東西）。
// 瀏覽器規定要使用者做過手勢才能出聲，所以 AudioContext 等第一次點擊／觸控結束才建立；任何失敗都安靜略過。
const KEY = 'dog-office-sound';
let ctx = null, on = true;
try { on = localStorage.getItem(KEY) !== '0'; } catch (e) { /* 隱私模式讀不到就當作開 */ }

function unlock() {
  if (!on) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  } catch (e) { ctx = null; }
}
['pointerup', 'touchend', 'click', 'keydown'].forEach((ev) => window.addEventListener(ev, unlock, { capture: true, passive: true }));

// 一個音：type 波形、f0 → f1 滑音、dur 秒、vol 音量、at 幾秒後開始
function tone(type, f0, f1, dur, vol, at) {
  const t = ctx.currentTime + (at || 0), o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  f.type = 'lowpass'; f.frequency.value = 2600;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f); f.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + dur + 0.03);
}
function run(fn) {
  if (!on || !ctx) return;                      // ctx 只在手勢事件裡建立（上面的 unlock）
  try {
    if (ctx.state === 'running') return fn();
    // 剛解鎖還在啟動：等它好了再響，但拖太久（例如沒點過就長按）就算了，不要之後才突然叫
    const t0 = performance.now();
    ctx.resume().then(() => { if (performance.now() - t0 < 300) { try { fn(); } catch (e) { /* 安靜失敗 */ } } }).catch(() => {});
  } catch (e) { /* 安靜失敗 */ }
}

export const Sound = {
  get on() { return on; },
  set(v) { on = !!v; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* 存不了也沒關係 */ } if (on) unlock(); },
  // 短短兩聲「汪汪」；pitch 讓每隻狗音高不太一樣
  bark(pitch) { run(() => { const p = pitch || 1; tone('sawtooth', 620 * p, 300 * p, 0.11, 0.16, 0); tone('square', 310 * p, 170 * p, 0.1, 0.05, 0); tone('sawtooth', 680 * p, 330 * p, 0.12, 0.14, 0.15); }); },
  // 摸摸頭：往上的兩個小音
  pet() { run(() => { tone('sine', 660, 700, 0.1, 0.14, 0); tone('sine', 880, 990, 0.16, 0.14, 0.1); }); },
  // 吃餅乾：喀滋喀滋再一聲滿足的小音
  crunch() { run(() => { [0, 0.13, 0.26].forEach((at, i) => tone('square', 180 + i * 30, 90, 0.05, 0.1, at)); tone('sine', 740, 1040, 0.14, 0.12, 0.42); }); },
};
