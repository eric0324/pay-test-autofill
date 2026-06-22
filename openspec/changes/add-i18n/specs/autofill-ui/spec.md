## ADDED Requirements

### Requirement: 面板文字在地化
面板所有顯示文字 SHALL 透過 i18n 訊息鍵取得並依瀏覽器語言顯示，包含：群組標題（可用卡／錯誤情境）、header 標題、收合／展開控制文字、狀態回饋（填入中／成功／失敗／未偵測到欄位）、空狀態提示，以及 **adapter 回傳並顯示於面板的狀態訊息**。UI 與 adapter 程式碼 MUST NOT 內嵌可見的字面字串（訊息鍵除外）。

#### Scenario: 英文瀏覽器顯示英文面板
- **WHEN** 瀏覽器 UI 語言為 en 且面板注入金流頁
- **THEN** 面板的群組標題、按鈕、狀態與卡片名稱 MUST 以英文顯示

#### Scenario: adapter 狀態訊息亦在地化
- **WHEN** 使用者點卡，adapter 回傳填入結果訊息並顯示於面板狀態列
- **THEN** 該狀態訊息 MUST 為在地化文字（依瀏覽器語言），而非固定中文字面字串
