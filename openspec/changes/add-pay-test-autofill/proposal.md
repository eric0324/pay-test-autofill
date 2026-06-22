## Why

開發者在串接金流（藍新 NewebPay、綠界 ECPay、91APP、Stripe）時，需要反覆在測試頁面手動輸入卡號、到期日、CVC 來驗證「成功」與「各種失敗情境」。每家金流的測試卡號分散在各自文件、且失敗情境卡號繁多，手動查找與輸入既慢又容易打錯。本外掛在測試頁面提供一鍵填入，省去查文件與手打的成本。

## What Changes

- 新增一個跨瀏覽器（Chrome + Firefox，Manifest V3）的開發輔助外掛。
- 在受支援的四家金流測試頁面注入一個右下角浮動面板，依「成功 / 各種失敗情境」分類列出測試卡，點一下即自動填入當前頁面的卡號／到期日／CVC 欄位並觸發必要事件。
- 內建四家金流（綠界、藍新、91APP、Stripe）官方測試卡資料庫，涵蓋成功卡與失敗情境卡（餘額不足、卡片被拒、CVC 錯誤、過期、3DS 驗證等，依各家文件實際提供者為準）。
- 針對各金流採客製化欄位偵測（含 Stripe 跨網域 iframe 的填入處理）。
- 提供 `bun run build`，由單一份 `src/` 產出 `dist/chrome/` 與 `dist/firefox/` 兩份可載入的外掛。

## Capabilities

### New Capabilities
- `test-card-data`: 四家金流官方測試卡資料庫，含分類（成功／失敗情境）、卡號／到期日／CVC、來源備註的結構化資料。
- `gateway-adapters`: 各金流的頁面偵測（detect）、欄位選擇器（selectors）與填入邏輯（fill），含 Stripe iframe 的特殊處理與通用填值事件派發。
- `autofill-ui`: 注入頁面的浮動面板，以 Shadow DOM 隔離樣式，依分類列出當前金流的測試卡並提供一鍵填入與狀態提示。
- `cross-browser-build`: 由單一份原始碼經 `Bun.build` 打包，產出 Chrome 與 Firefox 兩種 Manifest V3 外掛的建構流程。

### Modified Capabilities
<!-- 無，全新專案 -->

## Impact

- 全新專案，無既有程式碼。
- 開發工具採 Bun：打包用內建 `Bun.build`、測試用內建 `bun test`。唯一開發相依為 `@happy-dom/global-registrator`（測試的 DOM 環境）。執行期外掛本身零執行相依。
- 產出物：`dist/chrome/`、`dist/firefox/`（開發者以「載入未封裝擴充功能」方式安裝）。
- 外部相依風險：高度依賴四家金流測試頁面的 DOM 結構，頁面改版可能使 selector 失效（屬可預期維護成本）；Stripe 等第三方 iframe 的填入屬「盡力而為」，需實機驗證。
