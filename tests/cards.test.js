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

  it('label 與 note 為 i18n 訊息鍵（card_ 前綴、僅小寫英數底線）', () => {
    for (const list of Object.values(CARDS)) {
      for (const card of list) {
        expect(card.label).toMatch(/^card_[a-z0-9_]+_label$/);
        expect(card.note).toMatch(/^card_[a-z0-9_]+_note$/);
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

  it('每家金流至少有一張成功卡', () => {
    for (const [gw, list] of Object.entries(CARDS)) {
      const hasSuccess = list.some((c) => c.category === 'success');
      expect(hasSuccess, `${gw} 沒有成功卡`).toBe(true);
    }
  });

  it('CARDS 的金流鍵涵蓋四家', () => {
    expect(Object.keys(CARDS).sort()).toEqual(Object.keys(GATEWAYS).sort());
  });
});
