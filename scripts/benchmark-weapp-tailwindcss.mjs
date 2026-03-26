import { spawn } from 'node:child_process'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { performance } from 'node:perf_hooks'

const cwd = process.cwd()
const packageJsonPath = path.join(cwd, 'package.json')
const lockfilePath = path.join(cwd, 'pnpm-lock.yaml')
const sourceFilePath = path.join(cwd, 'src/pages/index/index.vue')
const resultsDir = path.join(cwd, 'benchmark-results')
const resultsJsonPath = path.join(resultsDir, 'weapp-tailwindcss-mp-weixin-4.10.3-vs-4.11.0.json')
const resultsMarkdownPath = path.join(resultsDir, 'weapp-tailwindcss-mp-weixin-4.10.3-vs-4.11.0.md')
const versions = ['4.10.3', '4.11.0']
const rounds = 5
const buildScript = 'build:mp-weixin'
const devScript = 'dev:mp-weixin'
const devDistDir = path.join(cwd, 'dist', 'dev', 'mp-weixin')
const readyPattern = /ready in (\d+)ms/i
const commandTimeoutMs = 10 * 60 * 1000
const hmrTimeoutMs = 90 * 1000
const hmrPollIntervalMs = 100

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function round(value) {
  return Number(value.toFixed(2))
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

function standardDeviation(values) {
  if (values.length === 1) {
    return 0
  }
  const mean = average(values)
  const variance = values.reduce((sum, value) => {
    return sum + (value - mean) ** 2
  }, 0) / values.length
  return Math.sqrt(variance)
}

function summarize(values) {
  return {
    mean: round(average(values)),
    median: round(median(values)),
    min: round(Math.min(...values)),
    max: round(Math.max(...values)),
    stddev: round(standardDeviation(values)),
  }
}

function compare(oldSummary, newSummary) {
  const diff = oldSummary.mean - newSummary.mean
  const percent = oldSummary.mean === 0 ? 0 : (diff / oldSummary.mean) * 100
  return {
    absoluteMs: round(diff),
    percent: round(percent),
  }
}

async function getPnpmStoreDir() {
  const modulesMetadata = JSON.parse(await readFile(path.join(cwd, 'node_modules/.modules.yaml'), 'utf8'))
  return modulesMetadata.storeDir
}

function runCommand(command, args, handlers = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        FORCE_COLOR: '0',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    let settled = false
    const timeoutId = setTimeout(() => {
      child.kill('SIGINT')
      reject(new Error(`${command} ${args.join(' ')} timed out after ${commandTimeoutMs}ms`))
    }, commandTimeoutMs)

    const finish = (fn, value) => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timeoutId)
      fn(value)
    }

    const onData = (chunk, source) => {
      const text = chunk.toString()
      if (source === 'stdout') {
        stdout += text
      }
      else {
        stderr += text
      }
      handlers.onData?.(text, { child, stdout, stderr, finish })
    }

    child.stdout.on('data', chunk => onData(chunk, 'stdout'))
    child.stderr.on('data', chunk => onData(chunk, 'stderr'))
    child.on('error', error => finish(reject, error))
    child.on('close', (code, signal) => {
      handlers.onClose?.({ code, signal, stdout, stderr, finish })
      if (settled) {
        return
      }
      if (code === 0) {
        finish(resolve, { stdout, stderr, code, signal })
        return
      }
      finish(reject, new Error(`${command} ${args.join(' ')} failed with code ${code ?? 'null'} (${signal ?? 'no-signal'})\n${stdout}\n${stderr}`))
    })
  })
}

async function setDependencyVersion(version, storeDir) {
  await runCommand('pnpm', ['add', '-D', `weapp-tailwindcss@${version}`, '--save-exact', '--store-dir', storeDir])
}

async function restoreWorkspace(storeDir, originalPackageJson, originalLockfile, originalSource) {
  await writeFile(packageJsonPath, originalPackageJson)
  await writeFile(lockfilePath, originalLockfile)
  await writeFile(sourceFilePath, originalSource)
  await runCommand('pnpm', ['install', '--store-dir', storeDir])
}

