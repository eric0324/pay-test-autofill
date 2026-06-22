import { describe, it, expect, beforeEach } from 'bun:test';
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
  it('綠界 adapter 填入 4 段卡號/到期/CVC（實際刷卡頁結構）', async () => {
    // 綠界 Vue 刷卡頁：卡號 4 段 #CCpart1-4、到期 #creditMM/#creditYY、安全碼 #CreditBackThree。
    document.body.innerHTML = `
      <input name="CardNo" type="hidden" />
      <input id="CCpart1" type="tel" /><input id="CCpart2" type="tel" />
      <input id="CCpart3" type="tel" /><input id="CCpart4" type="tel" />
      <input id="creditMM" type="tel" /><input id="creditYY" type="tel" />
      <input id="CreditBackThree" type="tel" />
    `;
    const card = { number: '4311952222222222', cvc: '222', expMonth: '12', expYear: '2030' };
    const res = await ecpayAdapter.fill(card, { window, document });
    expect(res.ok).toBe(true);
    expect(res.messageKey).toBe('status_filled');
    expect(res.params).toContain('綠界 ECPay');
    expect(document.querySelector('#CCpart1').value).toBe('4311');
    expect(document.querySelector('#CCpart2').value).toBe('9522');
    expect(document.querySelector('#CCpart3').value).toBe('2222');
    expect(document.querySelector('#CCpart4').value).toBe('2222');
    expect(document.querySelector('#creditMM').value).toBe('12');
    expect(document.querySelector('#creditYY').value).toBe('30');
    expect(document.querySelector('#CreditBackThree').value).toBe('222');
  });

  it('綠界 Amex 15 碼走 AE 欄位（4-6-5）', async () => {
    document.body.innerHTML = `
      <input id="CCpart1AE" type="tel" /><input id="CCpart2AE" type="tel" /><input id="CCpart3AE" type="tel" />
      <input id="creditMM" type="tel" /><input id="creditYY" type="tel" /><input id="CreditBackThree" type="tel" />
    `;
    const card = { number: '378282246310005', cvc: '1234', expMonth: '12', expYear: '2030' };
    const res = await ecpayAdapter.fill(card, { window, document });
    expect(res.ok).toBe(true);
    expect(res.messageKey).toBe('status_filled');
    expect(document.querySelector('#CCpart1AE').value).toBe('3782');
    expect(document.querySelector('#CCpart2AE').value).toBe('822463');
    expect(document.querySelector('#CCpart3AE').value).toBe('10005');
  });

  it('藍新 adapter 填入 4 段卡號/合併到期/password CVC（實際刷卡頁結構）', async () => {
    document.body.innerHTML = `
      <input class="hidden" maxlength="19" />
      <input id="card1" type="tel" maxlength="4" /><input id="card2" type="tel" maxlength="4" />
      <input id="card3" type="tel" maxlength="4" /><input id="card4" type="tel" maxlength="4" />
      <input placeholder="MM ／ YY" maxlength="5" />
      <input type="password" maxlength="3" />
    `;
    const card = { number: '4000221111111111', cvc: '123', expMonth: '12', expYear: '2030' };
    const res = await newebpayAdapter.fill(card, { window, document });
    expect(res.ok).toBe(true);
    expect(res.messageKey).toBe('status_filled');
    expect(res.params).toContain('藍新 NewebPay');
    expect(document.querySelector('#card1').value).toBe('4000');
    expect(document.querySelector('#card2').value).toBe('2211');
    expect(document.querySelector('#card3').value).toBe('1111');
    expect(document.querySelector('#card4').value).toBe('1111');
    expect(document.querySelector('input[maxlength="5"]').value).toBe('12/30');
    expect(document.querySelector('input[type="password"]').value).toBe('123');
  });

  it('找不到卡號欄位時回報失敗', async () => {
    document.body.innerHTML = '<div>no card form</div>';
    const card = { number: '1', cvc: '2', expMonth: '12', expYear: '2030' };
    const res = await ecpayAdapter.fill(card, { window, document });
    expect(res.ok).toBe(false);
    expect(res.messageKey).toBe('status_no_field');
    expect(res.params).toContain('綠界 ECPay');
  });
});
