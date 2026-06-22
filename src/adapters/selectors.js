// 通用信用卡欄位選擇器候選清單。
// 各 adapter 以自家已知 selector 置前、通用候選墊後，fill 時依序嘗試第一個可填者。
// 通用候選涵蓋標準 autocomplete 屬性與常見 name/id 命名，提升對頁面改版的韌性。

export const GENERIC = {
  number: [
    'input[autocomplete="cc-number"]',
    'input[name*="cardnumber" i]',
    'input[name*="card_no" i]',
    'input[name*="cardno" i]',
    'input[id*="cardnumber" i]',
    'input[name="CardNo"]',
    'input[name="cardNo"]',
    'input[placeholder*="卡號"]',
  ],
  cvc: [
    'input[autocomplete="cc-csc"]',
    'input[name*="cvc" i]',
    'input[name*="cvv" i]',
    'input[name*="csc" i]',
    'input[name="CardCVC"]',
    'input[placeholder*="安全碼"]',
    'input[placeholder*="背面"]',
  ],
  exp: [
    'input[autocomplete="cc-exp"]',
    'input[name*="expiry" i]',
    'input[name*="exp_date" i]',
    'input[name*="expdate" i]',
    'input[placeholder*="MM/YY" i]',
    'input[placeholder*="到期"]',
  ],
  expMonth: [
    'input[autocomplete="cc-exp-month"]',
    'select[name*="month" i]',
    'select[name*="Month" i]',
    'input[name*="expmonth" i]',
    'input[name*="exp_month" i]',
  ],
  expYear: [
    'input[autocomplete="cc-exp-year"]',
    'select[name*="year" i]',
    'select[name*="Year" i]',
    'input[name*="expyear" i]',
    'input[name*="exp_year" i]',
  ],
};

/** 合併自家 selector（置前）與通用候選（墊後）。 */
export function withGeneric(specific = {}) {
  const merged = {};
  for (const key of Object.keys(GENERIC)) {
    merged[key] = [...(specific[key] || []), ...GENERIC[key]];
  }
  return merged;
}