async function runMeasuredScript(scriptName) {
  const startedAt = performance.now()
  await runCommand('pnpm', ['run', scriptName])
  return round(performance.now() - startedAt)
}

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      return walkFiles(entryPath)
    }
    return [entryPath]
  }))
  return nested.flat()
}

async function getLatestMtimeMs(dir) {
  const files = await walkFiles(dir)
  const times = await Promise.all(files.map(async file => (await stat(file)).mtimeMs))
  return Math.max(...times)
}

async function waitForDistUpdate(baselineMtimeMs) {
  const startedAt = performance.now()
  while ((performance.now() - startedAt) < hmrTimeoutMs) {
    const latestMtimeMs = await getLatestMtimeMs(devDistDir)
    if (latestMtimeMs > baselineMtimeMs) {
      return round(performance.now() - startedAt)
    }
    await sleep(hmrPollIntervalMs)
  }
  throw new Error(`No updated dist artifact detected in ${devDistDir} within ${hmrTimeoutMs}ms`)
}

function applyBenchmarkToken(source, token) {
  return source.replace(
    "console.log('欢迎使用 weapp-tailwindcss 模板')",
    `console.log('欢迎使用 weapp-tailwindcss 模板 ${token}')`,
  )
}

async function measureDevRound(sourceTemplate, roundIndex, version) {
  let child
  const readyInMs = await new Promise((resolve, reject) => {
    let settled = false
    runCommand('pnpm', ['run', devScript], {
      onData(text, context) {
        child = context.child
        const match = text.match(readyPattern) ?? (context.stdout + context.stderr).match(readyPattern)
        if (!match || settled) {
          return
        }
        settled = true
        resolve(Number(match[1]))
      },
      onClose({ code, signal, stdout, stderr }) {
        if (settled) {
          return
        }
        settled = true
        reject(new Error(`${devScript} exited before ready: ${code ?? 'null'} (${signal ?? 'no-signal'})\n${stdout}\n${stderr}`))
      },
    }).catch((error) => {
      if (settled) {
        return
      }
      settled = true
      reject(error)
    })
  })

  await sleep(1000)
  const baselineMtimeMs = await getLatestMtimeMs(devDistDir)
  const token = `[benchmark ${version} round-${roundIndex + 1} ${Date.now()}]`
  await writeFile(sourceFilePath, applyBenchmarkToken(sourceTemplate, token))

  try {
    const hmrInMs = await waitForDistUpdate(baselineMtimeMs)
    return {
      readyInMs,
      hmrInMs,
    }
  }
  finally {
    await writeFile(sourceFilePath, sourceTemplate)
    child?.kill('SIGINT')
    await sleep(1000)
  }
}

