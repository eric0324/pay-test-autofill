// 綠界 ECPay 刷卡頁 adapter。
// 測試網域：payment-stage.ecpay.com.tw；正式：payment.ecpay.com.tw
// 註：實際欄位 name/id 以實機測試頁為準（任務 5.1 校正），通用候選先行涵蓋。
import { createDomAdapter } from './common.js';
import { withGeneric } from './selectors.js';

export const ecpayAdapter = createDomAdapter({
  id: 'ecpay',
  gateway: 'ecpay',
  label: '綠界 ECPay',
  detect: (win) => /(^|\.)ecpay\.com\.tw$/.test(win.location.hostname),
  selectors: withGeneric({
    number: ['input[name="CardNo"]', 'input#CardNo'],
    cvc: ['input[name="CardCVC"]', 'input#CardCVC'],
    exp: ['input[name="CardExpiry"]', 'input#CardExpiry'],
    expMonth: ['select[name="ExpireMonth"]'],
    expYear: ['select[name="ExpireYear"]'],
  }),
});
