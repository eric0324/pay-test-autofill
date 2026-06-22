import { ecpayAdapter } from './ecpay.js';
import { newebpayAdapter } from './newebpay.js';
import { app91Adapter } from './app91.js';
import { stripeAdapter } from './stripe.js';

// 偵測順序：專一網域的金流優先，Stripe（任意商家頁）墊後。
export const ADAPTERS = [ecpayAdapter, newebpayAdapter, app91Adapter, stripeAdapter];

/** 回傳第一個 detect() 命中的 adapter，至多一個；無命中回 null。 */
export function pickAdapter(win) {
  for (const a of ADAPTERS) {
    try {
      if (a.detect(win)) return a;
    } catch {
      /* 單一 adapter 偵測出錯不影響其他 */
    }
  }
  return null;
}
