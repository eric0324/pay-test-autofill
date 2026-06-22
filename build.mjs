// 由單一份 src/ 經 Bun.build 打包，產出 dist/chrome 與 dist/firefox 兩份 MV3 外掛。
// 以 bun 執行：bun build.mjs（或 bun run build）。
import { mkdir, rm, readdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const targets = [
  { name: 'chrome', manifest: 'manifest.chrome.json' },
  { name: 'firefox', manifest: 'manifest.firefox.json' },
];

async function copyIcons(outDir) {
  const iconsDir = join(root, 'icons');
  if (!existsSync(iconsDir)) return;
  await mkdir(join(outDir, 'icons'), { recursive: true });
  for (const f of await readdir(iconsDir)) {
    await Bun.write(join(outDir, 'icons', f), Bun.file(join(iconsDir, f)));
  }
}

// i18n 訊息檔（_locales/<locale>/messages.json）為靜態資源，原樣複製到 dist。
async function copyLocales(outDir) {
  const localesDir = join(root, '_locales');
  if (!existsSync(localesDir)) return;
  await cp(localesDir, join(outDir, '_locales'), { recursive: true });
}

async function run() {
  // content script 無法直接用 ES module import，打包成單檔 IIFE。
  const result = await Bun.build({
    entrypoints: [join(root, 'src/content/index.js')],
    format: 'iife',
    target: 'browser',
    minify: false,
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error('Bun.build 失敗');
  }
  const code = await result.outputs[0].text();

  for (const t of targets) {
    const outDir = join(root, 'dist', t.name);
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    await Bun.write(join(outDir, 'content.js'), code);
    await Bun.write(join(outDir, 'manifest.json'), Bun.file(join(root, t.manifest)));
    await copyIcons(outDir);
    await copyLocales(outDir);
    console.log(`✓ built dist/${t.name}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
