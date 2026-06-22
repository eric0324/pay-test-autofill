## 1. i18n 取用層（content/i18n.js）

- [x] 1.1 撰寫 `i18n.js` 單元測試（先紅）：有 `browser.i18n`/`chrome.i18n` 時回傳對應訊息並代入 `$1`/`$2` placeholder；無 API 時回傳 key 本身
- [x] 1.2 實作 `src/content/i18n.js`：`t(key, substitutions?)`，以 `(globalThis.browser || globalThis.chrome)?.i18n?.getMessage` 取值，取不到回傳 key

## 2. 訊息資源（_locales）

- [x] 2.1 盤點所有可見字串（`panel.js` UI、`cards.js` 的 label/note、各 adapter 狀態），依 D3 命名規則定出訊息鍵清單（含 `ui_*`、`card_*`、`status_*`、`field_*`、`list_separator`）
- [x] 2.2 建立 `_locales/zh_TW/messages.json`：所有鍵的繁中文字，含 placeholder 定義（`$1`/`$2`）
- [x] 2.3 建立 `_locales/en/messages.json`：對應英文，鍵集合與 zh_TW 完全一致
- [x] 2.4 撰寫 i18n 完整性測試：讀兩份 `messages.json`，斷言（a）兩語系鍵集合一致、（b）`cards.js` 與程式引用的每個鍵在兩語系皆存在

## 3. 測試卡資料改鍵（cards.js）

- [x] 3.1 更新 `tests/cards.test.js`（先紅）：`label`/`note` 改為驗證「為符合命名規則的訊息鍵字串、且在兩語系檔存在」，其餘必要欄位（number/expMonth/expYear/cvc）不變
- [x] 3.2 將 `src/data/cards.js` 每張卡的 `label`/`note` 改為對應訊息鍵

## 4. adapter 回傳結果碼（adapters/*、common.js）

- [x] 4.1 更新 `tests/adapters.test.js`（先紅）：`fill()` 改回傳 `{ ok, messageKey, params? }`——成功、未偵測到欄位、部分填入三種情形
- [x] 4.2 改 `ecpay.js`、`newebpay.js`、`stripe.js`、`common.js` 的 `fill()`：不再回字面訊息，改回傳 `messageKey` + `params`（部分填入時帶未找到欄位清單）

## 5. 面板在地化（panel.js）

- [x] 5.1 撰寫 `tests/panel.test.js`（先紅）：以 i18n 替身渲染面板，斷言群組標題、header、空狀態、卡片名稱、狀態回饋皆經 `t()` 解析（含部分填入清單以 `field_*` + `list_separator` 組裝）
- [x] 5.2 改 `content/panel.js`：UI 文字改 `t(...)`；卡片以 `t(card.label)`/`t(card.note)`；點卡狀態以 `t(res.messageKey, res.params)`；標題用 `ui_panel_title` + `adapter.label`

## 6. 建構與整合驗收

- [x] 6.1 兩份 manifest 加 `default_locale: "zh_TW"`
- [x] 6.2 `build.mjs` 遞迴複製 `_locales/` 到 `dist/chrome`、`dist/firefox`（比照 `copyIcons`）
- [x] 6.3 `bun test` 全綠、`bun run build` 兩版產物含 `_locales`
- [ ] 6.4 實機：分別以中文與英文瀏覽器載入，確認面板與卡片文字在地化、非支援語言回退 zh_TW
- [x] 6.5 更新 `README.md`：i18n 機制、支援語言、新增語言與維護 `_locales` 的指引
