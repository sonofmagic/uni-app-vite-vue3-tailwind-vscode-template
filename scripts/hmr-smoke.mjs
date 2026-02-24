#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
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
const targetVueFile = path.join(cwd, 'src', 'components', 'sections', 'ExperienceLab.vue')
const componentRelativeDir = path.join('components', 'sections')
const componentName = 'ExperienceLab'

const baselineExpectedColorSnippets = [
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

const arbitraryMutationSteps = [
  {
    name: 'add-arbitrary-values',
    scriptColors: ['bg-[#123435]', 'bg-[#987abc]'],
    templateClasses: ['bg-[#a1b2c3]', 'px-[432.43px]'],
    verifyOldStyleRemoved: false,
  },
  {
    name: 'modify-arbitrary-values',
    scriptColors: ['bg-[#0f0f0f]', 'bg-[#fedcba]'],
    templateClasses: ['bg-[#112233]', 'px-[256.25px]'],
    verifyOldStyleRemoved: true,
  },
  {
    name: 'delete-arbitrary-values',
    scriptColors: [],
    templateClasses: [],
    verifyOldStyleRemoved: false,
  },
]

const allRawArbitraryTokens = Array.from(new Set(
  arbitraryMutationSteps.flatMap(step => [...step.scriptColors, ...step.templateClasses]),
))

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
  const componentArtifacts = await waitForComponentArtifacts(distPlatformDir, timeoutMs)
  console.log(`[hmr-smoke] style file: ${path.relative(cwd, styleFile)}`)
  console.log(`[hmr-smoke] component js: ${path.relative(cwd, componentArtifacts.jsFile)}`)
  console.log(`[hmr-smoke] component template: ${path.relative(cwd, componentArtifacts.templateFile)}`)

  await waitForExpectedSnippets(styleFile, baselineExpectedColorSnippets, timeoutMs, 'initial build')
  await runArbitraryMutationLoop({
    styleFile,
    componentJsFile: componentArtifacts.jsFile,
    componentTemplateFile: componentArtifacts.templateFile,
  })
  console.log('[hmr-smoke] PASS')
}

async function runArbitraryMutationLoop({
  styleFile,
  componentJsFile,
  componentTemplateFile,
}) {
  let previousStyleSnippets = []

  for (const step of arbitraryMutationSteps) {
    const nextContent = buildExperienceLabContent(originalTargetContent, step)
    const beforeDirMtime = await getLatestMtimeMs(distPlatformDir)
    await fs.writeFile(targetVueFile, nextContent, 'utf8')
    console.log(`[hmr-smoke] step=${step.name}: wrote ${path.relative(cwd, targetVueFile)}`)

    await waitForDirMtimeBump(distPlatformDir, beforeDirMtime, timeoutMs)

    const currentStyleSnippets = getArbitraryStyleSnippets(step)
    if (currentStyleSnippets.length > 0) {
      await waitForExpectedSnippets(
        styleFile,
        currentStyleSnippets,
        timeoutMs,
        `${step.name}: style snippets present`,
      )
    }

    if (step.verifyOldStyleRemoved && previousStyleSnippets.length > 0) {
      await waitForFileNotContains(
        styleFile,
        previousStyleSnippets,
        timeoutMs,
        `${step.name}: previous style snippets removed`,
      )
    }

    await waitForFileNotContains(
      componentJsFile,
      allRawArbitraryTokens,
      timeoutMs,
      `${step.name}: js token transform`,
    )
    await waitForFileNotContains(
      componentTemplateFile,
      allRawArbitraryTokens,
      timeoutMs,
      `${step.name}: template token transform`,
    )

    previousStyleSnippets = currentStyleSnippets
  }
}

