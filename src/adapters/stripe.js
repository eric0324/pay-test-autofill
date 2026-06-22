// Stripe Elements adapter。
// Stripe 的卡號/到期/CVC 輸入框是來自 js.stripe.com 的跨網域 iframe，主頁面無法直接讀寫。
// 機制：content script 以 all_frames 同時注入主頁面與 Stripe iframe。
//   - 主頁面 frame：偵測 Stripe、顯示面板、點卡時廣播 postMessage('FILL') 給各 iframe。
//   - Stripe iframe frame：收到 'FILL' 後在自身 DOM 填入對應欄位，並回 'FILL_ACK'。
// 跨 iframe 屬「盡力而為」，需實機驗證（任務 5.4）。
import { findField, fillInput } from '../content/filler.js';

const MSG = 'PTA';

// Stripe iframe 內的欄位選擇器（split fields 各一個 iframe，或 Card Element 單一 iframe 含多欄）。
export const STRIPE_FIELD_SELECTORS = {
  number: [
    'input[name="cardnumber"]',
    'input[autocomplete="cc-number"]',
    'input[id*="numberInput" i]',
  ],
  exp: [
    'input[name="exp-date"]',
    'input[autocomplete="cc-exp"]',
    'input[id*="expiryInput" i]',
  ],
  cvc: [
    'input[name="cvc"]',
    'input[autocomplete="cc-csc"]',
    'input[id*="cvcInput" i]',
  ],
};

/** 此 frame 是否為 Stripe 欄位 iframe。 */
export function isStripeFieldFrame(win) {
  return win.location.hostname === 'js.stripe.com';
}

/** 在 Stripe iframe 內填入欄位；回傳是否至少填了一個欄位。 */
export function fillStripeFrame(doc, card) {
  const mm = String(card.expMonth).padStart(2, '0');
  const yy = String(card.expYear).slice(-2);
  let filled = false;

  const numEl = findField(doc, STRIPE_FIELD_SELECTORS.number);
  if (numEl) {
    fillInput(numEl, card.number);
    filled = true;
  }
  const expEl = findField(doc, STRIPE_FIELD_SELECTORS.exp);
  if (expEl) {
    fillInput(expEl, `${mm} / ${yy}`);
    filled = true;
  }
  const cvcEl = findField(doc, STRIPE_FIELD_SELECTORS.cvc);
  if (cvcEl) {
    fillInput(cvcEl, card.cvc);
    filled = true;
  }
  return filled;
}

/** 在 Stripe iframe frame 註冊填入監聽。由 content/index.js 在子 frame 啟動時呼叫。 */
export function registerStripeFrameListener(win) {
  win.addEventListener('message', (e) => {
    const data = e.data;
    if (!data || data.source !== MSG || data.type !== 'FILL') return;
    const ok = fillStripeFrame(win.document, data.card);
    try {
      e.source?.postMessage({ source: MSG, type: 'FILL_ACK', ok }, '*');
    } catch {
      /* ignore */
    }
  });
}

function broadcastToFrames(doc, win, msg) {
  doc.querySelectorAll('iframe').forEach((f) => {
    try {
      f.contentWindow?.postMessage(msg, '*');
    } catch {
      /* cross-origin postMessage 仍可，但保險起見包住 */
    }
  });
  for (let i = 0; i < win.frames.length; i++) {
    try {
      win.frames[i].postMessage(msg, '*');
    } catch {
      /* ignore */
    }
  }
}

export const stripeAdapter = {
  id: 'stripe',
  gateway: 'stripe',
  label: 'Stripe',

  detect: (win) => {
    if (isStripeFieldFrame(win)) return false; // 子 frame 不掛面板
    if (win.Stripe) return true;
    try {
      return !!win.document.querySelector(
        'iframe[src*="js.stripe.com"], iframe[name^="__privateStripeFrame"]',
      );
    } catch {
      return false;
    }
  },

  async fill(card, ctx) {
    const win = ctx.window;
    const doc = ctx.document;
    return new Promise((resolve) => {
      let okCount = 0;
      const onMsg = (e) => {
        const d = e.data;
        if (d && d.source === MSG && d.type === 'FILL_ACK' && d.ok) okCount++;
      };
      win.addEventListener('message', onMsg);
      broadcastToFrames(doc, win, { source: MSG, type: 'FILL', card });
      win.setTimeout(() => {
        win.removeEventListener('message', onMsg);
        if (okCount > 0) {
          resolve({ ok: true, message: `已填入 Stripe 欄位（${okCount} 個 frame 回應）` });
        } else {
          resolve({
            ok: false,
            message: '未收到 Stripe 欄位回應，請確認此頁是否使用 Stripe Elements',
          });
        }
      }, 900);
    });
  },
};
