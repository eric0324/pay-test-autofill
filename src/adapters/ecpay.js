// 綠界 ECPay 信用卡刷卡頁 adapter。
// 測試網域：payment-stage.ecpay.com.tw；正式：payment.ecpay.com.tw
//
// 綠界刷卡頁（Vue）把卡號拆成 4 段可見欄位（以 id 區分），name="CardNo" 是隱藏欄、由其 JS 自動組合，
// 故不能用通用單欄 adapter，須各段分別填入並派發 input 事件讓 Vue 的 v-model 更新。
//   一般卡（13–16 碼）：#CCpart1 #CCpart2 #CCpart3 #CCpart4（4-4-4-4）
//   Amex（15 碼）：     #CCpart1AE #CCpart2AE #CCpart3AE（4-6-5）
//   到期：#creditMM #creditYY   安全碼：#CreditBackThree
import { fillInput, waitForField } from '../content/filler.js';

function fillById(root, id, value) {
  const el = root.getElementById(id);
  if (!el || value == null || value === '') return false;
  fillInput(el, String(value));
  return true;
}

export const ecpayAdapter = {
  id: 'ecpay',
  gateway: 'ecpay',
  label: '綠界 ECPay',
  detect: (win) => /(^|\.)ecpay\.com\.tw$/.test(win.location.hostname),

  async fill(card, ctx) {
    const root = ctx.document;
    const num = String(card.number).replace(/\D/g, '');
    const mm = String(card.expMonth).padStart(2, '0');
    const yy = String(card.expYear).slice(-2);

    // 等卡號第一段出現（剛進刷卡頁時 Vue 欄位可能尚未渲染）。
    const part1 = await waitForField(root, ['#CCpart1', '#CCpart1AE'], 4000);
    if (!part1) {
      return { ok: false, message: '未在此頁偵測到綠界卡號欄位，請確認已進入信用卡輸入頁' };
    }

    const segments =
      num.length === 15
        ? [['CCpart1AE', num.slice(0, 4)], ['CCpart2AE', num.slice(4, 10)], ['CCpart3AE', num.slice(10)]]
        : [['CCpart1', num.slice(0, 4)], ['CCpart2', num.slice(4, 8)], ['CCpart3', num.slice(8, 12)], ['CCpart4', num.slice(12, 16)]];
    const numFilled = segments.filter(([id, v]) => fillById(root, id, v)).length;

    const expOk = fillById(root, 'creditMM', mm) && fillById(root, 'creditYY', yy);
    const cvcOk = fillById(root, 'CreditBackThree', card.cvc);

    if (numFilled === 0) {
      return { ok: false, message: '找到綠界刷卡頁但卡號欄位填入失敗（頁面可能改版）' };
    }
    return {
      ok: true,
      message: `已填入綠界測試卡（卡號${expOk ? '、到期' : '（到期欄未找到）'}${cvcOk ? '、CVC' : '（CVC 欄未找到）'}）`,
    };
  },
};
