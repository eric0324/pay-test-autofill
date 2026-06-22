## MODIFIED Requirements

### Requirement: 結構化測試卡資料庫
系統 SHALL 以結構化資料提供三家金流（綠界 ECPay、藍新 NewebPay、Stripe）的測試卡。每張測試卡 MUST 至少包含：所屬金流（gateway）、顯示名稱鍵（label，為 **i18n 訊息鍵**）、情境分類（category）、卡號（number）、到期月（expMonth）、到期年（expYear）、安全碼（cvc），以及來源備註鍵（note，為 **i18n 訊息鍵**）。`label` 與 `note` 不再是字面字串，其實際顯示文字置於 `_locales`，由 i18n 在顯示時解析。

#### Scenario: 取得指定金流的測試卡清單
- **WHEN** 程式以某金流識別碼（如 `stripe`）查詢測試卡
- **THEN** 系統回傳該金流所有測試卡的陣列，每張卡都具備上述必要欄位，且 `label`／`note` 為可由 i18n 解析的訊息鍵

#### Scenario: 缺少必要欄位的卡資料視為錯誤
- **WHEN** 任一測試卡缺少 number、expMonth、expYear、cvc，或其 `label`／`note` 鍵在任一語系檔不存在
- **THEN** 資料完整性測試 MUST 失敗，以避免不完整或無翻譯的卡進入面板
