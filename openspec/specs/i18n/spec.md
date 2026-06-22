# i18n Specification

## Purpose
TBD - created by archiving change add-i18n. Update Purpose after archive.
## Requirements
### Requirement: 多語系訊息資源
系統 SHALL 以 WebExtension 原生 i18n 提供多語系訊息資源：每個語言一個 `_locales/<locale>/messages.json`，至少包含 `zh_TW`（預設語言）與 `en`。每個訊息以鍵（key）對應一段在地化文字，UI 與測試卡資料皆以鍵引用文字、不內嵌可見字面字串。

#### Scenario: 提供繁中與英文兩語系資源
- **WHEN** 建構產出外掛
- **THEN** `dist` 內 MUST 同時存在 `_locales/zh_TW/messages.json` 與 `_locales/en/messages.json`，且兩者涵蓋相同的訊息鍵集合

### Requirement: 依瀏覽器語言取用與回退
系統 SHALL 透過 `browser.i18n.getMessage(key)` 取得顯示文字，顯示語言依瀏覽器 UI 語言自動決定。當瀏覽器語言非受支援語言時，MUST 回退至預設語言 `zh_TW`。訊息可帶具名替代參數（placeholder），供狀態訊息插入動態內容（如已填欄位）。

#### Scenario: 英文瀏覽器顯示英文
- **WHEN** 瀏覽器 UI 語言為 en，且程式以某訊息鍵取用文字
- **THEN** 系統 MUST 回傳該鍵的英文文字

#### Scenario: 不支援語言回退繁中
- **WHEN** 瀏覽器 UI 語言為受支援清單外的語言（例如 fr）
- **THEN** 系統 MUST 回退顯示 `zh_TW` 的文字，而非空字串或鍵名

### Requirement: 訊息鍵完整性
程式碼與測試卡資料所引用的每一個訊息鍵，MUST 在每個語系檔（`zh_TW`、`en`）都有對應條目；不得有任一語系缺漏。

#### Scenario: 缺漏翻譯視為錯誤
- **WHEN** 任一被引用的訊息鍵在某語系檔中不存在
- **THEN** i18n 完整性測試 MUST 失敗，以避免顯示鍵名或空字串

