// 注入頁面的浮動面板（Shadow DOM 隔離樣式）。
// 依 category 分組列出當前金流測試卡，點一下呼叫 adapter.fill 並顯示狀態回饋。

const STYLE = `
  :host { all: initial; }
  .panel {
    font-family: -apple-system, "Segoe UI", "Microsoft JhengHei", sans-serif;
    width: 260px; background: #fff; color: #1f2933;
    border: 1px solid #d2d6dc; border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.18); overflow: hidden;
  }
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px; background: #1f2933; color: #fff; cursor: pointer;
    font-size: 13px; font-weight: 600;
  }
  .header .toggle { font-size: 12px; opacity: .8; }
  .body { max-height: 60vh; overflow-y: auto; padding: 8px; }
  .panel.collapsed .body { display: none; }
  .group-title {
    font-size: 11px; color: #7b8794; margin: 8px 4px 4px;
    text-transform: uppercase; letter-spacing: .04em;
  }
  .card {
    display: block; width: 100%; text-align: left; cursor: pointer;
    border: 1px solid #e4e7eb; border-radius: 6px; background: #f9fafb;
    padding: 7px 9px; margin: 4px 0; font-size: 12.5px; line-height: 1.3;
  }
  .card:hover { background: #eef2f7; }
  .card.success { border-left: 3px solid #2f9e44; }
  .card.failure { border-left: 3px solid #e8590c; }
  .card .label { font-weight: 600; }
  .card .num { color: #7b8794; font-size: 11px; font-variant-numeric: tabular-nums; }
  .status {
    margin: 6px 4px 2px; font-size: 12px; min-height: 16px;
    padding: 4px 6px; border-radius: 4px;
  }
  .status.ok { background: #ebfbee; color: #2b8a3e; }
  .status.err { background: #fff0e6; color: #d9480f; }
  .empty { font-size: 12px; color: #7b8794; padding: 8px 4px; }
`;

function groupLabel(category) {
  return category === 'success' ? '✅ 可用卡' : '⚠️ 錯誤情境';
}

function maskNumber(num) {
  if (num.length <= 8) return num;
  return `${num.slice(0, 4)} •••• ${num.slice(-4)}`;
}

/**
 * 注入浮動面板。
 * @param {object} opts { adapter, cards, ctx:{ window, document } }
 */
export function mountPanel({ adapter, cards, ctx }) {
  const { document } = ctx;
  if (document.getElementById('pta-root')) return; // 避免重複注入

  const host = document.createElement('div');
  host.id = 'pta-root';
  host.style.cssText =
    'position:fixed;right:16px;bottom:16px;z-index:2147483647;';
  const shadow = host.attachShadow({ mode: 'open' });

  const panel = document.createElement('div');
  panel.className = 'panel';

  const style = document.createElement('style');
  style.textContent = STYLE;

  const header = document.createElement('div');
  header.className = 'header';
  header.innerHTML = `<span>💳 ${adapter.label} 測試卡</span><span class="toggle">收合 ▾</span>`;

  const body = document.createElement('div');
  body.className = 'body';

  const status = document.createElement('div');
  status.className = 'status';
  body.appendChild(status);

  const success = cards.filter((c) => c.category === 'success');
  const failure = cards.filter((c) => c.category === 'failure');

  if (cards.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '尚無內建測試卡，請參考 README 補充此金流的測試卡資料。';
    body.appendChild(empty);
  }

  const renderGroup = (list, category) => {
    if (list.length === 0) return;
    const title = document.createElement('div');
    title.className = 'group-title';
    title.textContent = groupLabel(category);
    body.appendChild(title);
    for (const card of list) {
      const btn = document.createElement('button');
      btn.className = `card ${category}`;
      btn.title = card.note || '';
      btn.innerHTML =
        `<div class="label">${card.label}</div>` +
        `<div class="num">${maskNumber(card.number)}</div>`;
      btn.addEventListener('click', async () => {
        status.className = 'status';
        status.textContent = '填入中…';
        try {
          const res = await adapter.fill(card, ctx);
          status.className = `status ${res.ok ? 'ok' : 'err'}`;
          status.textContent = res.message;
        } catch (err) {
          status.className = 'status err';
          status.textContent = `填入發生錯誤：${err?.message || err}`;
        }
      });
      body.appendChild(btn);
    }
  };

  renderGroup(success, 'success');
  renderGroup(failure, 'failure');

  header.addEventListener('click', () => {
    const collapsed = panel.classList.toggle('collapsed');
    header.querySelector('.toggle').textContent = collapsed ? '展開 ▸' : '收合 ▾';
  });

  panel.appendChild(header);
  panel.appendChild(body);
  shadow.appendChild(style);
  shadow.appendChild(panel);
  document.body.appendChild(host);

  return host;
}
