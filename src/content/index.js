// Content script 進入點（以 all_frames 注入，主頁面與各 iframe 都會執行此檔）。
//  - Stripe 欄位 iframe（js.stripe.com）：只註冊填入監聽，不掛面板。
//  - 其他非頂層 frame：不處理。
//  - 頂層頁面：偵測金流並注入浮動面板。
import { pickAdapter } from '../adapters/index.js';
import { CARDS } from '../data/cards.js';
import { mountPanel } from './panel.js';
import { isStripeFieldFrame, registerStripeFrameListener } from '../adapters/stripe.js';

(function main() {
  const win = window;

  if (isStripeFieldFrame(win)) {
    registerStripeFrameListener(win);
    return;
  }

  // 僅在頂層頁面掛面板，避免一般 iframe 重複注入。
  if (win.top !== win.self) return;

  const ctx = { window: win, document: win.document };

  const tryMount = () => {
    const adapter = pickAdapter(win);
    if (!adapter) return false;
    mountPanel({ adapter, cards: CARDS[adapter.gateway] || [], ctx });
    return true;
  };

  if (tryMount()) return;

  // 金流欄位或 Stripe iframe 可能延遲載入，觀察 DOM 後重試。
  let tries = 0;
  const observer = new win.MutationObserver(() => {
    if (tries++ > 80 || tryMount()) observer.disconnect();
  });
  observer.observe(win.document.documentElement, { childList: true, subtree: true });
  win.setTimeout(() => observer.disconnect(), 8000);
})();
