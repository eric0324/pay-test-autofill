## ADDED Requirements

### Requirement: 金流頁面偵測
系統 SHALL 為每家金流提供一個 adapter，能依當前頁面網域與 DOM 特徵判斷是否為該金流的刷卡頁面。同一時間 MUST 至多啟用一個 adapter。

#### Scenario: 命中受支援金流頁面
- **WHEN** 使用者開啟某受支援金流的測試刷卡頁
- **THEN** 對應 adapter 的 `detect()` MUST 回傳真值，且該 adapter 被選為當前 adapter

#### Scenario: 非受支援頁面不啟用
- **WHEN** 使用者開啟與任何 adapter 都不匹配的頁面
- **THEN** 系統 MUST 不注入面板，且不對頁面做任何修改

### Requirement: 欄位填入與事件派發
adapter 的 `fill(card)` SHALL 使用客製選擇器定位卡號、到期日、CVC 欄位並填入對應值。填值 MUST 透過原生 value setter 設定，並派發 `input`、`change`、`blur` 事件，以確保 React/Vue 等受控元件能接收到值。

#### Scenario: 成功填入主頁面欄位
- **WHEN** 當前 adapter 為主頁面 DOM 型金流且使用者點選一張測試卡
- **THEN** 卡號、到期、CVC 欄位 MUST 被填入正確值，且框架受控元件的內部狀態同步更新

#### Scenario: 合併或分拆欄位
- **WHEN** 某金流的到期日為單一 MM/YY 欄位或拆成獨立月、年欄位
- **THEN** adapter MUST 依該頁實際結構，以對應格式填入

### Requirement: Stripe 跨網域 iframe 填入
針對 Stripe 等將輸入框置於跨網域 iframe 的金流，content script SHALL 透過 `all_frames` 注入到該 iframe，在 iframe 內定位欄位並以 `InputEvent('insertText')` 等方式填入，使 Stripe 內部狀態更新。浮動面板僅顯示於主頁面。

#### Scenario: 填入 Stripe iframe 欄位
- **WHEN** 使用者在 Stripe 測試頁點選一張測試卡
- **THEN** 系統 MUST 將卡號／到期／CVC 填入對應的 Stripe iframe 欄位，且 Stripe 元件不顯示「欄位不完整」錯誤

### Requirement: 欄位尚未就緒與偵測失敗的處理
adapter SHALL 處理欄位尚未載入或找不到的情況。當欄位尚未出現時 MUST 以 `MutationObserver` 等待；當確定找不到欄位時 MUST 回報失敗狀態給面板顯示。

#### Scenario: 欄位延遲載入
- **WHEN** 刷卡欄位在頁面載入後才動態出現
- **THEN** 系統 MUST 等待欄位出現後再啟用填入，而非立即失敗

#### Scenario: 偵測不到欄位
- **WHEN** adapter 在合理等待後仍找不到必要欄位
- **THEN** 面板 MUST 顯示「此頁未偵測到該金流欄位」之類的提示，且不丟出未捕捉例外
