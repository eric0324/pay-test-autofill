import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mountPanel } from '../src/content/panel.js';

// i18n 替身：getMessage 回 «key:subs»，方便斷言「文字確實經 t() 取用」。
const realChrome = globalThis.chrome;
const realBrowser = globalThis.browser;

beforeEach(() => {
  document.body.innerHTML = '';
  globalThis.browser = undefined;
  globalThis.chrome = {
    i18n: { getMessage: (k, s) => `«${k}${s && s.length ? ':' + s.join(',') : ''}»` },
  };
});
afterEach(() => {
  globalThis.chrome = realChrome;
  globalThis.browser = realBrowser;
});

const cards = [
  {
    label: 'card_x_label', note: 'card_x_note', category: 'success',
    number: '4242424242424242', expMonth: '12', expYear: '2030', cvc: '123',
  },
];
const adapter = {
  label: 'TestPay',
  fill: async () => ({ ok: true, messageKey: 'status_filled', params: ['TestPay'] }),
};

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('panel i18n', () => {
  it('面板文字與卡片名稱經 t() 在地化', () => {
    const host = mountPanel({ adapter, cards, ctx: { window, document } });
    const text = host.shadowRoot.textContent;
    expect(text).toContain('«ui_group_success»');
    expect(text).toContain('«card_x_label»');
    expect(text).toContain('«ui_panel_title:TestPay»');
    expect(text).toContain('«ui_toggle_collapse»');
  });

  it('空清單顯示在地化的空狀態', () => {
    const host = mountPanel({ adapter, cards: [], ctx: { window, document } });
    expect(host.shadowRoot.textContent).toContain('«ui_empty»');
  });

  it('點卡後狀態以 res.messageKey 在地化', async () => {
    const host = mountPanel({ adapter, cards, ctx: { window, document } });
    host.shadowRoot.querySelector('button.card').click();
    await tick();
    expect(host.shadowRoot.querySelector('.status').textContent).toContain('«status_filled:TestPay»');
  });

  it('部分填入：missingFields 以 field_* + list_separator 組裝後帶入', async () => {
    const partial = {
      label: 'TestPay',
      fill: async () => ({ ok: true, messageKey: 'status_filled_partial', params: ['TestPay'], missingFields: ['expiry', 'cvc'] }),
    };
    const host = mountPanel({ adapter: partial, cards, ctx: { window, document } });
    host.shadowRoot.querySelector('button.card').click();
    await tick();
    const txt = host.shadowRoot.querySelector('.status').textContent;
    expect(txt).toContain('status_filled_partial');
    expect(txt).toContain('field_expiry');
    expect(txt).toContain('field_cvc');
  });
});
