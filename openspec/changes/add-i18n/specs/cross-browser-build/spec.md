## ADDED Requirements

### Requirement: 本地化資源納入建構
建構流程 SHALL 將 `_locales/` 目錄一併輸出到 `dist/chrome` 與 `dist/firefox`，使外掛載入後 `browser.i18n` 可取得各語系訊息。兩份 manifest MUST 設定 `default_locale`（值為 `zh_TW`），作為回退語言。

#### Scenario: 建構產物含 _locales
- **WHEN** 開發者執行 `bun run build`
- **THEN** `dist/chrome` 與 `dist/firefox` 內 MUST 各含完整的 `_locales/zh_TW/` 與 `_locales/en/` 訊息檔

#### Scenario: manifest 設定 default_locale
- **WHEN** 產出兩瀏覽器版 manifest
- **THEN** 兩者 MUST 皆含 `default_locale: "zh_TW"`，使非支援語言回退至繁中
