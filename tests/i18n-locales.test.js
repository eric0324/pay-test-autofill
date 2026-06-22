import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { CARDS } from '../src/data/cards.js';

const zh = JSON.parse(readFileSync('_locales/zh_TW/messages.json', 'utf8'));
const en = JSON.parse(readFileSync('_locales/en/messages.json', 'utf8'));

// 抓出程式碼中以字面字串引用的 i18n 鍵：t('key') 與 messageKey: 'key'。
function referencedKeysFromSource() {
  const files = [
    'src/content/panel.js',
    'src/adapters/ecpay.js',
    'src/adapters/newebpay.js',
    'src/adapters/stripe.js',
  ];
  const keys = new Set();
  const re = /(?:\bt\(\s*|messageKey:\s*)['"]([a-z0-9_]+)['"]/g;
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    let m;
    while ((m = re.exec(src))) keys.add(m[1]);
  }
  return [...keys];
}

describe('i18n 語系完整性', () => {
  it('zh_TW 與 en 鍵集合完全一致', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());
  });

  it('每張測試卡的 label/note 皆為存在於兩語系的訊息鍵', () => {
    for (const [gw, list] of Object.entries(CARDS)) {
      for (const c of list) {
        expect(zh[c.label], `${gw} 的 label 非有效訊息鍵：${c.label}`).toBeDefined();
        expect(en[c.label], `${gw} 的 label 缺英文：${c.label}`).toBeDefined();
        expect(zh[c.note], `${gw} 的 note 非有效訊息鍵：${c.note}`).toBeDefined();
        expect(en[c.note], `${gw} 的 note 缺英文：${c.note}`).toBeDefined();
      }
    }
  });

  it('程式碼引用的 i18n 鍵皆存在於語系檔', () => {
    for (const key of referencedKeysFromSource()) {
      expect(zh[key], `程式引用但語系檔缺鍵：${key}`).toBeDefined();
    }
  });
});
