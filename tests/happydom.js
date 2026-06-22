// bun test 的 DOM 環境：以 happy-dom 註冊 window/document 等全域。
// 由 bunfig.toml 的 [test].preload 在測試前載入。
import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();
