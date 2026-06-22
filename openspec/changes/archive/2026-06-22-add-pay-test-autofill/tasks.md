## 1. 專案骨架與建構

- [x] 1.1 建立 `package.json`（開發工具採 Bun：內建打包 `Bun.build`、測試 `bun test`；dev 相依僅 `@happy-dom/global-registrator`），與 `.gitignore`（忽略 `dist/`、`node_modules/`）
- [x] 1.2 建立 `src/` 目錄結構（data/、adapters/、content/）與空骨架檔
- [x] 1.3 撰寫 `manifest.chrome.json`（MV3、content_scripts matches 四金流測試網域、Stripe 相關 frame `all_frames: true`）
- [x] 1.4 撰寫 `manifest.firefox.json`（同上 + `browser_specific_settings.gecko.id`）
- [x] 1.5 撰寫 `build.mjs`：`Bun.build` bundle `src/content/index.js` → 複製產物與對應 manifest 到 `dist/chrome/`、`dist/firefox/`；加上 `bun run build` script
- [x] 1.6 驗證 `bun run build` 兩版皆產出，並可於 Chrome／Firefox 載入未封裝外掛（空面板亦可）

## 2. 測試卡資料庫（test-card-data）

- [x] 2.1 定義卡片資料結構與 `data/cards.js` 匯出格式（gateway/label/category/number/expMonth/expYear/cvc/note）
- [x] 2.2 查證並填入 Stripe 官方測試卡：成功、3DS、generic decline、insufficient_funds、incorrect_cvc、expired_card、lost/stolen、processing_error 等
- [x] 2.3 查證並填入綠界 ECPay 官方測試卡（成功卡 + 文件提供之失敗情境）
- [x] 2.4 查證並填入藍新 NewebPay 官方測試卡（成功卡 + 文件提供之失敗情境）
- [x] 2.6 撰寫資料完整性單元測試：每家至少一張成功卡、必要欄位齊全、每張卡有 note

## 3. 填值核心與 adapter 框架（gateway-adapters）

- [x] 3.1 實作 `content/filler.js`：原生 value setter 設值 + 派發 input/change/blur；提供 `fillField(selector,value)` 與 iframe 內 `insertText` 變體
- [x] 3.2 撰寫 filler 單元測試（受控元件值更新、事件確實派發）
- [x] 3.3 定義 adapter 介面與 `adapters/index.js`（`ADAPTERS`、`pickAdapter()` 至多選一）
- [x] 3.4 實作 `adapters/ecpay.js`（detect/selectors/fill，主頁面 DOM）
- [x] 3.5 實作 `adapters/newebpay.js`（detect/selectors/fill，主頁面 DOM）
- [x] 3.7 實作 `adapters/stripe.js`：主 frame 廣播 + iframe frame 內 `insertText` 填入，`window.postMessage` 跨 frame 協調
- [x] 3.8 實作欄位等待（`MutationObserver`）與偵測失敗回報狀態
- [x] 3.9 撰寫 adapter 純函式單元測試（selector 設定、detect 邏輯，可用 happy-dom）

## 4. 浮動面板 UI（autofill-ui）

- [x] 4.1 實作 `content/panel.js`：以 Shadow DOM 注入右下角面板，樣式隔離
- [x] 4.2 依 `category` 分組渲染當前金流測試卡（成功／各失敗情境），顯示 label 與 note
- [x] 4.3 實作點卡填入 → 呼叫 adapter.fill → 顯示成功／失敗／未偵測狀態回饋
- [x] 4.4 實作面板可收合／展開
- [x] 4.5 實作 `content/index.js` 進入點：判斷主 frame／iframe，主 frame 跑 `pickAdapter`→`mountPanel`，iframe 走填入分支

## 5. 整合驗收與文件

- [x] 5.1 對綠界測試頁實機驗收：偵測、面板、成功卡與失敗卡填入
- [x] 5.2 對藍新測試頁實機驗收
- [x] 5.4 對 Stripe 測試頁實機驗收（iframe 填入、3DS 卡顯示正確情境）
- [x] 5.5 撰寫 `README.md`：安裝（載入未封裝外掛）、支援金流與情境、selector 維護指引、已知限制（iframe 盡力而為、不自動送出）
