import type { OutputBundle, OutputOptions } from 'rollup'
import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { compile } from 'tailwindcss'
import { createContext } from 'weapp-tailwindcss/core'

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
  root?: string
  srcDir?: string
  pagesJson?: PagesJson
  rem2rpx?: boolean
}

interface CollectSubpackageTailwindImportsOptions {
  bundle: OutputBundle
  pagesJson: PagesJson
  root: string
  srcDir: string
}

export function normalizePath(file: string) {
  return file.split(path.sep).join('/')
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

export function findGeneratedPageStyleFile(bundle: OutputBundle, pagePath: string) {
  const normalizedPagePath = normalizePath(pagePath)
  const candidates: string[] = []

  for (const [fileName, chunk] of Object.entries(bundle)) {
    const normalizedFileName = normalizePath(fileName)
    const ext = path.posix.extname(normalizedFileName)

    if (
      chunk.type === 'asset'
      && ext
      && ext !== '.json'
      && normalizedFileName === `${normalizedPagePath}${ext}`
    ) {
      candidates.push(normalizedFileName)
    }
  }

  return candidates.find((fileName) => {
    const asset = bundle[fileName]
    const source = asset?.type === 'asset' ? asset.source.toString().trimStart() : ''

    return source.length === 0 || (!source.startsWith('<') && !source.startsWith('{'))
  })
}

export function collectSubpackageTailwindImports({
  bundle,
  pagesJson,
  root: projectRoot,
  srcDir,
}: CollectSubpackageTailwindImportsOptions) {
  const pageStyleImports = new Map<string, string>()
  const subpackageEntries: SubpackageTailwindEntry[] = []

  for (const subpackage of pagesJson.subPackages ?? []) {
    const subpackageRoot = subpackage.root.replace(/^\/|\/$/g, '')
    const sourceFiles = (subpackage.pages ?? []).map(page =>
      path.resolve(projectRoot, srcDir, subpackageRoot, `${page.path}.vue`),
    )
    const styleExts = new Set<string>()

    for (const page of subpackage.pages ?? []) {
      const pageStyleFile = findGeneratedPageStyleFile(bundle, `${subpackageRoot}/${page.path}`)

      if (!pageStyleFile) {
        continue
      }

      const styleExt = path.posix.extname(pageStyleFile)
      const tailwindFile = `${subpackageRoot}/tailwind${styleExt}`
      const importPath = normalizePath(path.relative(path.posix.dirname(pageStyleFile), tailwindFile))
      const normalizedImportPath = importPath.startsWith('.') ? importPath : `./${importPath}`

      pageStyleImports.set(pageStyleFile, normalizedImportPath)
      styleExts.add(styleExt)
    }

    for (const styleExt of styleExts) {
      subpackageEntries.push({
        root: subpackageRoot,
        sourceEntry: path.resolve(projectRoot, srcDir, subpackageRoot, 'tailwind.css'),
        outputEntry: `${subpackageRoot}/tailwind${styleExt}`,
        sourceFiles,
      })
    }
  }

  return {
    pageStyleImports,
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
  pageStyleImports: Map<string, string>,
) {
  for (const [fileName, chunk] of Object.entries(bundle)) {
    if (chunk.type !== 'asset') {
      continue
    }

    const importPath = pageStyleImports.get(normalizePath(fileName))

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
  const rem2rpx = options.rem2rpx ?? true
  const generatedSources = new Map<string, string>()

  return {
    name: 'auto-import-subpackage-tailwind',
    enforce: 'post' as const,
    async generateBundle(_options, bundle) {
      const pagesJson = options.pagesJson ?? readPagesJson(root, srcDir)
      const { pageStyleImports, subpackageEntries } = collectSubpackageTailwindImports({
        bundle,
        pagesJson,
        root,
        srcDir,
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

      prependSubpackageTailwindImports(bundle, pageStyleImports)
    },
    writeBundle(outputOptions) {
      writeGeneratedSubpackageTailwindAssets(resolveOutputDir(outputOptions), generatedSources)
    },
  }
}
