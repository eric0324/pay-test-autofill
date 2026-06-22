// 藍新 NewebPay 刷卡頁 adapter。
// 測試後台：ccore.newebpay.com；正式：core.newebpay.com
// 註：實際欄位 name/id 以實機測試頁為準（任務 5.2 校正），通用候選先行涵蓋。
import { createDomAdapter } from './common.js';
import { withGeneric } from './selectors.js';

export const newebpayAdapter = createDomAdapter({
  id: 'newebpay',
  gateway: 'newebpay',
  label: '藍新 NewebPay',
  detect: (win) => /(^|\.)newebpay\.com$/.test(win.location.hostname),
  selectors: withGeneric({
    number: ['input[name*="CardNo" i]', 'input[name*="cardno" i]'],
    cvc: ['input[name*="CVC" i]', 'input[name*="cvc" i]'],
    expMonth: ['select[name*="Month" i]', 'input[name*="month" i]'],
    expYear: ['select[name*="Year" i]', 'input[name*="year" i]'],
  }),
});
