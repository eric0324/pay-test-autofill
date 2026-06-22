## Context

開發者串接四家金流（綠界 ECPay、藍新 NewebPay、91APP、Stripe）時需反覆在測試頁手動輸入測試卡。本外掛為純前端 WebExtension（Manifest V3），以 content script 在測試頁注入浮動面板達成一鍵填入。專案為全新建立，無既有程式碼。

關鍵約束：
- 高度依賴四家金流測試頁的真實 DOM 結構，selector 屬可預期維護成本。
- Stripe（及可能的同型金流）將輸入框置於跨網域 iframe，外部無法直接讀寫，只能在注入該 iframe 的 content script 內操作。
- content script 無法直接使用 ES module `import`，需打包。

## Goals / Non-Goals

**Goals:**
- Chrome 與 Firefox 皆可載入的 MV3 外掛，單一原始碼產出雙版本。
- 四家金流測試頁注入浮動面板，依情境分類一鍵填入卡號／到期／CVC。
- 內建四家官方測試卡（成功 + 失敗情境），標註來源。
- 各 adapter、filler、cards 邊界清楚、可獨立單元測試。

**Non-Goals:**
- 不做正式環境的任何自動化（僅測試輔助）。
- 不自動送出表單／不完成整筆交易，只填欄位。
- 不處理 3DS OTP 自動輸入（僅填卡，後續驗證由開發者手動）。
- 不上架商店（開發者以未封裝方式自行載入）。
- 不蒐集、不外傳任何資料；外掛無網路請求、無 background 常駐邏輯。

## Decisions

### D1：互動採「頁面浮動按鈕」而非 popup / context menu
content script 注入右下角可收合面板。優點：免切換 popup、即看即填、可直接顯示偵測狀態。替代方案：工具列 popup（多一次點擊、需 messaging 傳值到分頁）、右鍵選單（情境選擇不直覺）。選浮動面板最直接。

### D2：欄位偵測採「各金流客製 selector」
每家一個 adapter，內含 `detect()` 與 `selectors`。優點：對已知測試頁最準確。代價：頁面改版需更新 selector。以 adapter 邊界隔離此風險，改版只動單一檔案。

### D3：填值用原生 setter + 事件派發
受控元件（React/Vue）直接設 `el.value` 不會更新內部狀態。filler 以 `Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set` 取得原生 setter 設值，再派發 `input`/`change`/`blur`。這是跨框架最穩做法。

### D4：Stripe 等 iframe 金流以 `all_frames` 注入
content script 同時注入主頁面與 `js.stripe.com` 等 iframe。主頁面 frame 負責面板 UI 並廣播「填入 card X」；iframe 內 frame 收到後在自身 DOM 填值（`InputEvent('insertText')`）。frame 間以 `window.postMessage` 協調。替代方案：只在主 frame 操作 iframe —— 受同源政策阻擋，不可行。

### D5：打包用 esbuild，輸出雙瀏覽器
`build.mjs`：esbuild 將 `src/content/index.js` bundle 成 IIFE 單檔 → 複製到 `dist/chrome` 與 `dist/firefox`，各自搭配 `manifest.chrome.json` / `manifest.firefox.json`。替代方案：不打包、manifest 列多檔共享全域 —— 較鬆散易出錯。esbuild 輕量、零設定。

### D6：資料與邏輯分離
`data/cards.js` 純資料；`adapters/*` 純配置 + 填入函式；`content/filler.js` 純工具；`content/panel.js` 純 UI。彼此以明確介面溝通（adapter 介面：`{ id, detect(), selectors, fill(card, ctx) }`），各自可獨立測試。

### 模組與介面
```
src/
  data/cards.js            // export const CARDS = { ecpay:[...], newebpay:[...], app91:[...], stripe:[...] }
  content/filler.js        // setNativeValue(el,val); fillField(selector,val); dispatchEvents(el)
  adapters/ecpay.js        // { id:'ecpay', detect, selectors, fill }
  adapters/newebpay.js
  adapters/app91.js
  adapters/stripe.js       // 含 iframe 跨 frame 協調
  adapters/index.js        // ADAPTERS = [...]; pickAdapter()
  content/panel.js         // mountPanel(adapter, cards): Shadow DOM UI
  content/index.js         // 進入點：pickAdapter → mountPanel；iframe frame 走填入分支
manifest.chrome.json
manifest.firefox.json
build.mjs
```

資料流：頁面載入 → `index.js` 判斷自身是主 frame 或 iframe → 主 frame：`pickAdapter()` 命中則 `mountPanel`；使用者點卡 → `adapter.fill(card)`（主頁面金流直接填；iframe 金流 postMessage 給對應 frame）→ 顯示狀態。

## Risks / Trade-offs

- [金流測試頁改版使 selector 失效] → adapter 邊界隔離，單檔可改；偵測失敗時面板明確提示而非靜默。
- [Stripe/TapPay iframe 內部攔截輸入，`insertText` 未必觸發其狀態] → 以原生 setter + `InputEvent('insertText')` 為主、必要時逐字派發 key 事件為備援；spec 標明此為「盡力而為」需實機驗證。
- [91APP 自有刷卡頁的測試卡與 DOM 未知] → 實作時以實機測試頁與官方測試文件確認；未取得前該 adapter 先以待驗證標記，不杜撰卡號。
- [Firefox 與 Chrome MV3 差異（background/CSP）] → 本外掛不依賴 background，差異面最小，僅 manifest 的 gecko id 與 service_worker 欄位不同。
- [content script 注入第三方頁的合規] → 僅作用於金流測試網域、僅填欄位不送出、無資料外傳。

## Migration Plan

全新專案，無資料遷移。交付即「載入未封裝擴充功能」：Chrome 載入 `dist/chrome`、Firefox 以「暫時載入附加元件」載入 `dist/firefox`。回滾＝移除外掛，對宿主頁面無殘留。

## Open Questions

- 91APP 自有刷卡頁的實際測試卡號與欄位選擇器，需取得官方測試文件或實機測試頁後補齊（先以 adapter 骨架 + 待驗證標記交付）。
- 綠界／藍新失敗情境卡的完整涵蓋範圍，以各家官方文件最終清單為準。
