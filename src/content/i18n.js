// i18n 取用層：以 WebExtension 原生 i18n 取得在地化文字。
// Chrome 用 `chrome.i18n`、Firefox 用 `browser.i18n`，此處相容兩者。
// 測試環境（無 i18n API）或缺鍵（getMessage 回空字串）時回傳 key 本身，以利除錯。

/**
 * 取得訊息文字。
 * @param {string} key 訊息鍵（對應 _locales/<locale>/messages.json）
 * @param {string[]} [substitutions] placeholder 代入值（$1、$2…）
 * @returns {string}
 */
export function t(key, substitutions) {
  const api = (globalThis.browser || globalThis.chrome)?.i18n;
  const msg = api?.getMessage?.(key, substitutions);
  return msg || key;
}
