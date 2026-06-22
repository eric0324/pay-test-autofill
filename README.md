# Pay Test Autofill

開發者金流測試輔助外掛。在受支援的金流測試頁面注入一個浮動面板，點一下即自動填入測試卡號／到期日／CVC，省去查文件與手打的成本。支援 **Chrome** 與 **Firefox**（Manifest V3）。

支援金流：**綠界 ECPay**、**藍新 NewebPay**、**91APP**、**Stripe**。

---

## 功能

- 在金流測試頁右下角注入可收合的浮動面板（Shadow DOM 隔離，不污染頁面樣式）。
- 依情境分組列出測試卡：**✅ 可用卡** 與 **⚠️ 錯誤情境**。
- 點一下即填入，並對 React/Vue 等受控元件正確派發 `input`/`change`/`blur` 事件。
- 內建各家官方測試卡，含成功與失敗情境（餘額不足、卡片被拒、CVC 錯誤、過期、需 3DS 等，依各家文件實際提供者為準）。

> 外掛**只填欄位、不自動送出**，也不處理 3DS OTP；後續驗證請自行操作。無任何網路請求、不蒐集資料。

---

## 安裝（載入未封裝外掛）

先建構（需 [Bun](https://bun.sh)）：

```bash
bun install
bun run build
```

會產出 `dist/chrome/` 與 `dist/firefox/` 兩份。

**Chrome／Edge**
1. 開啟 `chrome://extensions`
2. 開啟右上角「開發人員模式」
3. 點「載入未封裝項目」，選擇 `dist/chrome`

**Firefox**
1. 開啟 `about:debugging#/runtime/this-firefox`
2. 點「載入暫時附加元件」
3. 選擇 `dist/firefox/manifest.json`

---

## 使用

開啟任一受支援金流的測試刷卡頁，右下角會出現面板。點面板中的測試卡即填入；面板下方會顯示成功／失敗狀態。若該頁未偵測到欄位，面板會提示。

---

## 開發

```bash
bun run build       # 產出 dist/chrome 與 dist/firefox（Bun.build）
bun test            # 單元測試（bun test + happy-dom）
bun run test:watch  # 監看模式
bun run harness     # 啟動本機模擬測試頁（http://localhost:5179/dev/harness.html）
```

`bun run harness` 會起一個本機伺服器，提供 `dev/harness.html`：四家金流的模擬刷卡頁，繞過網域偵測直接掛載對應 adapter 的面板，方便在無測試帳號時驗證面板渲染與填值核心。

### 專案結構

```
src/
  data/cards.js          # 四家金流測試卡資料庫
  content/filler.js      # 填值核心（原生 setter + 事件派發 + 欄位等待）
  content/panel.js       # 浮動面板 UI（Shadow DOM）
  content/index.js       # 進入點：主 frame 掛面板／Stripe iframe 註冊填入
  adapters/
    common.js            # DOM 型 adapter 工廠
    selectors.js         # 通用欄位選擇器候選
    ecpay.js / newebpay.js / app91.js / stripe.js
manifest.chrome.json     # Chrome MV3
manifest.firefox.json    # Firefox MV3（含 gecko id）
build.mjs                # Bun.build 打包 → dist/{chrome,firefox}
```

### 維護 selector

各金流頁面改版時，更新對應 `src/adapters/<gateway>.js` 的 `selectors`。自家已知 selector 置前、`selectors.js` 的通用候選墊後，`fill` 時依序嘗試第一個可填者。新增情境卡只需編輯 `src/data/cards.js`。

---

## 內建測試卡來源

| 金流 | 來源 | 備註 |
|------|------|------|
| 綠界 ECPay | [ECPay Developers 測試介接資訊](https://developers.ecpay.com.tw/?p=2856) | 成功卡 `4311-9522-2222-2222`／CVC `222`。測試環境失敗情境由測試特店後台模擬，官方未以卡號區分，故僅收成功卡。 |
| 藍新 NewebPay | 藍新測試後台 `ccore.newebpay.com` | 成功卡 `4000-2211-1111-1111`（一次付清）、`4003-5511-1111-1111`（紅利）。文件明示非測試卡號一律失敗，故含一張模擬失敗卡。 |
| 91APP | 需向 91APP 申請測試金鑰／測試商店 | **待補**：自有刷卡頁的測試卡號與欄位無公開文件，未取得前不杜撰（見下方限制）。 |
| Stripe | [Stripe 官方測試卡](https://docs.stripe.com/testing) | 完整成功／3DS／各種拒絕情境。 |

---

## 已知限制

- **91APP**：自有金流（91APP Payments）的測試卡號與刷卡頁結構需向 91APP 申請測試環境後才取得，目前資料庫保留空清單（不杜撰）。其金鑰命名（Publishable Key／Shared Secret）近似 Stripe，若其刷卡頁實為 **Stripe Elements**，`stripe` adapter 會自動接手填入。取得官方資訊後補上 `src/data/cards.js` 的 `app91` 與 `src/adapters/app91.js` 的 selector。
- **Stripe 等 iframe 金流**：卡號欄位在跨網域 iframe，填入透過 `all_frames` 注入 + `postMessage` 協調，屬「盡力而為」，需實機驗證；若 Stripe 內部攔截導致未生效，後續可改用逐字鍵盤事件備援。
- **欄位 selector**：高度依賴各家測試頁 DOM，頁面改版可能需更新對應 adapter。

---

## 待人工實機驗收

下列需在真實測試頁驗證並回填（見 `openspec/changes/add-pay-test-autofill/tasks.md` 第 5 組）：綠界、藍新、91APP、Stripe 各自的偵測、面板顯示與成功／失敗卡填入。