function runDevScript(scriptName) {
  const isWindows = process.platform === 'win32'
  const spawnArgs = isWindows
    ? ['cmd.exe', ['/d', '/s', '/c', `pnpm run ${scriptName}`]]
    : ['pnpm', ['run', scriptName]]

  const child = spawn(spawnArgs[0], spawnArgs[1], {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
    detached: !isWindows,
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
  child.on('error', (error) => {
    console.error(`[hmr-smoke] dev process spawn error: ${error.message}`)
  })

  return child
}

async function waitForComponentArtifacts(platformDir, timeout) {
  const startedAt = Date.now()
  const componentDir = path.join(platformDir, componentRelativeDir)
  const templateExtensions = ['.wxml', '.axml', '.swan', '.ttml', '.qml', '.jxml']

  while (Date.now() - startedAt < timeout) {
    if (existsSync(componentDir)) {
      const files = await fs.readdir(componentDir)
      const jsName = `${componentName}.js`
      const templateName = templateExtensions
        .map(ext => `${componentName}${ext}`)
        .find(name => files.includes(name))

      if (files.includes(jsName) && templateName) {
        return {
          jsFile: path.join(componentDir, jsName),
          templateFile: path.join(componentDir, templateName),
        }
      }
    }
    await sleep(700)
  }

  throw new Error(
    `Timed out waiting component artifacts under ${path.relative(cwd, path.join(platformDir, componentRelativeDir))}`,
  )
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
  if (snippets.length === 0)
    return

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

async function waitForFileNotContains(file, snippets, timeout, phase) {
  if (snippets.length === 0)
    return

  const startedAt = Date.now()
  while (Date.now() - startedAt < timeout) {
    const content = await fs.readFile(file, 'utf8')
    const hit = snippets.filter(snippet => content.includes(snippet))
    if (hit.length === 0) {
      console.log(`[hmr-smoke] ${phase}: no raw token/snippet hit`)
      return
    }
    await sleep(700)
  }

  const content = await fs.readFile(file, 'utf8')
  const hit = snippets.filter(snippet => content.includes(snippet))
  throw new Error(
    `${phase}: still contains ${hit.length} snippets, file=${path.relative(cwd, file)}, firstHit=${hit[0]}\n` +
    `content length=${content.length}`,
  )
}

function buildExperienceLabContent(originalContent, step) {
  const withScript = applyScriptColorMutation(originalContent, step.scriptColors)
  const withTemplate = applyTemplateClassMutation(withScript, step.templateClasses)
  return withTemplate
}

function applyScriptColorMutation(content, extraColors) {
  const regex = /const buttonColors = \[(?<body>[\s\S]*?)\n\]\nconst buttonPalette =/
  const match = content.match(regex)
  if (!match || typeof match.index !== 'number' || !match.groups) {
    throw new Error('Cannot locate "buttonColors" array block in ExperienceLab.vue')
  }

  const body = match.groups.body
  const extraLines = extraColors.map(color => `  '${color}',`).join('\n')
  const nextBody = extraLines.length > 0 ? `${body}\n${extraLines}` : body
  const replacement = `const buttonColors = [${nextBody}\n]\nconst buttonPalette =`
  return content.replace(regex, replacement)
}

function applyTemplateClassMutation(content, extraClasses) {
  const token = '<view class="test">'
  if (!content.includes(token)) {
    throw new Error('Cannot locate template marker "<view class=\\"test\\">" in ExperienceLab.vue')
  }

  if (extraClasses.length === 0) {
    return content
  }

  return content.replace(token, `<view class="test ${extraClasses.join(' ')}">`)
}

function getArbitraryStyleSnippets(step) {
  const snippets = []
  const tokens = [...step.scriptColors, ...step.templateClasses]

  for (const token of tokens) {
    const bgValue = getArbitraryValue(token, 'bg')
    if (bgValue && /^#[0-9a-fA-F]{6}$/.test(bgValue)) {
      snippets.push(hexToRgbaSnippet(bgValue))
      continue
    }

    const pxValue = getArbitraryValue(token, 'px')
    if (pxValue) {
      snippets.push(pxValue)
    }
  }

  return Array.from(new Set(snippets))
}

function getArbitraryValue(token, prefix) {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = token.match(new RegExp(`^${escapedPrefix}-\\[(.+)\\]$`))
  return match ? match[1] : null
}

function hexToRgbaSnippet(hexColor) {
  const normalized = hexColor.slice(1)
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, var(--tw-bg-opacity, 1))`
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

  terminateDev('SIGTERM')
  await waitForExit(devProcess, 8000)

  if (devProcess.exitCode === null) {
    terminateDev('SIGKILL')
    await waitForExit(devProcess, 3000)
  }
}

function terminateDev(signal) {
  if (!devProcess)
    return

  const isWindows = process.platform === 'win32'
  if (isWindows) {
    if (typeof devProcess.pid === 'number') {
      // Ensure watchers started by pnpm/uni are also terminated on Windows.
      spawnSync('taskkill', ['/PID', String(devProcess.pid), '/T', '/F'], {
        stdio: 'ignore',
      })
    }
    devProcess.kill(signal)
    return
  }

  if (typeof devProcess.pid === 'number') {
    try {
      process.kill(-devProcess.pid, signal)
      return
    }
    catch {
      // fallback for environments without process group support
    }
  }

  devProcess.kill(signal)
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
