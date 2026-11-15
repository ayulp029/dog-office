# 狗狗虛擬辦公室

宇鋒的 Grok Bot 狗狗助理們的 3D 虛擬辦公室。用 Three.js 建出一間寬敞的開放辦公室，14 隻狗各有一組桌椅，頭上顯示名字、職務、任務與進度條。狗狗是依各 bot 真實頭像畫的 Q 版立繪，以 billboard 方式站在自己的座位。

線上版（知道網址的人才能打開）：https://ayulp029.github.io/dog-office/

## 即時狀態

畫面上的任務狀態來自各 Bot 自己回報的 `status.json`，後牆儀表板來自 `usage.json`。網頁每 4 秒重讀一次。

```bash
# Bot 回報狀態（bot 可用 id 或中文名；state：idle／working／waiting／resting；progress：0–100）
/workspace/shared-status/update-status.sh <bot> <state> <progress> [task...] [--push]
/workspace/shared-status/update-status.sh nana working 55 接上狗狗辦公室即時狀態
/workspace/shared-status/update-status.sh 阿波 waiting 0 等塔防遊戲試玩 --push

# 更新 Grok Bot 本週用量（只填真實數字）
/workspace/shared-status/update-usage.sh <usedPercent> <resetAt> [plan] [--push]
/workspace/shared-status/update-usage.sh 12.5 2026-11-22T09:20:00+08:00 Premium --push
```

- 腳本本體在 `/workspace/claude-work/dog-office/tools/`（`update-status.sh`、`update-usage.sh`、`dog_status.py`），`/workspace/shared-status/` 裡的是捷徑。
- 共享檔（規範來源）：`/workspace/shared-status/status.json`、`/workspace/shared-status/usage.json`。腳本以原子方式寫入後，會複製到本機網頁目錄 `/workspace/claude-work/dog-office/`。
- **線上版一定要加 `--push`**：GitHub Pages 是靜態站，iPad 上的瀏覽器讀不到 box 上的檔案，只讀得到 repo 裡的 `status.json`。`--push` 會把資料檔複製到 `/workspace/claude-work/dog-office-publish/`，只 commit 那個檔並 push 到 `origin main`；之後 Pages 通常要 1–2 分鐘重建，iPad 才會看到。沒加 `--push` 只改本機。
- **過期規則**：某一隻超過 30 分鐘沒更新（看該筆的 `updatedAt`，沒有就看頂層的），畫面上自動顯示成「待命」。長時間工作請至少每 30 分鐘回報一次。
- 四種狀態：工作中（任務＋進度條）、等待中（正在等的事＋「等待中…」小牌與「…」泡泡，沒有進度條）、待命、休息中（Zzz）。檔案裡沒列到的狗顯示離線。
- 完整格式與規則見 box 上的 `/workspace/claude-work/dog-office/STATUS.md`（開發檔，不在這個 repo）。

## 執行

```bash
cd dog-office
python3 -m http.server 8890      # 開 http://localhost:8890/
python3 tests/shot.py            # 截圖到 screenshots/（需 Python Playwright）
python3 tests/test_live.py       # 即時狀態、對準縮放的自動測試＋ screenshots/live.png
python3 simulator.py             # 開發用假資料：持續改寫 status.json（會蓋掉真實狀態）
```

沒有建置步驟，也不靠 CDN：Three.js 與 OrbitControls 放在 `lib/`，用 import map 以相對路徑載入（需要支援 import map 的瀏覽器，iPad Safari 16.4 以上）。

## 操作

- 滑鼠拖曳旋轉、滾輪縮放、右鍵拖曳平移；觸控單指拖曳旋轉、雙指捏合縮放／雙指拖曳平移。右下角「重設視角」回到預設總覽。
- 縮放會對準游標或雙指中點：手指在哪裡捏，就往那裡放大，那個位置會留在手指底下（OrbitControls 的 `zoomToCursor`）。
- 相機不會轉到地板下面，也有最近與最遠距離限制；轉到側面時，擋住視線的側牆會自動隱藏。
- 點狗或牠的標籤（滑鼠或觸控）開詳情卡（含真實頭像），點空白處或 × 關閉。
- 網頁每 4 秒讀取 `status.json`；讀取失敗或格式不對時才改用內建示範資料，並顯示「目前用示範資料」。
- 工作中的狗會輕輕呼吸，等待中的慢慢晃、偶爾踮腳、頭旁有「…」泡泡，待命的會左右晃，休息中的會縮低並冒 Zzz；偶爾有一隻走去飲水機或咖啡機再走回來。

## 網址參數

- `?debug=1`：顯示 FPS 與 draw call 數。
- `?shot=cooler&dog=lala&card=jinjin`：截圖用。拉近鏡頭、讓指定的狗站在飲水機旁（`shot=coffee` 是咖啡機）、打開指定的詳情卡。
- `?shot=closer`：只把鏡頭拉近。`?card=<id>` 可單獨使用。

## 截圖測試

`python3 tests/shot.py` 用 Playwright（1280×800）等 `window.__ready === true` 後輸出：

- `screenshots/office-overview.png`：預設總覽
- `screenshots/office-activity.png`：拉近、拉拉在飲水機旁、金金的詳情卡

有 console 錯誤、404、或任何對外部網站的請求時以非 0 結束。`python3 tests/shot.py boss` 只拍主管位與用量儀表板（`office-boss.png`）。

`python3 tests/test_live.py` 會用 helper 寫入狀態、改寫 `status.json` 等輪詢、測 30 分鐘過期／離線／未知 id，再模擬偏離中心的滾輪與雙指捏合（確認游標底下的點縮放後仍在原處）、單指旋轉、兩指平移、距離與角度限制、重設視角，並輸出 `screenshots/live.png`。測試會暫時改寫專案的 `status.json`，結束時還原。

## 結構

```
index.html          入口與 import map
css/style.css       標籤、詳情卡、HUD
lib/                three.module.min.js、three.core.min.js、OrbitControls.js（Three.js r180，MIT；OrbitControls 多一個 zoomTiltLimit 選項，檔內有註記）
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
js/boss.js          主管桌椅與後牆用量儀表板
status.json         任務狀態（由 tools/update-status.sh 寫入，格式見 STATUS.md）
usage.json          Grok Bot 本週用量（由 tools/update-usage.sh 寫入）
tools/              update-status.sh、update-usage.sh、dog_status.py（Bot 回報狀態用）
simulator.py        開發用假資料模擬器
AVATAR-NOTES.md     頭像與品種、配件對照
tests/shot.py       截圖與錯誤檢查
tests/test_live.py  即時狀態與對準縮放測試
```
