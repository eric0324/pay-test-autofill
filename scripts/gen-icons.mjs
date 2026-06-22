// 產生外掛圖示（信用卡圖樣）48／96／128 px PNG，無外部相依。
// 以 bun 執行：bun scripts/gen-icons.mjs → 輸出到 icons/
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons');

// ── 極簡 PNG 編碼器（truecolor + alpha）──
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ── 繪圖：以 128 為基準座標，依尺寸縮放 ──
function makeIcon(size) {
  const rgba = Buffer.alloc(size * size * 4); // 透明
  const set = (x, y, [r, g, b, a = 255]) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    // alpha 疊合到既有像素
    const sa = a / 255;
    rgba[i] = r * sa + rgba[i] * (1 - sa);
    rgba[i + 1] = g * sa + rgba[i + 1] * (1 - sa);
    rgba[i + 2] = b * sa + rgba[i + 2] * (1 - sa);
    rgba[i + 3] = Math.max(rgba[i + 3], a);
  };
  const S = size / 128;
  const rrect = (x0, y0, w, h, rad, col) => {
    x0 *= S; y0 *= S; w *= S; h *= S; rad *= S;
    for (let y = Math.floor(y0); y < y0 + h; y++) {
      for (let x = Math.floor(x0); x < x0 + w; x++) {
        const dx = Math.min(x - x0, x0 + w - 1 - x);
        const dy = Math.min(y - y0, y0 + h - 1 - y);
        if (dx < rad && dy < rad) {
          const ex = rad - dx, ey = rad - dy;
          if (ex * ex + ey * ey > rad * rad) continue;
        }
        set(x, y, col);
      }
    }
  };

  const INDIGO = [79, 70, 229];
  const DARK = [17, 24, 39];
  const GOLD = [245, 200, 80];
  const WHITE = [255, 255, 255, 230];

  rrect(8, 22, 112, 84, 14, INDIGO); // 卡身
  rrect(8, 38, 112, 18, 0, DARK); // 磁條
  rrect(22, 66, 26, 18, 4, GOLD); // 晶片
  rrect(56, 70, 50, 8, 4, WHITE); // 卡號示意 1
  rrect(22, 92, 84, 8, 4, WHITE); // 卡號示意 2
  return encodePng(size, rgba);
}

mkdirSync(ICONS_DIR, { recursive: true });
for (const size of [48, 96, 128]) {
  const file = join(ICONS_DIR, `icon-${size}.png`);
  writeFileSync(file, makeIcon(size));
  console.log(`✓ ${file}`);
}
