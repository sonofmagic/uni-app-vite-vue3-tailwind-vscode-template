# weapp-tailwindcss next comparison

Date: 2026-05-07

Upgrade:

- Before: `weapp-tailwindcss@4.12.0`
- After: `weapp-tailwindcss@5.0.0-next.2`
- Tailwind CSS: `3.4.19`
- uni-app: `3.0.0-5000720260410001`
- Node: `v22.22.0`
- pnpm: `10.33.2`

## Build Result

All baseline builds and upgraded builds completed successfully.

| Platform | Before | After |
| --- | ---: | ---: |
| app | 0 | 0 |
| h5 | 0 | 0 |
| h5-ssr | 0 | 0 |
| mp-alipay | 0 | 0 |
| mp-baidu | 0 | 0 |
| mp-kuaishou | 0 | 0 |
| mp-lark | 0 | 0 |
| mp-qq | 0 | 0 |
| mp-toutiao | 0 | 0 |
| mp-weixin | 0 | 0 |
| quickapp-webview | 0 | 0 |
| quickapp-webview-huawei | 0 | 0 |
| quickapp-webview-union | 0 | 0 |

## Artifact Comparison

The generated artifacts are identical between `before` and `after`.

`reports/summary.tsv` shows zero added, removed, or changed files for every platform. `reports/diff-qr/*.txt` files are empty, confirming `diff -qr` found no artifact differences.

## Directory Layout

- `before/logs/`: build logs before upgrading.
- `before/outputs/`: artifact snapshots before upgrading.
- `after/logs/`: build logs after upgrading.
- `after/outputs/`: artifact snapshots after upgrading.
- `reports/summary.tsv`: per-platform file count, size, and changed-file summary.
- `reports/checksums/`: SHA-256 file manifests for both sides.
- `reports/diff-qr/`: per-platform `diff -qr` output.
