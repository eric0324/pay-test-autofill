// Stripe 測試模式：用原生 fetch 建立 PaymentIntent（不依賴 stripe 套件）。
// 卡片輸入用 Card Element 分離欄位（cardNumber/cardExpiry/cardCvc），
// 因其 js.stripe.com iframe 內 input 的 name（cardnumber/exp-date/cvc）較穩定，外掛 selector 才接得上。
// 注意：僅渲染卡欄位、測試外掛自動填入時，前端只需 pk_test；
//       要真正送出付款（confirmCardPayment）才需要本檔用 sk_test 建立的 client_secret。

/** 以 sk_test 建立 PaymentIntent，回傳 client_secret。 */
export async function createPaymentIntent(secretKey) {
  const body = new URLSearchParams({
    // TWD 在 Stripe 是兩位小數貨幣：amount 以「分」計，10000 = NT$100.00。
    // 須高於 Stripe 最低收款額（約 $0.50 USD），否則回 "Amount must convert to at least 50 cents"。
    amount: '10000',
    currency: 'twd',
    'payment_method_types[]': 'card',
  });
  const res = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe API ${res.status}`);
  }
  return data.client_secret;
}
