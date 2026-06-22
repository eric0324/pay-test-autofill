## Why

外掛目前的面板介面與測試卡名稱／說明全為繁體中文，非中文開發者難以使用。導入 i18n 讓介面與測試卡資訊可依瀏覽器語言顯示繁中或英文，擴大可用族群，且為日後再加語言留好機制。

## What Changes

- 採用 **WebExtension 原生 i18n**（`_locales/<locale>/messages.json` + `browser.i18n.getMessage`），不引入額外執行期相依。
- 新增 `_locales/zh_TW/messages.json`（預設語言）與 `_locales/en/messages.json`。
- 兩份 manifest 加 `default_locale: "zh_TW"`。
- `content/panel.js` 的介面文字（群組標題「✅ 可用卡／⚠️ 錯誤情境」、header「💳 …測試卡」「收合／展開」、狀態「填入中…」、空狀態提示、錯誤前綴）改為訊息鍵取用。
- `data/cards.js` 每張卡的 `label` 與 `note` 由字面字串改為**訊息鍵**，翻譯放在 `_locales`。**BREAKING**：測試卡資料結構語意改變（label/note 變成 key）。
- adapter 回傳並顯示在面板的狀態訊息（`adapters/*.js`、`common.js` 的「已填入…／未偵測到…」）一併改為訊息鍵——否則半個面板仍是中文。
- `build.mjs` 將 `_locales/` 複製到 `dist/chrome` 與 `dist/firefox`。
- 顯示語言依瀏覽器 UI 語言自動選擇；非 zh／en 回退至 `zh_TW`。本期**不做**面板內手動語言切換（原生 i18n 跟隨瀏覽器語言）。

## Capabilities

### New Capabilities
- `i18n`: 多語系訊息資源與取用機制——locale 檔結構、訊息鍵命名、預設語言與 fallback、跨瀏覽器 `browser.i18n` 取用、build 對 `_locales` 的處理。

### Modified Capabilities
- `autofill-ui`: 面板所有顯示文字（含 adapter 回傳的狀態訊息）改由 i18n 訊息鍵取得，顯示語言依瀏覽器。
- `test-card-data`: 每張卡的 `label`／`note` 由字面字串改為訊息鍵（必要欄位語意變更）。
- `cross-browser-build`: 建構流程須將 `_locales/` 一併輸出到兩個 `dist`。

## Impact

- 修改：`src/content/panel.js`、`src/data/cards.js`、`src/adapters/{ecpay,newebpay,stripe,common}.js`、`build.mjs`、`manifest.chrome.json`、`manifest.firefox.json`。
- 新增：`_locales/zh_TW/messages.json`、`_locales/en/messages.json`。
- 測試：`tests/cards.test.js` 改為驗證 label/note 為合法訊息鍵且兩語系皆有對應；新增 panel/訊息鍵覆蓋測試（每個鍵在 zh_TW 與 en 都存在）。
- 無新增執行期相依（用瀏覽器原生 i18n API）。
- 限制：MV3 content script 可直接呼叫 `browser.i18n.getMessage`；測試環境（bun test + happy-dom）需對 `browser.i18n` 做測試替身。
