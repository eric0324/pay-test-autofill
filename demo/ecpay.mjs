// 綠界 ECPay 全方位金流（AIO）測試環境串接。
// 產生一個自動 submit 的 HTML form，POST 到綠界測試刷卡頁，使用者被導向 payment-stage.ecpay.com.tw。
// 文件：https://developers.ecpay.com.tw/2866/（信用卡）、?p=2902（CheckMacValue）
import { createHash } from 'node:crypto';

const STAGE_ENDPOINT = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

/** 綠界 .NET 風格 URL encode（小寫、空格轉 +、部分保留字元還原），與綠界官方 SDK 一致。 */
function ecpayUrlEncode(str) {
  return encodeURIComponent(str)
    .toLowerCase()
    .replace(/%20/g, '+')
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')');
}

/** 依綠界規則計算 CheckMacValue（SHA256 大寫）。 */
export function checkMacValue(params, hashKey, hashIV) {
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`;
  return createHash('sha256').update(ecpayUrlEncode(raw)).digest('hex').toUpperCase();
}

/** yyyy/MM/dd HH:mm:ss（綠界 MerchantTradeDate 格式）。 */
function formatTradeDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/**
 * 建立綠界信用卡結帳的參數（含 CheckMacValue）與端點。
 * @param {object} cfg { merchantId, hashKey, hashIV, baseUrl }
 */
export function buildEcpayCheckout(cfg) {
  const now = new Date();
  const tradeNo = `pta${now.getTime()}`.slice(0, 20); // 英數、≤20、唯一
  const params = {
    MerchantID: cfg.merchantId,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: formatTradeDate(now),
    PaymentType: 'aio',
    TotalAmount: '100',
    TradeDesc: 'pay test autofill demo',
    ItemName: 'Test Item',
    ReturnURL: `${cfg.baseUrl}/ecpay/notify`, // 綠界要求埠號僅 80/443，故由 server 帶入公開網址
    ChoosePayment: 'Credit',
    EncryptType: '1',
    ClientBackURL: `${cfg.baseUrl}/`, // 不設 OrderResultURL，讓綠界顯示自己的交易結果頁
  };
  params.CheckMacValue = checkMacValue(params, cfg.hashKey, cfg.hashIV);
  return { endpoint: STAGE_ENDPOINT, params };
}

/** 產生自動 submit 的 HTML（瀏覽器一打開就被導向綠界刷卡頁）。 */
export function ecpayAutoSubmitHtml(cfg) {
  const { endpoint, params } = buildEcpayCheckout(cfg);
  const inputs = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}">`)
    .join('\n    ');
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>導向綠界測試刷卡頁…</title></head>
<body style="font-family:sans-serif;padding:40px">
  <p>正在導向綠界 ECPay 測試刷卡頁…</p>
  <form id="ecpay" method="post" action="${endpoint}">
    ${inputs}
  </form>
  <script>document.getElementById('ecpay').submit();</script>
</body></html>`;
}
