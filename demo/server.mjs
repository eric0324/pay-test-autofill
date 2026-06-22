// demo 商家後端（Bun.serve）。每條路由把使用者導向「該金流真實的測試刷卡頁」，
// 讓已安裝的外掛在真實網域 / iframe 上實測填入。
// 啟動：bun demo/server.mjs（或 bun run demo）。憑證由 .env 自動載入（見 .env.example）。
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ecpayAutoSubmitHtml } from './ecpay.mjs';
import { newebpayAutoSubmitHtml } from './newebpay.mjs';
import { createPaymentIntent } from './stripe.mjs';

const VIEWS = normalize(join(fileURLToPath(import.meta.url), '..', 'views'));
const PREFERRED_PORT = Number(process.env.PORT) || 3000;
let BASE = process.env.BASE_URL || ''; // 綁定後依實際 port 補上
const env = process.env;

// 綠界／藍新要求 ReturnURL 等通知網址的埠號僅能是 80 或 443。
// 本機 demo 通常跑在 localhost:3000+ 自訂埠 → 會被拒。
// 解法：若有設定公開網址（BASE_URL，例如 ngrok https）就用它；否則用 example.com 佔位，
// 讓金流接受並完成交易，交易結果直接看金流自己的結果頁（autofill 測試不需收到通知）。
function callbackBase() {
  const b = process.env.BASE_URL || '';
  if (/^https:\/\//.test(b)) return b; // https（含 ngrok）→ 443
  if (/^http:\/\/[^:/]+(\/|$)/.test(b)) return b; // http 且無自訂埠號 → 80
  return 'https://example.com';
}
const CB = callbackBase();

const ecpayCfg = () => ({
  merchantId: env.ECPAY_MERCHANT_ID,
  hashKey: env.ECPAY_HASH_KEY,
  hashIV: env.ECPAY_HASH_IV,
  baseUrl: CB,
});
const newebpayCfg = () => ({
  merchantId: env.NEWEBPAY_MERCHANT_ID,
  hashKey: env.NEWEBPAY_HASH_KEY,
  hashIV: env.NEWEBPAY_HASH_IV,
  baseUrl: CB,
});

const ecpayReady = !!(env.ECPAY_MERCHANT_ID && env.ECPAY_HASH_KEY && env.ECPAY_HASH_IV);
const stripeReady = !!env.STRIPE_PUBLISHABLE_KEY;
const newebpayReady = !!(env.NEWEBPAY_MERCHANT_ID && env.NEWEBPAY_HASH_KEY && env.NEWEBPAY_HASH_IV);

const html = (body, status = 200) =>
  new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
const view = (name) => new Response(Bun.file(join(VIEWS, name)));
const notReady = (msg) => html(`<body style="font-family:sans-serif;padding:40px"><p>${msg}</p><a href="/">← 返回</a></body>`);

async function fetchHandler(req) {
    const { pathname } = new URL(req.url);

    if (pathname === '/') return view('index.html');

    if (pathname === '/config.json') {
      return Response.json({
        ecpayReady, stripeReady, newebpayReady,
        stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY || '',
        stripeCanConfirm: !!env.STRIPE_SECRET_KEY,
      });
    }

    // ── 綠界：自動 submit 導向真實刷卡頁 ──
    if (pathname === '/ecpay') {
      if (!ecpayReady) return notReady('綠界憑證未設定（.env 的 ECPAY_*）。');
      return html(ecpayAutoSubmitHtml(ecpayCfg()));
    }

    // ── 藍新：自動 submit 導向真實刷卡頁 ──
    if (pathname === '/newebpay') {
      if (!newebpayReady) return notReady('藍新憑證未設定。請至 cwww.newebpay.com 申請測試商店，填入 .env 的 NEWEBPAY_*。');
      return html(newebpayAutoSubmitHtml(newebpayCfg()));
    }

    // ── Stripe：頁面內嵌 Card Element（真實 js.stripe.com iframe）──
    if (pathname === '/stripe') return view('stripe.html');
    if (pathname === '/stripe/intent' && req.method === 'POST') {
      if (!env.STRIPE_SECRET_KEY) return Response.json({ error: '未設定 STRIPE_SECRET_KEY' }, { status: 400 });
      try {
        return Response.json({ clientSecret: await createPaymentIntent(env.STRIPE_SECRET_KEY) });
      } catch (e) {
        return Response.json({ error: String(e.message || e) }, { status: 502 });
      }
    }

    // 付款後導回 / 後端通知（demo 僅回 ack）
    if (pathname.startsWith('/ecpay/') || pathname.startsWith('/newebpay/')) {
      return html(`<body style="font-family:sans-serif;padding:40px"><p>已收到金流回應（demo）。</p><a href="/">← 返回</a></body>`);
    }

    return new Response('Not found', { status: 404 });
}

// 嘗試偏好 port，被占用就往後退讓（最後用 0 = 隨機可用 port）。
function listenWithFallback() {
  const candidates = [PREFERRED_PORT, PREFERRED_PORT + 1, PREFERRED_PORT + 2, PREFERRED_PORT + 3, 0];
  for (const port of candidates) {
    try {
      return Bun.serve({ port, fetch: fetchHandler });
    } catch (e) {
      if (e?.code !== 'EADDRINUSE') throw e;
      if (port !== 0) console.log(`  port ${port} 已被占用，改試下一個…`);
    }
  }
  throw new Error('找不到可用的 port');
}

const server = listenWithFallback();
if (!BASE) BASE = `http://localhost:${server.port}`;

console.log(`\n  demo 商家已啟動：${BASE}`);
console.log(`  就緒狀態 → 綠界:${ecpayReady} Stripe:${stripeReady} 藍新:${newebpayReady}`);
console.log(`  綠界/藍新 callback 網址：${CB}${CB === 'https://example.com' ? '（佔位，可完成交易、結果看金流結果頁）' : ''}`);
console.log('\n  指定 port：PORT=8080 bun run demo');
console.log('  要收到金流背景通知：BASE_URL=https://你的ngrok網址 bun run demo');
console.log('  Ctrl+C 結束。\n');
