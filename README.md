# 狗狗虛擬辦公室

線上預覽（知道網址的人才能打開）：https://ayulp029.github.io/dog-office/

目前線上版本使用內建示範資料，進度與狗狗動作會持續變化，畫面角落會註記「目前用示範資料」。真實即時狀態之後再接上。

宇鋒的 Grok Bot 狗狗助理們的 3D 虛擬辦公室。用 Three.js 建出一間寬敞的開放辦公室，14 隻狗各有一組桌椅，頭上顯示名字、職務、任務與進度條。狗狗是依各 bot 真實頭像畫的 Q 版立繪，以 billboard 方式站在自己的座位。

## 執行

```bash
cd dog-office
python3 -m http.server 8890      # 開 http://localhost:8890/
python3 simulator.py             # 另開終端機：持續改寫 status.json（--once 只寫一次）
python3 tests/shot.py            # 截圖到 screenshots/（需 Python Playwright）
```

沒有建置步驟，也不靠 CDN：Three.js 與 OrbitControls 放在 `lib/`，用 import map 以相對路徑載入（需要支援 import map 的瀏覽器，iPad Safari 16.4 以上）。

## 操作

- 滑鼠拖曳旋轉、滾輪縮放、右鍵拖曳平移；觸控單指拖曳旋轉、雙指縮放／平移。右下角「重設視角」回到預設總覽。
- 相機不會轉到地板下面，也有最近與最遠距離限制；轉到側面時，擋住視線的側牆會自動隱藏。
- 點狗或牠的標籤（滑鼠或觸控）開詳情卡（含真實頭像），點空白處或 × 關閉。
- 網頁每 4 秒讀取 `status.json`；失敗或格式不對時用內建示範資料並顯示「目前用示範資料」。
- 工作中的狗會輕輕呼吸，待命的會左右晃，休息中的會縮低並冒 Zzz；偶爾有一隻走去飲水機或咖啡機再走回來。

## 網址參數

- `?debug=1`：顯示 FPS 與 draw call 數。
- `?shot=cooler&dog=lala&card=jinjin`：截圖用。拉近鏡頭、讓指定的狗站在飲水機旁（`shot=coffee` 是咖啡機）、打開指定的詳情卡。
- `?shot=closer`：只把鏡頭拉近。`?card=<id>` 可單獨使用。

## 截圖測試

`python3 tests/shot.py` 用 Playwright（1280×800）等 `window.__ready === true` 後輸出：

- `screenshots/office-overview.png`：預設總覽
- `screenshots/office-activity.png`：拉近、拉拉在飲水機旁、金金的詳情卡

有 console 錯誤、404、或任何對外部網站的請求時以非 0 結束。

## 結構

```
index.html          入口與 import map
css/style.css       標籤、詳情卡、HUD
lib/                three.module.min.js、three.core.min.js、OrbitControls.js（Three.js r180，MIT）
assets/avatars/     各 bot 正式頭像（詳情卡用）
assets/dogs/        去背全身立繪（場景 billboard 用）
js/config.js        房間尺寸、座位、META、ACCENT、示範資料（window.DO）
js/data.js          輪詢 status.json、normalize、後備模擬器（window.DO）
js/main.js          renderer、相機、渲染迴圈、點擊、走路排程
js/room.js          地板、牆、窗外景、梁、白板、時鐘、燈光
js/furniture.js     桌椅、盆栽、飲水機、咖啡吧、書架、沙發、地毯
js/dogs.js          狗狗 billboard 與動畫、Zzz
js/walker.js        走路路徑
js/labels.js        頭上標籤    js/card.js  詳情卡    js/kit.js  共用幾何／材質
status.json         唯一資料來源（格式見 STATUS.md）
simulator.py        假資料模擬器
AVATAR-NOTES.md     頭像與品種、配件對照
tests/shot.py       截圖與錯誤檢查
```
