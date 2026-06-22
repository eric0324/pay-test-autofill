// 主頁面 DOM 型 adapter（綠界／藍新）的 fill() 結果建構。
// 回傳 i18n 訊息鍵與參數，由 panel 在地化顯示——adapter 不內嵌字面字串。
//   params[0] 為金流名稱（品牌，不譯）；部分填入時以 missingFields 帶未找到欄位碼（panel 以 field_* 組裝）。

export const noFieldResult = (label) => ({ ok: false, messageKey: 'status_no_field', params: [label] });

export const fillFailedResult = (label) => ({ ok: false, messageKey: 'status_fill_failed', params: [label] });

/** 依到期／CVC 是否填妥，回傳完整或部分填入的結果。 */
export function filledResult(label, { expOk, cvcOk }) {
  const missingFields = [];
  if (!expOk) missingFields.push('expiry');
  if (!cvcOk) missingFields.push('cvc');
  if (missingFields.length) {
    return { ok: true, messageKey: 'status_filled_partial', params: [label], missingFields };
  }
  return { ok: true, messageKey: 'status_filled', params: [label] };
}
