## Context

外掛現有 UI 與測試卡文字皆為硬編繁體中文，分散在 `content/panel.js`、`data/cards.js`、各 `adapters/*.js` 的回傳訊息。本變更導入 i18n，支援 `zh_TW`（預設）與 `en`，顯示語言跟隨瀏覽器 UI 語言。採 WebExtension 原生 i18n，零執行期相依、Chrome／Firefox 通用。

關鍵約束：
- Content script 可直接呼叫 `browser.i18n.getMessage`；Chrome 用 `chrome` 命名空間、Firefox 用 `browser`，需相容處理。
- 測試環境（bun test + happy-dom）沒有 `browser.i18n`，需測試替身。
- `_locales/*` 是靜態資源、不進 bundle，由瀏覽器 i18n 系統讀取；須由 build 複製到 dist。
- 原生 i18n 跟隨瀏覽器語言，**無**執行期手動切換（本期非目標）。

## Goals / Non-Goals

**Goals:**
- 面板所有文字（含 adapter 狀態訊息）與測試卡 label/note 皆可在地化。
- zh_TW／en 兩語系，非支援語言回退 zh_TW。
- 訊息鍵完整性可由測試保證（缺翻譯即失敗）。

**Non-Goals:**
- 面板內手動語言切換（跟隨瀏覽器即可）。
- demo 頁面在地化。
- 在地化品牌名（如「綠界 ECPay」「Stripe」維持原樣，僅其周邊敘述文字在地化）。

## Decisions

### D1：採 WebExtension 原生 i18n
`_locales/<locale>/messages.json` + `browser.i18n.getMessage(key, substitutions)`，manifest 設 `default_locale: "zh_TW"`。locale 目錄用底線（`zh_TW`，非 `zh-TW`）。替代方案：自帶 JSON + 自寫載入器——較彈性但需處理載入時序與 fallback，且偏離「無趣、經驗證」原則，不採。

### D2：i18n 取用包一層 `content/i18n.js`
匯出 `t(key, substitutions?)`：以 `(globalThis.browser || globalThis.chrome)?.i18n?.getMessage` 取值；取不到（測試環境或缺鍵）時回傳 key 本身以利除錯。所有 UI／adapter 經此函式取文字，集中相容處理與測試替身點。

### D3：訊息鍵命名規則
- UI：`ui_*`（如 `ui_group_success`、`ui_group_failure`、`ui_panel_title`、`ui_toggle_collapse`、`ui_toggle_expand`、`ui_status_filling`、`ui_empty`、`ui_error_prefix`）。
- 測試卡：`card_<gateway>_<slug>_label`、`card_<gateway>_<slug>_note`（如 `card_ecpay_success_label`、`card_ecpay_expired_note`）。`<slug>` 為語意短碼，與卡片一一對應。
- adapter 狀態：`status_*`，含 placeholder（如 `status_filled`、`status_filled_partial`、`status_no_field`）。
- 欄位名（供部分填入訊息組裝）：`field_number`、`field_expiry`、`field_cvc`、`list_separator`。

### D4：adapter 改回傳「結果碼 + 參數」，由面板在地化
adapter 的 `fill()` 不再回傳字面 `message`，改回傳 `{ ok, messageKey, params? }`（`params` 為 `getMessage` 的 substitutions 陣列；部分填入時以 `field_*` 鍵組出缺漏清單）。`panel.js` 統一以 `t(res.messageKey, res.params)` 解析顯示。如此 adapter 與語系解耦、易測。

- `status_no_field`：`$1` = 金流名（如「綠界 ECPay」）。
- `status_filled`：`$1` = 金流名（全部欄位填妥）。
- `status_filled_partial`：`$1` = 金流名、`$2` = 未找到欄位清單（由 `field_*` + `list_separator` 在面板組出）。
- Stripe 跨 frame：`status_stripe_filled`（`$1` = 回應 frame 數）、`status_stripe_no_ack`。

### D5：面板標題保留品牌名
`ui_panel_title` 用 placeholder：zh_TW = `💳 $1 測試卡`、en = `💳 $1 Test Cards`，`$1` = `adapter.label`（品牌名不譯）。

### D6：build 複製 `_locales`
`build.mjs` 對每個 target 遞迴複製專案根的 `_locales/` 到 `dist/<target>/_locales/`（比照既有 `copyIcons`）。bundle 內容不變（i18n.js 進 bundle、locale 檔不進）。

### 模組與資料流
```
_locales/zh_TW/messages.json   // 預設語系，所有鍵
_locales/en/messages.json      // 英文，同一組鍵
src/content/i18n.js            // t(key, subs) 包裝 browser/chrome.i18n
src/content/panel.js           // 文字改 t(...)；卡片以 t(card.label)/t(card.note)；狀態以 t(res.messageKey,res.params)
src/data/cards.js              // label/note 改為訊息鍵
src/adapters/*.js, common.js   // fill() 回傳 { ok, messageKey, params }
build.mjs                      // 複製 _locales 到 dist
manifest.*.json                // default_locale: zh_TW
```
資料流：面板渲染或填入回饋時 → `t(key, subs)` → `browser.i18n.getMessage` 依瀏覽器語言取文字 → 顯示；非支援語言由原生機制回退 `zh_TW`。

## Risks / Trade-offs

- [Chrome 用 `chrome`、Firefox 用 `browser` 命名空間] → `i18n.js` 以 `globalThis.browser || globalThis.chrome` 相容。
- [bun test 無 `browser.i18n`] → `t()` 在無 API 時回傳 key；i18n 完整性測試改為直接讀兩份 `messages.json` 比對鍵集合與程式／資料引用的鍵。
- [部分填入訊息的清單在兩語系語序不同] → 以 `field_*` 鍵 + `list_separator` 在面板組裝，避免把整句寫死。
- [label/note 改鍵屬 BREAKING] → 一次性改完 `cards.js` 與測試；無外部資料使用者。

## Migration Plan

全程式內變更，無資料遷移。改動後 `bun run build` 產物含 `_locales`，載入外掛即依瀏覽器語言顯示。回滾＝還原相關檔案。

## Open Questions

- 英文卡片 label/note 的用字（直譯或精簡）——實作時以簡潔、開發者導向為準，可後續微調。
- 是否未來加入 `zh_CN`／`ja`——本期僅留好機制，不實作。
