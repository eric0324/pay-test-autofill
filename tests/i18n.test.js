import { describe, it, expect, afterEach } from 'bun:test';
import { t } from '../src/content/i18n.js';

const realBrowser = globalThis.browser;
const realChrome = globalThis.chrome;

afterEach(() => {
  globalThis.browser = realBrowser;
  globalThis.chrome = realChrome;
});

describe('t() i18n 取用', () => {
  it('有 chrome.i18n 時回傳 getMessage 結果並傳入 substitutions', () => {
    const calls = [];
    globalThis.browser = undefined;
    globalThis.chrome = {
      i18n: {
        getMessage: (k, s) => {
          calls.push([k, s]);
          return `MSG:${k}:${(s || []).join(',')}`;
        },
      },
    };
    expect(t('ui_group_success')).toBe('MSG:ui_group_success:');
    expect(t('status_filled', ['綠界 ECPay'])).toBe('MSG:status_filled:綠界 ECPay');
    expect(calls.length).toBe(2);
  });

  it('browser.i18n（Firefox）優先於 chrome', () => {
    globalThis.browser = { i18n: { getMessage: () => 'FROM_BROWSER' } };
    globalThis.chrome = { i18n: { getMessage: () => 'FROM_CHROME' } };
    expect(t('any')).toBe('FROM_BROWSER');
  });

  it('無 i18n API 時回傳 key 本身', () => {
    globalThis.browser = undefined;
    globalThis.chrome = undefined;
    expect(t('ui_empty')).toBe('ui_empty');
    expect(t('status_filled', ['x'])).toBe('status_filled');
  });

  it('getMessage 回空字串（缺鍵）時回傳 key 以利除錯', () => {
    globalThis.browser = undefined;
    globalThis.chrome = { i18n: { getMessage: () => '' } };
    expect(t('missing_key')).toBe('missing_key');
  });
});
