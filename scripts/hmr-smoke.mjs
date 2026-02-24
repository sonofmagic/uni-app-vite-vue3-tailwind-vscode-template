#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()

const args = parseArgs(process.argv.slice(2))
const platform = args.platform
const devScript = args.script ?? `dev:${platform}`
const timeoutMs = Number(args.timeout ?? 120_000)

if (!platform) {
  fail('Missing required argument: --platform <platform>')
}

const distPlatformDir = path.join(cwd, 'dist', 'dev', platform)
const targetVueFile = path.join(cwd, 'src', 'components', 'sections', 'GradientFeature.vue')
const markerPrefix = 'feature cards [hmr-smoke:'

const expectedColorSnippets = [
  'rgba(0, 0, 0, var(--tw-bg-opacity, 1))',
  'rgba(17, 17, 17, var(--tw-bg-opacity, 1))',
  'rgba(34, 34, 34, var(--tw-bg-opacity, 1))',
  'rgba(51, 51, 51, var(--tw-bg-opacity, 1))',
  'rgba(68, 68, 68, var(--tw-bg-opacity, 1))',
  'rgba(85, 85, 85, var(--tw-bg-opacity, 1))',
  'rgba(102, 102, 102, var(--tw-bg-opacity, 1))',
  'rgba(119, 119, 119, var(--tw-bg-opacity, 1))',
  'rgba(136, 136, 136, var(--tw-bg-opacity, 1))',
  'rgba(153, 153, 153, var(--tw-bg-opacity, 1))',
  'rgba(170, 170, 170, var(--tw-bg-opacity, 1))',
  'rgba(187, 187, 187, var(--tw-bg-opacity, 1))',
  'rgba(204, 204, 204, var(--tw-bg-opacity, 1))',
  'rgba(221, 221, 221, var(--tw-bg-opacity, 1))',
  'rgba(238, 238, 238, var(--tw-bg-opacity, 1))',
  'rgba(255, 255, 255, var(--tw-bg-opacity, 1))',
]

let devProcess
let originalTargetContent

main().catch((error) => {
  console.error(`\n[hmr-smoke] FAILED: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}).finally(async () => {
  await restoreTargetFile()
  await stopDevProcess()
})

async function main() {
  console.log(`[hmr-smoke] platform=${platform}`)
  console.log(`[hmr-smoke] script=${devScript}`)

  originalTargetContent = await fs.readFile(targetVueFile, 'utf8')
  devProcess = runDevScript(devScript)

  const styleFile = await waitForStyleFile(distPlatformDir, timeoutMs)
  console.log(`[hmr-smoke] style file: ${path.relative(cwd, styleFile)}`)

  await waitForExpectedSnippets(styleFile, expectedColorSnippets, timeoutMs, 'initial build')
  const beforeDirMtime = await getLatestMtimeMs(distPlatformDir)

  await triggerIncrementalChange(targetVueFile, originalTargetContent)
  await waitForDirMtimeBump(distPlatformDir, beforeDirMtime, timeoutMs)

  await waitForExpectedSnippets(styleFile, expectedColorSnippets, timeoutMs, 'incremental build')
  console.log('[hmr-smoke] PASS')
}

function runDevScript(scriptName) {
  const child = spawn('pnpm', ['run', scriptName], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  })

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[dev:${platform}] ${chunk}`)
  })
  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[dev:${platform}:err] ${chunk}`)
  })

  child.on('exit', (code, signal) => {
    if (code !== null) {
      console.log(`[hmr-smoke] dev exited with code=${code}`)
    }
    if (signal) {
      console.log(`[hmr-smoke] dev terminated by signal=${signal}`)
    }
  })

  return child
}

async function waitForStyleFile(platformDir, timeout) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeout) {
    if (existsSync(platformDir)) {
      const appStyles = (await fs.readdir(platformDir))
        .filter((name) => name.startsWith('app.') && name.endsWith('ss'))
      if (appStyles.length > 0) {
        return path.join(platformDir, appStyles[0])
      }
    }
    await sleep(700)
  }

  throw new Error(`Timed out waiting style output under ${path.relative(cwd, platformDir)}`)
}

async function waitForExpectedSnippets(file, snippets, timeout, phase) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeout) {
    const css = await fs.readFile(file, 'utf8')
    const missing = snippets.filter((snippet) => !css.includes(snippet))
    if (missing.length === 0) {
      console.log(`[hmr-smoke] ${phase}: expected snippets found`)
      return
    }
    await sleep(700)
  }

  const css = await fs.readFile(file, 'utf8')
  const missing = snippets.filter((snippet) => !css.includes(snippet))
  throw new Error(
    `${phase}: missing ${missing.length} expected color snippets, file=${path.relative(cwd, file)}, firstMissing=${missing[0]}\n` +
    `css length=${css.length}`,
  )
}

async function triggerIncrementalChange(file, currentContent) {
  const markerValue = `${markerPrefix}${new Date().toISOString()}]`
  const markerRegex = /feature cards \[hmr-smoke:[^\]]+\]/g

  let updatedContent = currentContent
  if (markerRegex.test(currentContent)) {
    updatedContent = currentContent.replace(markerRegex, markerValue)
  }
  else if (currentContent.includes('feature cards')) {
    updatedContent = currentContent.replace('feature cards', markerValue)
  }
  else {
    throw new Error(`Cannot find trigger token "feature cards" in ${path.relative(cwd, file)}`)
  }

  await fs.writeFile(file, updatedContent, 'utf8')
  console.log(`[hmr-smoke] touched ${path.relative(cwd, file)} to trigger incremental compile`)
}

async function waitForDirMtimeBump(dir, beforeMtime, timeout) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeout) {
    const currentMtime = await getLatestMtimeMs(dir)
    if (currentMtime > beforeMtime) {
      console.log('[hmr-smoke] platform artifacts updated')
      return
    }
    await sleep(500)
  }
  throw new Error(`Timed out waiting for incremental rebuild under ${path.relative(cwd, dir)}`)
}

async function getLatestMtimeMs(dir) {
  if (!existsSync(dir)) {
    return 0
  }

  let latest = 0
  const stack = [dir]

  while (stack.length > 0) {
    const current = stack.pop()
    const entries = await fs.readdir(current, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }
      const stat = await fs.stat(fullPath)
      if (stat.mtimeMs > latest) {
        latest = stat.mtimeMs
      }
    }
  }

  return latest
}

async function restoreTargetFile() {
  if (!originalTargetContent)
    return

  try {
    await fs.writeFile(targetVueFile, originalTargetContent, 'utf8')
  }
  catch (error) {
    console.error(`[hmr-smoke] failed to restore ${path.relative(cwd, targetVueFile)}:`, error)
  }
}

async function stopDevProcess() {
  if (!devProcess || devProcess.killed)
    return

  devProcess.kill('SIGTERM')
  await waitForExit(devProcess, 8000)

  if (devProcess.exitCode === null) {
    devProcess.kill('SIGKILL')
    await waitForExit(devProcess, 3000)
  }
}

function waitForExit(child, timeout) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout)
    child.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

function parseArgs(rawArgs) {
  const parsed = {}

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index]
    if (!arg.startsWith('--') || arg === '--') {
      continue
    }
    const key = arg.slice(2)
    const value = rawArgs[index + 1]
    if (!value || value.startsWith('--')) {
      parsed[key] = true
      continue
    }
    parsed[key] = value
    index += 1
  }

  return parsed
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function fail(message) {
  throw new Error(message)
}
