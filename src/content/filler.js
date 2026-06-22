// 填值核心：對 React/Vue 等受控元件，直接設定 el.value 不會更新其內部狀態，
// 必須透過原生 value setter 設值，再派發 input/change/blur 事件。

/** 取得 input/textarea 的原生 value setter 並設值（繞過框架覆寫的 setter）。 */
export function setNativeValue(el, value) {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  if (desc && desc.set) {
    desc.set.call(el, value);
  } else {
    el.value = value;
  }
}

/** 元素是否可見且可填（排除 hidden、disabled、display:none）。 */
export function isFillable(el) {
  if (!el || el.disabled) return false;
  if (el.type === 'hidden') return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const style = el.ownerDocument.defaultView?.getComputedStyle(el);
  if (style && (style.display === 'none' || style.visibility === 'hidden')) {
    return false;
  }
  return true;
}

/** 在 root 內依序嘗試多個 selector，回傳第一個可填欄位。 */
export function findField(root, selectors) {
  for (const sel of selectors) {
    let el;
    try {
      el = root.querySelector(sel);
    } catch {
      continue; // 無效 selector 跳過
    }
    if (el && isFillable(el)) return el;
  }
  return null;
}

/** 填入單一欄位並派發必要事件。 */
export function fillInput(el, value) {
  el.focus();
  setNativeValue(el, String(value));
  el.dispatchEvent(
    new InputEvent('input', { bubbles: true, data: String(value), inputType: 'insertText' }),
  );
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

/** 找到並填入欄位；成功回傳 true。 */
export function fillField(root, selectors, value) {
  const el = findField(root, selectors);
  if (!el) return false;
  fillInput(el, value);
  return true;
}

/**
 * 等待符合任一 selector 的欄位出現。
 * 立即命中則直接 resolve；否則以 MutationObserver 監看至 timeout。
 */
export function waitForField(root, selectors, timeout = 4000) {
  return new Promise((resolve) => {
    const existing = findField(root, selectors);
    if (existing) {
      resolve(existing);
      return;
    }
    const win = root.ownerDocument?.defaultView || globalThis;
    let timer;
    const observer = new win.MutationObserver(() => {
      const el = findField(root, selectors);
      if (el) {
        observer.disconnect();
        if (timer) win.clearTimeout(timer);
        resolve(el);
      }
    });
    const target = root.body || root.documentElement || root;
    observer.observe(target, { childList: true, subtree: true });
    timer = win.setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}
