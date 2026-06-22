// 91APP 自有刷卡頁 adapter。
// 註：91APP Payments 的金鑰命名（Publishable Key / Shared Secret）近似 Stripe，
//     其刷卡頁有可能即為 Stripe Elements——若是，stripe adapter 會接手填入。
//     91APP 自有刷卡頁的實際網域、欄位與測試卡號需以官方測試文件／實機確認（任務 5.3）。
//     未確認前以通用候選偵測，並於資料庫保留空測試卡清單，不杜撰。
import { createDomAdapter } from './common.js';
import { withGeneric, GENERIC } from './selectors.js';

export const app91Adapter = createDomAdapter({
  id: 'app91',
  gateway: 'app91',
  label: '91APP',
  detect: (win) => {
    const host = win.location.hostname;
    const isApp91 = /(^|\.)91app\.(com|io)$/.test(host) || /(^|\.)91dev\.tw$/.test(host);
    if (!isApp91) return false;
    // 91app 網域涵蓋整個電商站，僅在偵測到卡號欄位時才視為刷卡頁。
    return GENERIC.number.some((sel) => {
      try {
        return !!win.document.querySelector(sel);
      } catch {
        return false;
      }
    });
  },
  selectors: withGeneric({}),
});
