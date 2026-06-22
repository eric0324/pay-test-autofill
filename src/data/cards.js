// 四家金流官方測試卡資料庫。
// 每張卡：{ label, category, number, expMonth, expYear, cvc, note }
//   - category: 'success'（可用）| 'failure'（錯誤情境）
//   - number 以連續數字字串儲存（無空格），面板顯示時再分組
//   - 來源備註寫在 note，便於開發者追溯
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
  // 綠界「無」以卡號區分的失敗卡（不像 Stripe）。官方唯一明文的失敗觸發方式是：
  // 用同一張測試卡，但把到期日填成「已過期」→ 觸發刷卡失敗（卡片過期類錯誤，RtnCode != 1）。
  // 故失敗卡用同一張真實測試卡號 + 過期日期，非杜撰卡號。
  // （CVC 任意三碼皆可、廠商後台「模擬付款」只送成功通知，皆不能用來模擬失敗。）
  ecpay: [
    {
      label: '成功（一般信用卡）',
      category: 'success',
      number: '4311952222222222',
      ...EXP,
      cvc: '222',
      note: '綠界官方測試卡。到期日需大於當下；3D 驗證在測試環境輸入模擬簡訊碼 1234。',
    },
    {
      label: '失敗（到期日已過期）',
      category: 'failure',
      number: '4311952222222222',
      expMonth: '01',
      expYear: '2020',
      cvc: '222',
      note: '綠界無失敗卡號；官方測失敗的做法是同一張測試卡填「過期到期日」，送出後刷卡失敗（卡片過期類錯誤）。',
    },
  ],

  // ── 藍新 NewebPay ───────────────────────────────────────────
  // 來源：藍新金流技術串接手冊／測試後台 https://ccore.newebpay.com/
  // 文件明示「測試卡號之外的卡號交易都會失敗」，故失敗情境以非授權卡號模擬（非杜撰）。
  newebpay: [
    {
      label: '成功（一次付清）',
      category: 'success',
      number: '4000221111111111',
      ...EXP,
      cvc: '123',
      note: '藍新官方測試卡（一次付清）。到期月年與背面 3 碼任意。',
    },
    {
      label: '成功（紅利折抵）',
      category: 'success',
      number: '4003551111111111',
      ...EXP,
      cvc: '123',
      note: '藍新官方測試卡（紅利折抵）。',
    },
    {
      label: '失敗（非授權測試卡）',
      category: 'failure',
      number: '4000000000000000',
      ...EXP,
      cvc: '123',
      note: '藍新測試環境中，測試卡號以外的卡號一律授權失敗，可用於驗證失敗流程。',
    },
  ],

  // ── Stripe ──────────────────────────────────────────────────
  // 來源：Stripe 官方測試卡 https://docs.stripe.com/testing
  stripe: [
    {
      label: '成功（Visa）',
      category: 'success',
      number: '4242424242424242',
      ...EXP,
      cvc: '123',
      note: 'Visa 標準成功測試卡。',
    },
    {
      label: '成功（Mastercard）',
      category: 'success',
      number: '5555555555554444',
      ...EXP,
      cvc: '123',
      note: 'Mastercard 標準成功測試卡。',
    },
    {
      label: '成功（Amex）',
      category: 'success',
      number: '378282246310005',
      ...EXP,
      cvc: '1234',
      note: 'American Express 成功測試卡（卡號 15 碼、CVC 4 碼）。',
    },
    {
      label: '需 3DS 驗證（會跳驗證）',
      category: 'success',
      number: '4000002500003155',
      ...EXP,
      cvc: '123',
      note: '需要 3D Secure 驗證的測試卡，會觸發驗證流程。',
    },
    {
      label: '一律要求 3DS 驗證',
      category: 'success',
      number: '4000002760003184',
      ...EXP,
      cvc: '123',
      note: '每筆都會要求 3D Secure 驗證。',
    },
    {
      label: '失敗（一般拒絕 generic_decline）',
      category: 'failure',
      number: '4000000000000002',
      ...EXP,
      cvc: '123',
      note: '回傳 card_declined / generic_decline。',
    },
    {
      label: '失敗（餘額不足 insufficient_funds）',
      category: 'failure',
      number: '4000000000009995',
      ...EXP,
      cvc: '123',
      note: '回傳 card_declined / insufficient_funds。',
    },
    {
      label: '失敗（遺失卡 lost_card）',
      category: 'failure',
      number: '4000000000009987',
      ...EXP,
      cvc: '123',
      note: '回傳 card_declined / lost_card。',
    },
    {
      label: '失敗（失竊卡 stolen_card）',
      category: 'failure',
      number: '4000000000009979',
      ...EXP,
      cvc: '123',
      note: '回傳 card_declined / stolen_card。',
    },
    {
      label: '失敗（過期卡 expired_card）',
      category: 'failure',
      number: '4000000000000069',
      ...EXP,
      cvc: '123',
      note: '回傳 card_declined / expired_card（仍需填未來到期日）。',
    },
    {
      label: '失敗（CVC 錯誤 incorrect_cvc）',
      category: 'failure',
      number: '4000000000000127',
      ...EXP,
      cvc: '123',
      note: '回傳 card_declined / incorrect_cvc。',
    },
    {
      label: '失敗（處理錯誤 processing_error）',
      category: 'failure',
      number: '4000000000000119',
      ...EXP,
      cvc: '123',
      note: '回傳 card_declined / processing_error。',
    },
  ],
};
