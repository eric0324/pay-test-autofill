// 由單一份 src/ 經 esbuild 打包，產出 dist/chrome 與 dist/firefox 兩份 MV3 外掛。
import { build } from 'esbuild';
import { mkdir, rm, copyFile, readdir } from 'node:fs/promises';
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
    await copyFile(join(iconsDir, f), join(outDir, 'icons', f));
  }
}

async function run() {
  for (const t of targets) {
    const outDir = join(root, 'dist', t.name);
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });

    // content script 無法直接用 ES module import，打包成單檔 IIFE。
    await build({
      entryPoints: [join(root, 'src/content/index.js')],
      bundle: true,
      format: 'iife',
      target: ['chrome109', 'firefox115'],
      outfile: join(outDir, 'content.js'),
      legalComments: 'none',
    });

    await copyFile(join(root, t.manifest), join(outDir, 'manifest.json'));
    await copyIcons(outDir);
    console.log(`✓ built dist/${t.name}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
