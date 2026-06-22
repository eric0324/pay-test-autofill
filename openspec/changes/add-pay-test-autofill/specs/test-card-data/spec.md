## ADDED Requirements

### Requirement: 結構化測試卡資料庫
系統 SHALL 以結構化資料提供四家金流（綠界 ECPay、藍新 NewebPay、91APP、Stripe）的測試卡。每張測試卡 MUST 至少包含：所屬金流（gateway）、顯示名稱（label）、情境分類（category）、卡號（number）、到期月（expMonth）、到期年（expYear）、安全碼（cvc），以及資料來源備註（note）。

#### Scenario: 取得指定金流的測試卡清單
- **WHEN** 程式以某金流識別碼（如 `stripe`）查詢測試卡
- **THEN** 系統回傳該金流所有測試卡的陣列，且每張卡都具備上述必要欄位

#### Scenario: 缺少必要欄位的卡資料視為錯誤
- **WHEN** 任一測試卡缺少 number、expMonth、expYear 或 cvc
- **THEN** 資料完整性測試 MUST 失敗，以避免不完整的卡進入面板

### Requirement: 涵蓋成功與失敗情境
測試卡資料 SHALL 同時包含「成功」卡與該金流官方文件所提供的「失敗情境」卡（例如餘額不足、卡片被拒、CVC 錯誤、卡片過期、需 3DS 驗證等）。各情境 MUST 以 `category` 標記，使面板能分組顯示。

#### Scenario: 每家金流至少一張成功卡
- **WHEN** 載入任一受支援金流的測試卡
- **THEN** 其中 MUST 至少有一張 `category` 為「成功」的卡

#### Scenario: 失敗情境依官方文件收錄
- **WHEN** 某金流官方文件提供失敗情境測試卡
- **THEN** 系統 MUST 收錄這些卡並標註對應情境分類；官方未提供失敗卡的金流，僅收錄成功卡而不杜撰

### Requirement: 標註資料來源
每張測試卡 SHALL 以 `note` 或等效欄位標註其官方文件來源或情境說明，使開發者可追溯卡號出處。

#### Scenario: 開發者檢視卡片來源
- **WHEN** 開發者在面板或資料中查看某張卡
- **THEN** 系統 MUST 顯示該卡的情境說明或來源備註
