// 資料層：輪詢 status.json、驗證、失敗時改用內建後備模擬器
(function () {
  const DO = window.DO;
  const STATUSES = ['working', 'idle', 'resting'];

  // 驗證並正規化；格式壞掉回傳 null
  DO.normalize = function (raw) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.bots)) return null;
    const map = {};
    raw.bots.forEach((b) => {
      if (!b || typeof b.id !== 'string' || !DO.META[b.id]) return; // 未知 id 忽略
      const st = STATUSES.includes(b.status) ? b.status : 'idle';
      map[b.id] = {
        id: b.id, status: st,
        name: typeof b.name === 'string' && b.name ? b.name : DO.META[b.id][0],
        role: typeof b.role === 'string' && b.role ? b.role : DO.META[b.id][1],
        task: st === 'working' ? (typeof b.task === 'string' && b.task ? b.task : '工作中') : '',
        progress: st === 'working' ? DO.clamp(Math.round(Number(b.progress) || 0), 0, 100) : 0,
        message: typeof b.message === 'string' ? b.message : '',
      };
    });
    return { updatedAt: raw.updatedAt, officeName: raw.officeName, bots: map };
  };

  // 後備模擬器：每次呼叫推進一步（與 simulator.py 邏輯相近）
  let demo = null;
  const DEMO_TASKS = { nana: ['驗收塔防成長系統', '審閱學習筆記'], apo: ['塔防平衡調整', '修正存檔錯誤'], maomao: ['畫進化圖', '調整角色配色'], butler: ['每日一書', '安排明日行程'], shiba: ['整理收件匣', '回覆合作邀請'], lala: ['清理下載資料夾', '備份重要文件'], keke: ['規劃京都五日遊', '比較機票價格'], director: ['剪輯開場動畫', '調整字幕'], jinjin: ['本月預算對帳', '整理發票'], mumu: ['比較 ETF 費用', '彙整財報重點'], xuebo: ['整理先進封裝', '閱讀製程論文'], bibi: ['準備單字測驗'], lady: ['傾聽今日心情'], xiaoha: ['設計伸展操'] };
  DO.demoStep = function () {
    if (!demo) demo = DO.DEMO();
    demo.bots.forEach((b) => {
      if (b.status === 'working') {
        b.progress = Math.min(100, b.progress + 1 + Math.floor(Math.random() * 5));
        if (b.progress >= 100) {
          const l = DEMO_TASKS[b.id] || ['整理工作'];
          b.task = l[Math.floor(Math.random() * l.length)]; b.progress = Math.floor(Math.random() * 10);
        }
      } else if (Math.random() < 0.1) {
        const l = DEMO_TASKS[b.id] || ['整理工作']; b.status = 'working'; b.task = l[0]; b.progress = 5;
      }
    });
    if (Math.random() < 0.08) {
      const w = demo.bots.filter((b) => b.status === 'working'); const b = w[Math.floor(Math.random() * w.length)];
      if (b && w.length > 9) { b.status = Math.random() < 0.5 ? 'idle' : 'resting'; b.task = ''; b.progress = 0; }
    }
    demo.updatedAt = new Date().toISOString();
    return demo;
  };

  // 取得一次資料。回傳 { data, demo }
  DO.fetchStatus = async function () {
    try {
      const r = await fetch('status.json?ts=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = DO.normalize(await r.json());
      if (!data) throw new Error('bad format');
      return { data, demo: false };
    } catch (e) {
      return { data: DO.normalize(DO.demoStep()), demo: true };
    }
  };

  // 台北時間 HH:MM
  DO.taipeiTime = function (d) {
    try {
      return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', hour12: false }).format(d || new Date());
    } catch (e) {
      const u = new Date((d || new Date()).getTime() + 8 * 3600e3);
      return String(u.getUTCHours()).padStart(2, '0') + ':' + String(u.getUTCMinutes()).padStart(2, '0');
    }
  };
})();
