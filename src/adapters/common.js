// 主頁面 DOM 型金流的共用 adapter 工廠（綠界／藍新／91APP）。
// Stripe 因欄位在跨網域 iframe，另以 adapters/stripe.js 處理。
import { fillField, findField, waitForField, fillInput } from '../content/filler.js';

/** 設定欄位值，支援 input 與 select。 */
function setFieldValue(el, value) {
  if (el.tagName === 'SELECT') {
    const candidates = [String(value), String(Number(value))]; // '08' 與 '8'
    for (const v of candidates) {
      if ([...el.options].some((o) => o.value === v || o.text.trim() === v)) {
        el.value = v; // select 直接賦值即可（無框架覆寫 setter 問題）
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    return false;
  }
  fillInput(el, value);
  return true;
}

/** 填到期日：優先填合併欄位（MM/YY），否則填分離的月、年欄位。 */
function fillExpiry(root, selectors, card) {
  const mm = String(card.expMonth).padStart(2, '0');
  const yy = String(card.expYear).slice(-2);
  const yyyy = String(card.expYear);

  if (selectors.exp?.length) {
    const el = findField(root, selectors.exp);
    if (el) {
      // 依常見格式嘗試
      fillInput(el, `${mm}/${yy}`);
      return true;
    }
  }
  let ok = false;
  if (selectors.expMonth?.length) {
    const el = findField(root, selectors.expMonth);
    if (el) ok = setFieldValue(el, mm) || ok;
  }
  if (selectors.expYear?.length) {
    const el = findField(root, selectors.expYear);
    if (el) {
      // 年欄位可能是 2 碼或 4 碼
      ok = setFieldValue(el, yy) || setFieldValue(el, yyyy) || ok;
    }
  }
  return ok;
}

/**
 * 建立主頁面 DOM 型 adapter。
 * @param {object} cfg { id, gateway, label, detect(win), selectors }
 *   selectors: { number:[], cvc:[], exp?:[], expMonth?:[], expYear?:[] }
 */
export function createDomAdapter(cfg) {
  return {
    id: cfg.id,
    gateway: cfg.gateway,
    label: cfg.label,
    detect: cfg.detect,
    selectors: cfg.selectors,

    async fill(card, ctx) {
      const root = ctx.document;
      const numberEl = await waitForField(root, cfg.selectors.number, 4000);
      if (!numberEl) {
        return { ok: false, message: `未在此頁偵測到 ${cfg.label} 卡號欄位` };
      }
      fillInput(numberEl, card.number);

      const cvcOk = fillField(root, cfg.selectors.cvc || [], card.cvc);
      const expOk = fillExpiry(root, cfg.selectors, card);

      if (!cvcOk || !expOk) {
        return {
          ok: true,
          message: `已填卡號${cvcOk ? '' : '（CVC 欄位未找到）'}${expOk ? '' : '（到期欄位未找到）'}`,
        };
      }
      return { ok: true, message: `已填入 ${cfg.label} 測試卡` };
    },
  };
}
