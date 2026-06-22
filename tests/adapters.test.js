import { describe, it, expect, beforeEach } from 'vitest';
import { pickAdapter } from '../src/adapters/index.js';
import { ecpayAdapter } from '../src/adapters/ecpay.js';
import { newebpayAdapter } from '../src/adapters/newebpay.js';
import { stripeAdapter } from '../src/adapters/stripe.js';

function mockWin(hostname, extra = {}) {
  return { location: { hostname }, document, Stripe: undefined, ...extra };
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('adapter 偵測', () => {
  it('綠界網域命中 ecpay', () => {
    expect(ecpayAdapter.detect(mockWin('payment-stage.ecpay.com.tw'))).toBe(true);
    expect(ecpayAdapter.detect(mockWin('example.com'))).toBe(false);
  });

  it('藍新網域命中 newebpay', () => {
    expect(newebpayAdapter.detect(mockWin('ccore.newebpay.com'))).toBe(true);
    expect(newebpayAdapter.detect(mockWin('example.com'))).toBe(false);
  });

  it('偵測到 Stripe iframe 時命中 stripe', () => {
    document.body.innerHTML =
      '<iframe src="https://js.stripe.com/v3/elements-inner-card.html"></iframe>';
    expect(stripeAdapter.detect(mockWin('shop.example.com'))).toBe(true);
  });

  it('js.stripe.com 子 frame 本身不掛面板', () => {
    expect(stripeAdapter.detect(mockWin('js.stripe.com'))).toBe(false);
  });

  it('pickAdapter 對非金流頁回 null', () => {
    expect(pickAdapter(mockWin('example.com'))).toBeNull();
  });

  it('pickAdapter 至多選一，綠界頁選中 ecpay', () => {
    const a = pickAdapter(mockWin('payment-stage.ecpay.com.tw'));
    expect(a?.id).toBe('ecpay');
  });
});

describe('DOM adapter 填入', () => {
  it('綠界 adapter 填入卡號/CVC/到期欄位', async () => {
    document.body.innerHTML = `
      <input name="CardNo" />
      <input name="CardCVC" />
      <select name="ExpireMonth">
        <option value="01">01</option><option value="12">12</option>
      </select>
      <select name="ExpireYear">
        <option value="2030">2030</option>
      </select>
    `;
    const card = {
      number: '4311952222222222',
      cvc: '222',
      expMonth: '12',
      expYear: '2030',
    };
    const res = await ecpayAdapter.fill(card, { window, document });
    expect(res.ok).toBe(true);
    expect(document.querySelector('[name="CardNo"]').value).toBe('4311952222222222');
    expect(document.querySelector('[name="CardCVC"]').value).toBe('222');
    expect(document.querySelector('[name="ExpireMonth"]').value).toBe('12');
    expect(document.querySelector('[name="ExpireYear"]').value).toBe('2030');
  });

  it('找不到卡號欄位時回報失敗', async () => {
    document.body.innerHTML = '<div>no card form</div>';
    const card = { number: '1', cvc: '2', expMonth: '12', expYear: '2030' };
    const res = await ecpayAdapter.fill(card, { window, document });
    expect(res.ok).toBe(false);
    expect(res.message).toContain('未在此頁偵測到');
  });
});
