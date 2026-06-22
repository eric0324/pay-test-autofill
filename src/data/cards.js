// 三家金流官方測試卡資料庫。
// 每張卡：{ label, category, number, expMonth, expYear, cvc, note }
//   - label / note 為 i18n 訊息鍵（對應 _locales/<locale>/messages.json），顯示時由面板以 t() 解析
//   - category: 'success'（可用）| 'failure'（錯誤情境）
//   - number 以連續數字字串儲存（無空格），面板顯示時再分組
//
// 注意：到期日一律使用未來日期。Stripe 的「過期卡」等失敗情境由「卡號」決定回應，
// 仍需填未來日期，否則前端 Element 會先擋下；真正的拒絕由 Stripe 後端回傳。

export const GATEWAYS = {
  ecpay: { id: 'ecpay', label: '綠界 ECPay' },
  newebpay: { id: 'newebpay', label: '藍新 NewebPay' },
  stripe: { id: 'stripe', label: 'Stripe' },
};

// 共用的未來到期日（可依需要調整）
const EXP = { expMonth: '12', expYear: '2030' };

export const CARDS = {
  // ── 綠界 ECPay ──────────────────────────────────────────────
  // 來源：ECPay Developers 測試介接資訊 https://developers.ecpay.com.tw/?p=2856
  // 綠界「無」以卡號區分的失敗卡；失敗情境用同一張真實測試卡 + 過期到期日觸發（官方唯一明文做法）。
  ecpay: [
    {
      label: 'card_ecpay_success_label',
      category: 'success',
      number: '4311952222222222',
      ...EXP,
      cvc: '222',
      note: 'card_ecpay_success_note',
    },
    {
      label: 'card_ecpay_expired_label',
      category: 'failure',
      number: '4311952222222222',
      expMonth: '01',
      expYear: '2020',
      cvc: '222',
      note: 'card_ecpay_expired_note',
    },
  ],

  // ── 藍新 NewebPay ───────────────────────────────────────────
  // 來源：藍新金流技術串接手冊／測試後台 https://ccore.newebpay.com/
  // 文件明示「測試卡號之外的卡號交易都會失敗」，故失敗情境以非授權卡號模擬（非杜撰）。
  newebpay: [
    {
      label: 'card_newebpay_onetime_label',
      category: 'success',
      number: '4000221111111111',
      ...EXP,
      cvc: '123',
      note: 'card_newebpay_onetime_note',
    },
    {
      label: 'card_newebpay_bonus_label',
      category: 'success',
      number: '4003551111111111',
      ...EXP,
      cvc: '123',
      note: 'card_newebpay_bonus_note',
    },
    {
      label: 'card_newebpay_declined_label',
      category: 'failure',
      number: '4000000000000000',
      ...EXP,
      cvc: '123',
      note: 'card_newebpay_declined_note',
    },
  ],

  // ── Stripe ──────────────────────────────────────────────────
  // 來源：Stripe 官方測試卡 https://docs.stripe.com/testing
  stripe: [
    { label: 'card_stripe_visa_label', category: 'success', number: '4242424242424242', ...EXP, cvc: '123', note: 'card_stripe_visa_note' },
    { label: 'card_stripe_mastercard_label', category: 'success', number: '5555555555554444', ...EXP, cvc: '123', note: 'card_stripe_mastercard_note' },
    { label: 'card_stripe_amex_label', category: 'success', number: '378282246310005', ...EXP, cvc: '1234', note: 'card_stripe_amex_note' },
    { label: 'card_stripe_3ds_label', category: 'success', number: '4000002500003155', ...EXP, cvc: '123', note: 'card_stripe_3ds_note' },
    { label: 'card_stripe_3ds_required_label', category: 'success', number: '4000002760003184', ...EXP, cvc: '123', note: 'card_stripe_3ds_required_note' },
    { label: 'card_stripe_decline_label', category: 'failure', number: '4000000000000002', ...EXP, cvc: '123', note: 'card_stripe_decline_note' },
    { label: 'card_stripe_insufficient_label', category: 'failure', number: '4000000000009995', ...EXP, cvc: '123', note: 'card_stripe_insufficient_note' },
    { label: 'card_stripe_lost_label', category: 'failure', number: '4000000000009987', ...EXP, cvc: '123', note: 'card_stripe_lost_note' },
    { label: 'card_stripe_stolen_label', category: 'failure', number: '4000000000009979', ...EXP, cvc: '123', note: 'card_stripe_stolen_note' },
    { label: 'card_stripe_expired_label', category: 'failure', number: '4000000000000069', ...EXP, cvc: '123', note: 'card_stripe_expired_note' },
    { label: 'card_stripe_cvc_label', category: 'failure', number: '4000000000000127', ...EXP, cvc: '123', note: 'card_stripe_cvc_note' },
    { label: 'card_stripe_processing_label', category: 'failure', number: '4000000000000119', ...EXP, cvc: '123', note: 'card_stripe_processing_note' },
  ],
};
