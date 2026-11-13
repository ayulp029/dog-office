// 版面與 14 隻狗的座位設定
(function () {
  const DO = (window.DO = window.DO || {});
  const CFG = (DO.CFG = {
    W: 1024, H: 768,
    rowY: { A: 268, B: 606 },   // 座位（脖子）基準 y
    pitch: 138, cx: 512,
    labelW: 112, labelH: 66,
    labelGap: 98,               // 標籤底部到座位基準的距離（在耳朵上方）
    poll: 4000,
    cooler: { x: 330, y: 436 }, // 飲水機底部位置
    coffee: { x: 694, y: 436 }, // 咖啡機底部位置
  });

  // row A（後排）左到右、row B（前排）左到右
  const A = ['shiba', 'apo', 'maomao', 'nana', 'director', 'xuebo', 'keke'];
  const B = ['butler', 'bibi', 'lady', 'lala', 'xiaoha', 'jinjin', 'mumu'];

  DO.SEATS = {};
  DO.ORDER = [];
  [['A', A], ['B', B]].forEach(([row, ids]) => {
    ids.forEach((id, i) => {
      DO.SEATS[id] = { id, row, idx: i, x: CFG.cx + (i - 3) * CFG.pitch, y: CFG.rowY[row] };
      DO.ORDER.push(id);
    });
  });

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
