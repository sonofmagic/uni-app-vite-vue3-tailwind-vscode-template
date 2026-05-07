# weapp-tailwindcss next.3 comparison

Date: 2026-05-07

Upgrade:

- Before: `weapp-tailwindcss@5.0.0-next.2`
- After: `weapp-tailwindcss@5.0.0-next.3`
- Added for `next.3`: `@tailwindcss/oxide@4.2.4`
- Tailwind CSS: `3.4.19`
- uni-app: `3.0.0-5000720260410001`
- Node: `v22.22.0`
- pnpm: `10.33.2`

## Build Result

All baseline builds and upgraded builds completed successfully after adding `@tailwindcss/oxide@4.2.4`.

Without `@tailwindcss/oxide`, the `next.3` small-program and quickapp builds failed in `weapp-tailwindcss:adaptor:source-candidates` with:

```text
Cannot find package '@tailwindcss/oxide'
```

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

`reports/summary.tsv` contains the per-platform result.

- `app`, `h5`, and `h5-ssr`: no artifact differences.
- Small-program and quickapp targets: no added or removed files, but 3 CSS-style files changed per platform.
- The changed files are the platform app stylesheet plus `ExperienceLab` and `MacroShowcase` component styles.
- CSS output size dropped for every small-program and quickapp target.

Example for `mp-weixin`:

| File | Before bytes | After bytes |
| --- | ---: | ---: |
| `app.wxss` | 39906 | 445 |
| `ExperienceLab.wxss` | 410 | 171 |
| `MacroShowcase.wxss` | 143 | 169 |

## Risk Note

The `next.3` artifacts contain unprocessed Tailwind directives in generated style files:

- Before: 0 files
- After: 30 files

See:

- `reports/unprocessed-tailwind-directives-before.txt`
- `reports/unprocessed-tailwind-directives-after.txt`

This is the main behavioral difference observed in the generated-mode output. For example, `mp-weixin/app.wxss` contains raw `@tailwind` and `@apply` directives after the upgrade.

## Directory Layout

- `before/logs/`: build logs before upgrading.
- `before/outputs/`: artifact snapshots before upgrading.
- `after/logs/`: build logs after upgrading.
- `after/outputs/`: artifact snapshots after upgrading.
- `reports/summary.tsv`: per-platform file count, size, and changed-file summary.
- `reports/checksums/`: SHA-256 file manifests for both sides.
- `reports/diff-qr/`: per-platform `diff -qr` output.
- `reports/unprocessed-tailwind-directives-*.txt`: files containing raw `@tailwind` or `@apply` directives.
