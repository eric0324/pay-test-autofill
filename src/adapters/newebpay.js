// 藍新 NewebPay 信用卡刷卡頁 adapter。
// 測試後台：ccore.newebpay.com；正式：core.newebpay.com
//
// 藍新刷卡頁（Vue）結構：
//   卡號：4 段可見欄位 #card1 #card2 #card3 #card4（各 4 碼），另有 class="hidden" 的完整隱藏欄（自動組合）
//   有效月年：單一 MM/YY 合併欄（maxlength=5、placeholder="MM ／ YY"，無 id/name）→ 靠 placeholder 鎖定
//   背面末三碼：type="password"、maxlength=3（無 id/name）
import { fillInput, findField, waitForField } from '../content/filler.js';

function fillById(root, id, value) {
  const el = root.getElementById(id);
  if (!el || value == null || value === '') return false;
  fillInput(el, String(value));
  return true;
}

export const newebpayAdapter = {
  id: 'newebpay',
  gateway: 'newebpay',
  label: '藍新 NewebPay',
  detect: (win) => /(^|\.)newebpay\.com$/.test(win.location.hostname),

  async fill(card, ctx) {
    const root = ctx.document;
    const num = String(card.number).replace(/\D/g, '');
    const mm = String(card.expMonth).padStart(2, '0');
    const yy = String(card.expYear).slice(-2);

    const card1 = await waitForField(root, ['#card1'], 4000);
    if (!card1) {
      return { ok: false, message: '未在此頁偵測到藍新卡號欄位，請確認已進入信用卡輸入頁' };
    }

    const segments = [
      ['card1', num.slice(0, 4)], ['card2', num.slice(4, 8)],
      ['card3', num.slice(8, 12)], ['card4', num.slice(12, 16)],
    ];
    const numFilled = segments.filter(([id, v]) => fillById(root, id, v)).length;

    // 有效月年：單一 MM/YY 欄位（無 id/name），以 placeholder / maxlength 鎖定。
    const expEl = findField(root, ['input[placeholder*="MM"]', 'input[maxlength="5"]']);
    const expOk = !!expEl && (fillInput(expEl, `${mm}/${yy}`), true);

    // 背面末三碼：password 欄位。
    const cvcEl = findField(root, [
      'input[type="password"][maxlength="3"]',
      'input[type="password"]',
      'input[maxlength="3"]',
    ]);
    const cvcOk = !!cvcEl && (fillInput(cvcEl, card.cvc), true);

    if (numFilled === 0) {
      return { ok: false, message: '找到藍新刷卡頁但卡號欄位填入失敗（頁面可能改版）' };
    }
    return {
      ok: true,
      message: `已填入藍新測試卡（卡號${expOk ? '、到期' : '（到期欄未找到）'}${cvcOk ? '、CVC' : '（CVC 欄未找到）'}）`,
    };
  },
};
