# demo 商家後端

一個最小的「商家端」demo（Bun.serve），串接三家金流的**測試環境**，把你導向各家**真實的測試刷卡頁**，用來實機驗證 Pay Test Autofill 外掛在真實網域／iframe 上的填入。

這不是 mock 假頁面——綠界／藍新會 redirect 到 `*.ecpay.com.tw` / `ccore.newebpay.com`，Stripe 會在頁面內嵌真實的 `js.stripe.com` iframe。

## 啟動

```bash
cp .env.example .env   # 首次：填入各家測試憑證
bun run demo           # http://localhost:3000
```

開啟 <http://localhost:3000>，先確認外掛已載入瀏覽器（`dist/chrome` 或 `dist/firefox`），再點各金流前往刷卡頁。

## 各金流就緒條件與測試卡

| 金流 | 就緒條件 | 流程 | 測試卡 |
|------|---------|------|--------|
| **綠界 ECPay** | 內建官方公開測試商店，**開箱即用** | 後端算 `CheckMacValue` → 自動 POST → 導向 `payment-stage.ecpay.com.tw`（先選「信用卡」進入卡號頁） | `4311-9522-2222-2222` / CVC `222` / 未來到期；3D 簡訊固定 `1234` |
| **Stripe** | `.env` 填 `STRIPE_PUBLISHABLE_KEY`（送出付款另需 `STRIPE_SECRET_KEY`） | 頁面內嵌 Card Element 分離欄位（真實 js.stripe.com iframe） | `4242 4242 4242 4242`；3DS `4000 0025 0000 3155` |
| **藍新 NewebPay** | `.env` 填 `NEWEBPAY_*`（**需自行**至 `cwww.newebpay.com` 申請測試商店） | 後端 AES 加密 `TradeInfo` + `TradeSha` → 自動 POST → 導向 `ccore.newebpay.com` | `4000-2211-1111-1111` / 任意 CVC / 未來到期 |

## 各金流的已知狀態（給外掛驗收）

- **綠界**：簽章已對綠界測試端點實測通過（回真實頁、無 `CheckMacValue` 錯誤）。卡號頁欄位 `name`/`id` 官方未公開，**需在真實卡號頁驗證 `adapters/ecpay.js` 的 selector 是否命中**。
- **Stripe**：刻意用 **Card Element 分離欄位**，因其 iframe 內 `name=cardnumber/exp-date/cvc` 較穩定，外掛現有 selector 才接得上（Payment Element 不穩）。
- **藍新**：演算法（AES-256-CBC hex + PKCS7、`TradeSha` 大寫）已依官方確認；待你填入測試商店憑證後實測。`NotifyURL`/`ReturnURL` 在 localhost 收不到背景通知，但不影響進入刷卡頁。

## 安全

`.env` 已被 `.gitignore` 排除，**金鑰不會進 git**。後端只從 `process.env` 讀取（Bun 自動載入 `.env`）；publishable key 屬前端可公開金鑰，由 `/config.json` 提供給前端頁面。
