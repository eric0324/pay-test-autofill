import { describe, it, expect } from 'bun:test';
import { CARDS, GATEWAYS } from '../src/data/cards.js';

const REQUIRED = ['label', 'category', 'number', 'expMonth', 'expYear', 'cvc', 'note'];

describe('測試卡資料完整性', () => {
  it('每張卡都具備必要欄位', () => {
    for (const [gw, list] of Object.entries(CARDS)) {
      for (const card of list) {
        for (const key of REQUIRED) {
          expect(card[key], `${gw} 的卡缺少 ${key}：${card.label}`).toBeTruthy();
        }
      }
    }
  });

  it('category 僅能是 success 或 failure', () => {
    for (const list of Object.values(CARDS)) {
      for (const card of list) {
        expect(['success', 'failure']).toContain(card.category);
      }
    }
  });

  it('卡號為純數字字串', () => {
    for (const list of Object.values(CARDS)) {
      for (const card of list) {
        expect(card.number).toMatch(/^\d{13,19}$/);
      }
    }
  });

  it('有內建卡的金流至少有一張成功卡', () => {
    for (const [gw, list] of Object.entries(CARDS)) {
      if (list.length === 0) continue; // app91 待補，允許空
      const hasSuccess = list.some((c) => c.category === 'success');
      expect(hasSuccess, `${gw} 沒有成功卡`).toBe(true);
    }
  });

  it('CARDS 的金流鍵涵蓋四家', () => {
    expect(Object.keys(CARDS).sort()).toEqual(Object.keys(GATEWAYS).sort());
  });
});
