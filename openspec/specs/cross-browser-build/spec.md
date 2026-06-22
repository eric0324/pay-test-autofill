# cross-browser-build Specification

## Purpose
TBD - created by archiving change add-pay-test-autofill. Update Purpose after archive.
## Requirements
### Requirement: 單一原始碼產出雙瀏覽器外掛
建構流程 SHALL 由單一份 `src/` 原始碼，經 `Bun.build` 打包，產出 `dist/chrome/` 與 `dist/firefox/` 兩份可載入的外掛。執行 `bun run build` MUST 同時產生兩個版本。

#### Scenario: 一次建構產出兩版
- **WHEN** 開發者執行 `bun run build`
- **THEN** 系統 MUST 在 `dist/chrome/` 與 `dist/firefox/` 各產出含 manifest 與打包後 content script 的完整外掛

#### Scenario: content script 打包為單檔
- **WHEN** content script 透過 ES module `import` 引用其他模組
- **THEN** 建構 MUST 將其打包為瀏覽器可直接載入的單檔，而非依賴執行期 module 解析

### Requirement: Manifest V3 與瀏覽器差異處理
兩個版本 SHALL 皆為 Manifest V3，並依瀏覽器差異調整。Firefox 版 MUST 包含 `browser_specific_settings.gecko.id`；content script 的 `matches` MUST 涵蓋四家金流測試網域，並對含跨網域 iframe 的金流啟用 `all_frames`。

#### Scenario: Firefox 專屬設定
- **WHEN** 產出 Firefox 版 manifest
- **THEN** 其 MUST 含 `browser_specific_settings.gecko.id`，且可於 Firefox 以暫時擴充功能載入

#### Scenario: iframe 注入設定
- **WHEN** 設定需處理跨網域 iframe 的金流（如 Stripe）
- **THEN** content script 設定 MUST 對該金流相關 frame 啟用 `all_frames`，使 iframe 內欄位可被填入

### Requirement: 本地化資源納入建構
建構流程 SHALL 將 `_locales/` 目錄一併輸出到 `dist/chrome` 與 `dist/firefox`，使外掛載入後 `browser.i18n` 可取得各語系訊息。兩份 manifest MUST 設定 `default_locale`（值為 `zh_TW`），作為回退語言。

#### Scenario: 建構產物含 _locales
- **WHEN** 開發者執行 `bun run build`
- **THEN** `dist/chrome` 與 `dist/firefox` 內 MUST 各含完整的 `_locales/zh_TW/` 與 `_locales/en/` 訊息檔

#### Scenario: manifest 設定 default_locale
- **WHEN** 產出兩瀏覽器版 manifest
- **THEN** 兩者 MUST 皆含 `default_locale: "zh_TW"`，使非支援語言回退至繁中

