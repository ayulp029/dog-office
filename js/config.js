// 3D 版面（世界座標：x 向右、y 向上、z 朝相機；單位約 1 = 狗身高的 0.45 倍）與 14 隻狗的座位
(function () {
  const DO = (window.DO = window.DO || {});
  DO.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const CFG = (DO.CFG = {
    poll: 4000,
    room: { x0: -14, x1: 14, z0: -9.5, z1: 10.5, h: 6 },  // 地板範圍與牆高
    dogH: 2.3,                                           // 立繪在場景中的高度
    pitch: 4.2,                                          // 同排座位間距
    rowZ: { A: -4.6, B: 0.9, C: 6.4 },                   // 狗站的位置；桌子在狗後方（-z）
    deskBack: 1.25,                                      // 桌子中心在狗後方多遠
    aisle: 1.75,                                         // 狗前方走道（座位間縫隙）離座位多遠
    cooler: { x: -13.25, z: -2.85, stand: { x: -11.9, z: -2.85 } }, // 飲水機（左牆）與狗停的位置
    coffee: { x: 13.1, z: 2.65, stand: { x: 11.5, z: 2.65 } },      // 咖啡機（右牆）與狗停的位置
  });

  // A 排最後面（中間留缺口給主管位）、B 排中間、C 排最前面；每排由左到右
  const ROWS = {
    A: ['shiba', 'apo', 'maomao', 'nana', 'director'],
    B: ['xuebo', 'keke', 'bibi'],
    C: ['lady', 'lala', 'xiaoha', 'jinjin', 'mumu'],
  };
  const ROWX = { A: [-8.0, -4.6, 4.2, 7.6, 11.0], B: [-6.3, 0, 6.3] };  // 沒列的排用 pitch 均分

  DO.SEATS = {};
  DO.ORDER = [];
  Object.keys(ROWS).forEach((row) => {
    const ids = ROWS[row];
    ids.forEach((id, i) => {
      DO.SEATS[id] = { id, row, idx: i, x: ROWX[row] ? ROWX[row][i] : (i - (ids.length - 1) / 2) * CFG.pitch, z: CFG.rowZ[row] };
      DO.ORDER.push(id);
    });
  });
  // 主管位：狗管家在 A 排缺口裡、靠後牆正中央；走路時先往前穿過缺口到 A 排前方走道
  DO.SEATS.butler = { id: 'butler', row: 'boss', idx: 0, x: 0, z: -6.5, boss: true, aisleZ: CFG.rowZ.A + CFG.aisle };
  DO.ORDER.push('butler');

  // 每隻狗的代表色（椅墊、馬克杯、桌墊），取自頭像配件
  DO.ACCENT = {
    nana: '#8e6bd1', apo: '#4a5a70', maomao: '#d9534f', butler: '#e08a4a', shiba: '#2f4a8a',
    bibi: '#c8443c', lady: '#7fc4e8', lala: '#f2c14e', xiaoha: '#d64545', keke: '#5aa469',
    director: '#3f6b4f', jinjin: '#e8c36a', mumu: '#2c3e6b', xuebo: '#9fd0e6',
  };

  // 內建名稱／職務（status.json 沒給時使用）
  DO.META = {
    nana: ['納納博士', 'AI 學習'], apo: ['阿波', '程式開發'], maomao: ['毛毛', '美術企劃'],
    butler: ['狗管家', '私人助理'], shiba: ['郵差柴柴', 'Email 管理'], bibi: ['比比', '英文學習'],
    lady: ['蕾蒂', '心靈陪伴'], lala: ['拉拉', '電腦整理'], xiaoha: ['小哈', '健康運動'],
    keke: ['柯柯', '旅遊規劃'], director: ['腸導', 'AI 影片製作'], jinjin: ['金金', '財務規劃'],
    mumu: ['牧牧', '投資建議'], xuebo: ['雪博', '半導體研究'],
  };

  // 後備示範資料（與 status.json 初始內容一致）
  DO.DEMO = function () {
    const d = [
      ['nana', 'working', '驗收塔防成長系統', 65, '正在逐項核對成長曲線'],
      ['apo', 'working', '塔防平衡調整', 42, '第三關敵人血量還在微調'],
      ['maomao', 'working', '畫進化圖', 78, '第二階段的線稿快完成了'],
      ['butler', 'working', '每日一書', 55, '今天挑了一本散文集'],
      ['shiba', 'working', '整理收件匣', 33, '已歸類 47 封信'],
      ['bibi', 'idle', '', 0, '等著下一堂單字課'],
      ['lady', 'idle', '', 0, '隨時可以陪你聊聊'],
      ['lala', 'working', '清理下載資料夾', 61, '找到 12 個重複檔案'],
      ['xiaoha', 'resting', '', 0, '午休中，等等再伸展'],
      ['keke', 'working', '規劃京都五日遊', 27, '正在比對住宿位置'],
      ['director', 'working', '剪輯開場動畫', 84, '再抓一下配樂節奏'],
      ['jinjin', 'working', '本月預算對帳', 49, '還差兩筆發票沒對上'],
      ['mumu', 'working', '比較 ETF 費用', 71, '整理成一張簡單表格'],
      ['xuebo', 'working', '整理先進封裝', 36, '讀到第四篇論文'],
    ];
    return {
      version: 1, updatedAt: new Date().toISOString(), officeName: '狗狗虛擬辦公室',
      bots: d.map(([id, status, task, progress, message]) => ({
        id, name: DO.META[id][0], role: DO.META[id][1], status, task, progress, message,
      })),
    };
  };
})();
