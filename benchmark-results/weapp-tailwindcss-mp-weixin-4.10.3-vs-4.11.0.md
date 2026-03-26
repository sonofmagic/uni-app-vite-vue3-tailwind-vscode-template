# weapp-tailwindcss mp-weixin benchmark

Generated at 2026-03-26T08:18:23.105Z.

Versions: 4.10.3 vs 4.11.0

Rounds per version: 5

## Summary

| Metric | 4.10.3 mean (ms) | 4.11.0 mean (ms) | Delta (ms) | Faster |
| --- | ---: | ---: | ---: | ---: |
| build:mp-weixin | 7538.98 | 5223.8 | 2315.18 | 30.71% |
| dev:mp-weixin startup | 4600.2 | 3825.4 | 774.8 | 16.84% |
| dev:mp-weixin hmr | 1029.08 | 792.36 | 236.72 | 23% |

## 4.10.3

| Metric | Round 1 | Round 2 | Round 3 | Round 4 | Round 5 | Mean | Median | Min | Max | StdDev |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| build:mp-weixin | 5948.23 | 6213.25 | 8641.98 | 9783.38 | 7108.07 | 7538.98 | 7108.07 | 5948.23 | 9783.38 | 1464.76 |
| dev:mp-weixin startup | 3806 | 5135 | 4732 | 4436 | 4892 | 4600.2 | 4732 | 3806 | 5135 | 457.44 |
| dev:mp-weixin hmr | 1378.62 | 732.83 | 849.87 | 988.72 | 1195.35 | 1029.08 | 988.72 | 732.83 | 1378.62 | 232.95 |

## 4.11.0

| Metric | Round 1 | Round 2 | Round 3 | Round 4 | Round 5 | Mean | Median | Min | Max | StdDev |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| build:mp-weixin | 5223.26 | 5252.62 | 5352.7 | 5494.65 | 4795.76 | 5223.8 | 5252.62 | 4795.76 | 5494.65 | 234.1 |
| dev:mp-weixin startup | 3653 | 3667 | 3800 | 4333 | 3674 | 3825.4 | 3674 | 3653 | 4333 | 259.24 |
| dev:mp-weixin hmr | 821.98 | 825.41 | 845.05 | 728.97 | 740.4 | 792.36 | 821.98 | 728.97 | 845.05 | 47.88 |

## Method

- Each version was installed into the same existing pnpm store and benchmarked in the same workspace.
- Build metric is wall-clock time for `pnpm run build:mp-weixin`.
- Dev startup metric is the `ready in ...ms` value emitted by `pnpm run dev:mp-weixin`.
- HMR metric is the elapsed time from editing `src/pages/index/index.vue` to a file update detected under `dist/dev/mp-weixin`.
- The benchmark restores `package.json`, `pnpm-lock.yaml`, and the source file after completion.

