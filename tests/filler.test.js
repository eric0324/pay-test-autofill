import { describe, it, expect, beforeEach } from 'bun:test';
import {
  setNativeValue,
  isFillable,
  findField,
  fillInput,
  fillField,
} from '../src/content/filler.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('setNativeValue', () => {
  it('以原生 setter 設定 input 值', () => {
    const el = document.createElement('input');
    setNativeValue(el, '4242');
    expect(el.value).toBe('4242');
  });
});

describe('fillInput 事件派發', () => {
  it('派發 input/change/blur 並更新值', () => {
    const el = document.createElement('input');
    document.body.appendChild(el);
    const fired = [];
    ['input', 'change', 'blur'].forEach((t) =>
      el.addEventListener(t, () => fired.push(t)),
    );
    fillInput(el, '1234');
    expect(el.value).toBe('1234');
    expect(fired).toEqual(['input', 'change', 'blur']);
  });
});

describe('isFillable', () => {
  it('排除 disabled、hidden、display:none', () => {
    const normal = document.createElement('input');
    document.body.appendChild(normal);
    expect(isFillable(normal)).toBe(true);

    const disabled = document.createElement('input');
    disabled.disabled = true;
    expect(isFillable(disabled)).toBe(false);

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    expect(isFillable(hidden)).toBe(false);

    const none = document.createElement('input');
    none.style.display = 'none';
    document.body.appendChild(none);
    expect(isFillable(none)).toBe(false);
  });
});

describe('findField / fillField', () => {
  it('依序回傳第一個可填欄位，略過不可填者', () => {
    document.body.innerHTML = `
      <input id="hidden" type="hidden" />
      <input id="real" name="cardno" />
    `;
    const el = findField(document, ['#hidden', '#real']);
    expect(el?.id).toBe('real');
  });

  it('找不到欄位時 fillField 回 false', () => {
    expect(fillField(document, ['#nope'], '1')).toBe(false);
  });

  it('找到欄位時 fillField 填入並回 true', () => {
    document.body.innerHTML = '<input id="real" />';
    expect(fillField(document, ['#real'], '999')).toBe(true);
    expect(document.querySelector('#real').value).toBe('999');
  });
});
