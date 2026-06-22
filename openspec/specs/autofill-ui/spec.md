# autofill-ui Specification

## Purpose
TBD - created by archiving change add-pay-test-autofill. Update Purpose after archive.
## Requirements
### Requirement: 隔離式浮動面板注入
當偵測到受支援金流頁面時，系統 SHALL 在頁面注入一個浮動面板。面板 MUST 以 Shadow DOM 封裝，使其樣式不污染宿主頁面、也不被宿主頁面樣式影響。

#### Scenario: 在金流頁注入面板
- **WHEN** 當前頁面命中某金流 adapter
- **THEN** 系統 MUST 於頁面（預設右下角）注入浮動面板，且面板樣式與宿主頁面互不干擾

### Requirement: 依情境分類列出測試卡
面板 SHALL 顯示當前金流的測試卡，並依 `category`（成功／各失敗情境）分組。每張卡 MUST 顯示其顯示名稱與情境說明。

#### Scenario: 分組顯示
- **WHEN** 面板開啟且當前金流有多種情境的測試卡
- **THEN** 面板 MUST 將卡片依情境分組顯示，成功與失敗情境清楚區隔

### Requirement: 一鍵填入與狀態回饋
面板 SHALL 讓使用者點一下某張卡即觸發當前 adapter 的填入。填入後 MUST 給予可見的狀態回饋（成功／失敗／未偵測到欄位）。

#### Scenario: 點卡填入成功
- **WHEN** 使用者點選面板中一張測試卡
- **THEN** 系統 MUST 呼叫對應 adapter 填入欄位，並顯示成功回饋

#### Scenario: 填入失敗回饋
- **WHEN** 填入因找不到欄位而失敗
- **THEN** 面板 MUST 顯示失敗或未偵測提示，而非靜默無回應

### Requirement: 面板可收合
面板 SHALL 可收合與展開，避免遮擋頁面內容。

#### Scenario: 收合與展開
- **WHEN** 使用者點擊面板的收合控制
- **THEN** 面板 MUST 收合為精簡狀態；再次點擊 MUST 重新展開

### Requirement: 面板文字在地化
面板所有顯示文字 SHALL 透過 i18n 訊息鍵取得並依瀏覽器語言顯示，包含：群組標題（可用卡／錯誤情境）、header 標題、收合／展開控制文字、狀態回饋（填入中／成功／失敗／未偵測到欄位）、空狀態提示，以及 **adapter 回傳並顯示於面板的狀態訊息**。UI 與 adapter 程式碼 MUST NOT 內嵌可見的字面字串（訊息鍵除外）。

#### Scenario: 英文瀏覽器顯示英文面板
- **WHEN** 瀏覽器 UI 語言為 en 且面板注入金流頁
- **THEN** 面板的群組標題、按鈕、狀態與卡片名稱 MUST 以英文顯示

#### Scenario: adapter 狀態訊息亦在地化
- **WHEN** 使用者點卡，adapter 回傳填入結果訊息並顯示於面板狀態列
- **THEN** 該狀態訊息 MUST 為在地化文字（依瀏覽器語言），而非固定中文字面字串

