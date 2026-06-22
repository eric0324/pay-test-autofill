// 藍新 NewebPay MPG 測試環境串接。
// 產生自動 submit 的 HTML form，POST 到 ccore.newebpay.com/MPG/mpg_gateway，導向藍新測試刷卡頁。
// 演算法：TradeInfo = AES-256-CBC(hex, PKCS7, key=HashKey, iv=HashIV)；TradeSha = SHA256 大寫。
import { createCipheriv, createHash } from 'node:crypto';

const STAGE_ENDPOINT = 'https://ccore.newebpay.com/MPG/mpg_gateway';
const VERSION = '2.0';

function aesEncrypt(plain, key, iv) {
  const cipher = createCipheriv('aes-256-cbc', key, iv); // 預設啟用 PKCS7 padding
  return cipher.update(plain, 'utf8', 'hex') + cipher.final('hex');
}

function tradeSha(tradeInfo, key, iv) {
  const raw = `HashKey=${key}&${tradeInfo}&HashIV=${iv}`;
  return createHash('sha256').update(raw).digest('hex').toUpperCase();
}

/**
 * 建立藍新 MPG 結帳的外層參數。
 * @param {object} cfg { merchantId, hashKey, hashIV, baseUrl }
 */
export function buildNewebpayCheckout(cfg) {
  const inner = {
    MerchantID: cfg.merchantId,
    RespondType: 'JSON',
    TimeStamp: String(Math.floor(Date.now() / 1000)),
    Version: VERSION,
    MerchantOrderNo: `pta${Date.now()}`,
    Amt: '100',
    ItemDesc: 'pay test autofill demo',
    Email: 'demo@example.com',
    NotifyURL: `${cfg.baseUrl}/newebpay/notify`,
    ReturnURL: `${cfg.baseUrl}/newebpay/result`,
    ClientBackURL: `${cfg.baseUrl}/`,
    CREDIT: '1',
  };
  const tradeInfo = aesEncrypt(new URLSearchParams(inner).toString(), cfg.hashKey, cfg.hashIV);
  return {
    endpoint: STAGE_ENDPOINT,
    params: {
      MerchantID: cfg.merchantId,
      TradeInfo: tradeInfo,
      TradeSha: tradeSha(tradeInfo, cfg.hashKey, cfg.hashIV),
      Version: VERSION,
    },
  };
}

export function newebpayAutoSubmitHtml(cfg) {
  const { endpoint, params } = buildNewebpayCheckout(cfg);
  const inputs = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}">`)
    .join('\n    ');
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>導向藍新測試刷卡頁…</title></head>
<body style="font-family:sans-serif;padding:40px">
  <p>正在導向藍新 NewebPay 測試刷卡頁…</p>
  <form id="mpg" method="post" action="${endpoint}">
    ${inputs}
  </form>
  <script>document.getElementById('mpg').submit();</script>
</body></html>`;
}
