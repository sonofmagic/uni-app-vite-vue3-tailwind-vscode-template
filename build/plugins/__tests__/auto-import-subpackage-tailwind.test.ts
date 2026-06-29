import type { OutputBundle } from 'rollup'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  autoImportSubpackageTailwind,
  collectSubpackageTailwindImports,
  getMiniProgramStyleExt,
  miniProgramStyleExtMap,
  prependSubpackageTailwindImports,
  resolveOutputDir,
  upsertAsset,
  writeGeneratedSubpackageTailwindAssets,
} from '../auto-import-subpackage-tailwind'

const pagesJson = {
  subPackages: [
    {
      root: 'package-basic',
      pages: [
        { path: 'pages/home/index' },
        { path: 'pages/detail/index' },
      ],
    },
    {
      root: '/package-isolated/',
      pages: [
        { path: 'pages/home/index' },
      ],
    },
  ],
}

function createAsset(source: string): OutputBundle[string] {
  return {
    fileName: 'index.wxss',
    name: 'index.wxss',
    source,
    type: 'asset',
  }
}

describe('autoImportSubpackageTailwind platform support', () => {
  it('resolves the style extension for every mini program platform in this project', () => {
    expect(miniProgramStyleExtMap).toEqual({
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
    })

    for (const platform of Object.keys(miniProgramStyleExtMap)) {
      expect(getMiniProgramStyleExt(platform)).toBe(miniProgramStyleExtMap[platform])
    }
  })

  it('does nothing for h5 and other non-mini-program platforms', async () => {
    const plugin = autoImportSubpackageTailwind({
      pagesJson,
      platform: 'h5',
      root: '/project',
    })
    const bundle: OutputBundle = {
      'assets/index.css': createAsset('.page{}'),
    }
    const emitFile = vi.fn()

    await plugin.generateBundle?.call({ emitFile } as never, {} as never, bundle, false)

    expect(emitFile).not.toHaveBeenCalled()
    expect(bundle['assets/index.css']).toMatchObject({
      source: '.page{}',
    })
  })
})

describe('autoImportSubpackageTailwind subpackage collection', () => {
  it('collects subpackage tailwind files and page import paths for mp-weixin', () => {
    const { pageWxssImports, subpackageEntries } = collectSubpackageTailwindImports({
      pagesJson,
      root: '/project',
      srcDir: 'src',
      styleExt: '.wxss',
    })

    expect(pageWxssImports.get('package-basic/pages/home/index.wxss')).toBe('../../tailwind.wxss')
    expect(pageWxssImports.get('package-basic/pages/detail/index.wxss')).toBe('../../tailwind.wxss')
    expect(pageWxssImports.get('package-isolated/pages/home/index.wxss')).toBe('../../tailwind.wxss')
    expect(subpackageEntries).toEqual([
      {
        root: 'package-basic',
        sourceEntry: '/project/src/package-basic/tailwind.css',
        outputEntry: 'package-basic/tailwind.wxss',
        sourceFiles: [
          '/project/src/package-basic/pages/home/index.vue',
          '/project/src/package-basic/pages/detail/index.vue',
        ],
      },
      {
        root: 'package-isolated',
        sourceEntry: '/project/src/package-isolated/tailwind.css',
        outputEntry: 'package-isolated/tailwind.wxss',
        sourceFiles: [
          '/project/src/package-isolated/pages/home/index.vue',
        ],
      },
    ])
  })

  it('uses each mini program platform style extension', () => {
    const { pageWxssImports, subpackageEntries } = collectSubpackageTailwindImports({
      pagesJson,
      root: '/project',
      srcDir: 'src',
      styleExt: '.acss',
    })

    expect(pageWxssImports.get('package-basic/pages/home/index.acss')).toBe('../../tailwind.acss')
    expect(subpackageEntries[0].outputEntry).toBe('package-basic/tailwind.acss')
  })
})

describe('prependSubpackageTailwindImports', () => {
  it('prepends imports only to matched page style assets', () => {
    const bundle: OutputBundle = {
      'package-basic/pages/home/index.wxss': createAsset('.home{}'),
      'package-basic/pages/other/index.wxss': createAsset('.other{}'),
      'package-basic/pages/home/index.js': {
        code: 'Page({})',
        fileName: 'index.js',
        imports: [],
        importedBindings: {},
        isDynamicEntry: false,
        isEntry: false,
        isImplicitEntry: false,
        moduleIds: [],
        modules: {},
        name: 'index',
        referencedFiles: [],
        type: 'chunk',
        dynamicImports: [],
        exports: [],
        facadeModuleId: null,
        implicitlyLoadedBefore: [],
        map: null,
        preliminaryFileName: 'index.js',
        sourcemapFileName: null,
      },
    }

    prependSubpackageTailwindImports(
      bundle,
      new Map([
        ['package-basic/pages/home/index.wxss', '../../tailwind.wxss'],
      ]),
      '.wxss',
    )

    expect(bundle['package-basic/pages/home/index.wxss']).toMatchObject({
      source: '@import "../../tailwind.wxss";\n.home{}',
    })
    expect(bundle['package-basic/pages/other/index.wxss']).toMatchObject({
      source: '.other{}',
    })
  })

  it('does not duplicate an existing runtime import', () => {
    const bundle: OutputBundle = {
      'package-basic/pages/home/index.wxss': createAsset('@import "../../tailwind.wxss";\n.home{}'),
    }

    prependSubpackageTailwindImports(
      bundle,
      new Map([
        ['package-basic/pages/home/index.wxss', '../../tailwind.wxss'],
      ]),
      '.wxss',
    )

    expect(bundle['package-basic/pages/home/index.wxss']).toMatchObject({
      source: '@import "../../tailwind.wxss";\n.home{}',
    })
  })
})

describe('upsertAsset', () => {
  it('overwrites an existing css platform tailwind asset instead of leaving an empty file', () => {
    const bundle: OutputBundle = {
      'package-basic/tailwind.css': createAsset(''),
    }

    expect(upsertAsset(bundle, 'package-basic/tailwind.css', '.generated{}')).toBe(true)
    expect(bundle['package-basic/tailwind.css']).toMatchObject({
      source: '.generated{}',
    })
  })

  it('returns false when the asset is not already in the bundle', () => {
    expect(upsertAsset({}, 'package-basic/tailwind.wxss', '.generated{}')).toBe(false)
  })
})

describe('writeGeneratedSubpackageTailwindAssets', () => {
  it('writes generated tailwind assets into nested output paths', () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'subpackage-tailwind-'))

    writeGeneratedSubpackageTailwindAssets(
      outputDir,
      new Map([
        ['package-basic/tailwind.css', '.generated{}'],
      ]),
    )

    expect(fs.readFileSync(path.join(outputDir, 'package-basic/tailwind.css'), 'utf8')).toBe('.generated{}')
  })

  it('resolves rollup output directories', () => {
    expect(resolveOutputDir({ dir: '/project/dist' })).toBe('/project/dist')
    expect(resolveOutputDir({ file: '/project/dist/app.js' })).toBe('/project/dist')
  })
})
