import type { OutputBundle, OutputOptions } from 'rollup'
import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { compile } from 'tailwindcss'
import { createContext } from 'weapp-tailwindcss/core'

type UniPlatform = string

interface PagesJson {
  subPackages?: {
    root: string
    pages?: {
      path: string
    }[]
  }[]
}

interface SubpackageTailwindEntry {
  root: string
  sourceEntry: string
  outputEntry: string
  sourceFiles: string[]
}

export interface AutoImportSubpackageTailwindOptions {
  platform?: UniPlatform
  root?: string
  srcDir?: string
  pagesJson?: PagesJson
  rem2rpx?: boolean
}

interface CollectSubpackageTailwindImportsOptions {
  pagesJson: PagesJson
  root: string
  srcDir: string
  styleExt: string
}

export const miniProgramStyleExtMap: Record<string, string> = {
  'mp-alipay': '.acss',
  'mp-baidu': '.css',
  'mp-harmony': '.css',
  'mp-jd': '.jxss',
  'mp-kuaishou': '.css',
  'mp-lark': '.ttss',
  'mp-qq': '.qss',
  'mp-toutiao': '.ttss',
  'mp-weixin': '.wxss',
  'mp-xhs': '.css',
}

export function normalizePath(file: string) {
  return file.split(path.sep).join('/')
}

export function getMiniProgramStyleExt(platform = process.env.UNI_PLATFORM) {
  return platform ? miniProgramStyleExtMap[platform] : undefined
}

export function stripJsonComments(source: string) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function readPagesJson(root: string, srcDir: string): PagesJson {
  const source = fs.readFileSync(path.resolve(root, srcDir, 'pages.json'), 'utf8')
  return JSON.parse(stripJsonComments(source)) as PagesJson
}

export function collectSubpackageTailwindImports({
  pagesJson,
  root: projectRoot,
  srcDir,
  styleExt,
}: CollectSubpackageTailwindImportsOptions) {
  const pageWxssImports = new Map<string, string>()
  const subpackageEntries: SubpackageTailwindEntry[] = []

  for (const subpackage of pagesJson.subPackages ?? []) {
    const subpackageRoot = subpackage.root.replace(/^\/|\/$/g, '')
    const tailwindFile = `${subpackageRoot}/tailwind${styleExt}`
    const sourceFiles: string[] = []

    for (const page of subpackage.pages ?? []) {
      const pageWxssFile = `${subpackageRoot}/${page.path}${styleExt}`
      const importPath = normalizePath(path.relative(path.posix.dirname(pageWxssFile), tailwindFile))
      const normalizedImportPath = importPath.startsWith('.') ? importPath : `./${importPath}`

      pageWxssImports.set(pageWxssFile, normalizedImportPath)
      sourceFiles.push(path.resolve(projectRoot, srcDir, subpackageRoot, `${page.path}.vue`))
    }

    subpackageEntries.push({
      root: subpackageRoot,
      sourceEntry: path.resolve(projectRoot, srcDir, subpackageRoot, 'tailwind.css'),
      outputEntry: tailwindFile,
      sourceFiles,
    })
  }

  return {
    pageWxssImports,
    subpackageEntries,
  }
}

export function extractTailwindCandidates(source: string) {
  return [...new Set(source.match(/[\w:/!.[\]()%#,-]+/g) ?? [])]
}

export async function compileSubpackageTailwind(entry: SubpackageTailwindEntry, rem2rpx: boolean) {
  const css = fs.readFileSync(entry.sourceEntry, 'utf8')
  const source = entry.sourceFiles.map(file => fs.readFileSync(file, 'utf8')).join('\n')
  const candidates = extractTailwindCandidates(source)
  const compiler = await compile(css, {
    from: entry.sourceEntry,
    base: path.dirname(entry.sourceEntry),
    async loadStylesheet(id, base) {
      const file = id === 'tailwindcss' ? path.resolve('node_modules/tailwindcss/index.css') : path.resolve(base, id)

      return {
        base: path.dirname(file),
        content: fs.readFileSync(file, 'utf8'),
      }
    },
    async loadModule(id, base) {
      const mod = await import(id.startsWith('.') ? path.resolve(base, id) : id)

      return {
        base,
        module: mod.default ?? mod,
      }
    },
  })
  const generated = compiler.build(candidates)
  const context = createContext({
    cssEntries: [entry.sourceEntry],
    rem2rpx,
  })
  const result = await context.transformWxss(generated, {
    file: entry.sourceEntry,
  })

  return result.css
}

export function prependSubpackageTailwindImports(
  bundle: OutputBundle,
  pageWxssImports: Map<string, string>,
  styleExt: string,
) {
  for (const [fileName, chunk] of Object.entries(bundle)) {
    if (chunk.type !== 'asset' || !fileName.endsWith(styleExt)) {
      continue
    }

    const importPath = pageWxssImports.get(normalizePath(fileName))

    if (!importPath) {
      continue
    }

    const importRule = `@import "${importPath}";`
    const source = typeof chunk.source === 'string' ? chunk.source : chunk.source.toString()

    if (!source.includes(importRule)) {
      chunk.source = source.length > 0 ? `${importRule}\n${source}` : `${importRule}\n`
    }
  }
}

export function upsertAsset(bundle: OutputBundle, fileName: string, source: string) {
  const asset = bundle[fileName]

  if (asset?.type !== 'asset') {
    return false
  }

  asset.source = source

  return true
}

export function resolveOutputDir(options: OutputOptions) {
  if (options.dir) {
    return options.dir
  }

  if (options.file) {
    return path.dirname(options.file)
  }

  return process.env.UNI_OUTPUT_DIR
}

export function writeGeneratedSubpackageTailwindAssets(outputDir: string | undefined, sources: Map<string, string>) {
  if (!outputDir) {
    return
  }

  for (const [fileName, source] of sources) {
    const outputFile = path.resolve(outputDir, fileName)

    fs.mkdirSync(path.dirname(outputFile), { recursive: true })
    fs.writeFileSync(outputFile, source)
  }
}

export function autoImportSubpackageTailwind(options: AutoImportSubpackageTailwindOptions = {}): Plugin {
  const root = options.root ?? process.cwd()
  const srcDir = options.srcDir ?? 'src'
  const platform = options.platform ?? process.env.UNI_PLATFORM
  const styleExt = getMiniProgramStyleExt(platform)
  const rem2rpx = options.rem2rpx ?? true
  const generatedSources = new Map<string, string>()

  return {
    name: 'auto-import-subpackage-tailwind',
    enforce: 'post' as const,
    async generateBundle(_options, bundle) {
      if (!styleExt) {
        return
      }

      const pagesJson = options.pagesJson ?? readPagesJson(root, srcDir)
      const { pageWxssImports, subpackageEntries } = collectSubpackageTailwindImports({
        pagesJson,
        root,
        srcDir,
        styleExt,
      })

      for (const entry of subpackageEntries) {
        const source = await compileSubpackageTailwind(entry, rem2rpx)

        generatedSources.set(entry.outputEntry, source)

        if (!upsertAsset(bundle, entry.outputEntry, source)) {
          this.emitFile({
            type: 'asset',
            fileName: entry.outputEntry,
            source,
          })
        }
      }

      prependSubpackageTailwindImports(bundle, pageWxssImports, styleExt)
    },
    writeBundle(outputOptions) {
      if (!styleExt) {
        return
      }

      writeGeneratedSubpackageTailwindAssets(resolveOutputDir(outputOptions), generatedSources)
    },
  }
}