function buildMarkdownReport(report) {
  const buildComparison = compare(report.results['4.10.3'].build.summary, report.results['4.11.0'].build.summary)
  const readyComparison = compare(report.results['4.10.3'].devStartup.summary, report.results['4.11.0'].devStartup.summary)
  const hmrComparison = compare(report.results['4.10.3'].hmr.summary, report.results['4.11.0'].hmr.summary)

  const sections = [
    '# weapp-tailwindcss mp-weixin benchmark',
    '',
    `Generated at ${report.generatedAt}.`,
    '',
    `Versions: ${report.versions.join(' vs ')}`,
    '',
    `Rounds per version: ${report.rounds}`,
    '',
    '## Summary',
    '',
    '| Metric | 4.10.3 mean (ms) | 4.11.0 mean (ms) | Delta (ms) | Faster |',
    '| --- | ---: | ---: | ---: | ---: |',
    `| build:mp-weixin | ${report.results['4.10.3'].build.summary.mean} | ${report.results['4.11.0'].build.summary.mean} | ${buildComparison.absoluteMs} | ${buildComparison.percent}% |`,
    `| dev:mp-weixin startup | ${report.results['4.10.3'].devStartup.summary.mean} | ${report.results['4.11.0'].devStartup.summary.mean} | ${readyComparison.absoluteMs} | ${readyComparison.percent}% |`,
    `| dev:mp-weixin hmr | ${report.results['4.10.3'].hmr.summary.mean} | ${report.results['4.11.0'].hmr.summary.mean} | ${hmrComparison.absoluteMs} | ${hmrComparison.percent}% |`,
    '',
  ]

  for (const version of versions) {
    const { build, devStartup, hmr } = report.results[version]
    sections.push(`## ${version}`)
    sections.push('')
    sections.push('| Metric | Round 1 | Round 2 | Round 3 | Round 4 | Round 5 | Mean | Median | Min | Max | StdDev |')
    sections.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
    sections.push(`| build:mp-weixin | ${build.rounds.join(' | ')} | ${build.summary.mean} | ${build.summary.median} | ${build.summary.min} | ${build.summary.max} | ${build.summary.stddev} |`)
    sections.push(`| dev:mp-weixin startup | ${devStartup.rounds.join(' | ')} | ${devStartup.summary.mean} | ${devStartup.summary.median} | ${devStartup.summary.min} | ${devStartup.summary.max} | ${devStartup.summary.stddev} |`)
    sections.push(`| dev:mp-weixin hmr | ${hmr.rounds.join(' | ')} | ${hmr.summary.mean} | ${hmr.summary.median} | ${hmr.summary.min} | ${hmr.summary.max} | ${hmr.summary.stddev} |`)
    sections.push('')
  }

  sections.push('## Method')
  sections.push('')
  sections.push('- Each version was installed into the same existing pnpm store and benchmarked in the same workspace.')
  sections.push('- Build metric is wall-clock time for `pnpm run build:mp-weixin`.')
  sections.push('- Dev startup metric is the `ready in ...ms` value emitted by `pnpm run dev:mp-weixin`.')
  sections.push('- HMR metric is the elapsed time from editing `src/pages/index/index.vue` to a file update detected under `dist/dev/mp-weixin`.')
  sections.push('- The benchmark restores `package.json`, `pnpm-lock.yaml`, and the source file after completion.')
  sections.push('')

  return `${sections.join('\n')}\n`
}

async function runVersionBenchmark(version, sourceTemplate, storeDir) {
  console.log(`\n==> Benchmarking weapp-tailwindcss@${version}`)
  await setDependencyVersion(version, storeDir)

  const buildRounds = []
  const readyRounds = []
  const hmrRounds = []

  for (let index = 0; index < rounds; index += 1) {
    console.log(`round ${index + 1}/${rounds} build`)
    buildRounds.push(await runMeasuredScript(buildScript))
    console.log(`round ${index + 1}/${rounds} dev+hmr`)
    const devRound = await measureDevRound(sourceTemplate, index, version)
    readyRounds.push(devRound.readyInMs)
    hmrRounds.push(devRound.hmrInMs)
  }

  return {
    build: {
      rounds: buildRounds,
      summary: summarize(buildRounds),
    },
    devStartup: {
      rounds: readyRounds,
      summary: summarize(readyRounds),
    },
    hmr: {
      rounds: hmrRounds,
      summary: summarize(hmrRounds),
    },
  }
}

async function main() {
  const storeDir = await getPnpmStoreDir()
  const originalPackageJson = await readFile(packageJsonPath, 'utf8')
  const originalLockfile = await readFile(lockfilePath, 'utf8')
  const originalSource = await readFile(sourceFilePath, 'utf8')

  await mkdir(resultsDir, { recursive: true })

  const report = {
    generatedAt: new Date().toISOString(),
    rounds,
    versions,
    target: 'mp-weixin',
    buildScript,
    devScript,
    results: {},
  }

  try {
    for (const version of versions) {
      report.results[version] = await runVersionBenchmark(version, originalSource, storeDir)
    }

    await writeFile(resultsJsonPath, `${JSON.stringify(report, null, 2)}\n`)
    await writeFile(resultsMarkdownPath, buildMarkdownReport(report))
  }
  finally {
    await restoreWorkspace(storeDir, originalPackageJson, originalLockfile, originalSource)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
