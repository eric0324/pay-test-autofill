# Privacy Policy — Pay Test Autofill

_Last updated: 2026-06-22_

## English

**Pay Test Autofill does not collect, store, transmit, or share any user data.**

- **No data collection.** The extension does not collect personal information,
  browsing history, credentials, or any other user data.
- **No network requests.** The extension makes no requests to any server. It has
  no backend, no analytics, and no telemetry.
- **No tracking.** There are no cookies, identifiers, or third-party trackers.
- **What it actually does.** On supported payment **test/sandbox** pages, it
  injects a floating panel and, when you click a test card, writes that card's
  **non-secret test values** (card number, expiry, CVC) into the page's input
  fields. These are publicly documented test card numbers — not real cards.
- **Why it needs broad site access.** Stripe Elements can be embedded as
  cross-origin iframes (`js.stripe.com`) on any merchant site, so the content
  script must be able to run on all sites and frames to detect and fill those
  fields. This access is used solely for detecting payment fields and filling
  test values locally in your browser. Nothing is read or sent anywhere.
- **Local only.** All behavior happens locally in your browser. Removing the
  extension leaves no residual data.

## 繁體中文

**Pay Test Autofill 不蒐集、不儲存、不傳輸、不分享任何使用者資料。**

- **零資料蒐集**：不蒐集個人資訊、瀏覽紀錄、憑證或任何使用者資料。
- **零網路請求**：不向任何伺服器發出請求；無後端、無分析、無遙測。
- **零追蹤**：無 cookie、無識別碼、無第三方追蹤。
- **實際行為**：在受支援的金流**測試／沙盒**頁面注入浮動面板；點測試卡時，
  把該卡的**非機密測試值**（卡號、到期、CVC）填入頁面欄位。這些都是各家公開
  文件提供的測試卡號，並非真實卡片。
- **為何需要廣泛網站存取**：Stripe Elements 可能以跨網域 iframe（`js.stripe.com`）
  內嵌於任意商家頁面，故 content script 須能在所有網站與 frame 執行，以偵測並填入
  欄位。此存取僅用於在你的瀏覽器本機偵測金流欄位與填入測試值，不讀取也不外傳任何內容。
- **純本機**：所有行為皆在瀏覽器本機進行；移除外掛後無任何殘留資料。

## Contact

Questions: open an issue at <https://github.com/eric0324/pay-test-autofill>.
