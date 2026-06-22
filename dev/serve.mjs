// 本機模擬測試頁的靜態伺服器（Bun.serve）。
// 用途：以正確的 ES module MIME 提供 dev/ 與 src/，讓 harness.html 能直接 import 原始模組。
// 啟動：bun dev/serve.mjs（或 bun run harness），預設 http://localhost:5179/dev/harness.html
//       若 port 被佔用：PORT=8080 bun run harness
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = normalize(join(fileURLToPath(import.meta.url), '..', '..'));
const PORT = Number(process.env.PORT) || 5179;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    let path = decodeURIComponent(new URL(req.url).pathname);
    if (path === '/') path = '/dev/harness.html';
    const filePath = normalize(join(ROOT, path));
    if (!filePath.startsWith(ROOT)) {
      return new Response('forbidden', { status: 403 });
    }
    const file = Bun.file(filePath); // Content-Type 依副檔名自動推斷（.js → text/javascript）
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response('not found', { status: 404 });
  },
});

console.log(`\n  模擬測試頁已啟動：`);
console.log(`  → http://localhost:${server.port}/dev/harness.html\n`);
console.log(`  Ctrl+C 結束。\n`);
