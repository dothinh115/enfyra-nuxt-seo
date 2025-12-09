import { defineNuxtModule, addImportsDir, addServerHandler, createResolver } from '@nuxt/kit'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { SEOConfig, OgImageConfig, WebManifestConfig } from './types'

export interface ModuleOptions extends Partial<SEOConfig> {
  enabled?: boolean
  siteUrl?: string
  siteName?: string
  defaultLocale?: string
  defaultImage?: string
  defaultType?: 'website' | 'article' | 'product' | 'profile'
  pages?: Record<string, Partial<SEOConfig & { changefreq?: string; priority?: number; lastmod?: string }>>
  robots?: {
    enabled?: boolean
    disallow?: string[]
    sitemap?: boolean
    sitemapPath?: string
  }
  social?: {
    twitter?: {
      site?: string
      creator?: string
    }
    facebook?: {
      appId?: string
    }
  }
  ogImage?: OgImageConfig
  webmanifest?: WebManifestConfig
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@enfyra/nuxt-seo',
    version: '0.1.14',
    configKey: 'seo',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },
  defaults: {
    enabled: true,
    siteUrl: '',
    siteName: '',
    defaultLocale: 'en',
    defaultImage: '',
    defaultType: 'website',
    robots: {
      enabled: true,
      disallow: ['/api/', '/admin/'],
      sitemap: true,
      sitemapPath: '/sitemap.xml',
    },
    ogImage: {
      enabled: false,
      viewport: {
        width: 1440,
        height: 754,
      },
      quality: 85,
      format: 'webp',
      cache: {
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        memoryTtl: 60 * 60 * 1000, // 1 hour
      },
    },
  },
  setup(options: ModuleOptions, nuxt: any) {
    // When built, import.meta.url points to dist/module.mjs
    // We need to resolve from package root, so go up one level from dist
    const currentFile = fileURLToPath(import.meta.url)
    const currentDir = dirname(currentFile)
    // If we're in dist/, go up to package root
    const packageRoot = currentDir.endsWith('/dist') || currentDir.endsWith('\\dist')
      ? dirname(currentDir)
      : currentDir
    const { resolve } = createResolver(packageRoot)
    
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    ;(nuxt.options.runtimeConfig.public as any).seo = {
      enabled: options.enabled ?? true,
      siteUrl: options.siteUrl || '',
      siteName: options.siteName || '',
      defaultLocale: options.defaultLocale || 'en',
      defaultImage: options.defaultImage || '',
      defaultType: options.defaultType || 'website',
      pages: options.pages || {},
      social: options.social || {},
      robots: {
        enabled: options.robots?.enabled !== false,
        disallow: options.robots?.disallow || ['/api/', '/admin/'],
        sitemap: options.robots?.sitemap !== false,
        sitemapPath: options.robots?.sitemapPath || '/sitemap.xml',
      },
      ogImage: {
        enabled: options.ogImage?.enabled ?? false,
        viewport: {
          width: options.ogImage?.viewport?.width ?? 1440,
          height: options.ogImage?.viewport?.height ?? 754,
        },
        quality: options.ogImage?.quality ?? 85,
        format: options.ogImage?.format ?? 'webp',
        cache: {
          ttl: options.ogImage?.cache?.ttl ?? 24 * 60 * 60 * 1000,
          memoryTtl: options.ogImage?.cache?.memoryTtl ?? 60 * 60 * 1000,
        },
      },
      webmanifest: options.webmanifest || {},
    }

    // Resolve from package root to src/composables
    addImportsDir(resolve('./src/composables'))
    
    nuxt.hook('prepare:types', ({ declarations, references }: any) => {
      references.push({
        path: resolve('./src/types/nuxt-imports.d.ts'),
      })
      
      declarations.push(`
declare global {
  const usePageSEO: typeof import('@enfyra/nuxt-seo/src/composables/usePageSEO').usePageSEO
  const useSEO: typeof import('@enfyra/nuxt-seo/src/composables/useSEO').useSEO
}
      `)
    })

    nuxt.hook('components:dirs', (dirs: any[]) => {
      dirs.push({
        path: resolve('./src/components'),
        pathPrefix: false,
        global: false,
      })
    })

    if (options.robots?.enabled !== false) {
      addServerHandler({
        route: '/robots.txt',
        handler: '@enfyra/nuxt-seo/src/server/routes/robots.ts',
      })
    }

    if (options.robots?.sitemap !== false) {
      addServerHandler({
        route: options.robots?.sitemapPath || '/sitemap.xml',
        handler: '@enfyra/nuxt-seo/src/server/routes/sitemap.ts',
      })
    }

    // Add webmanifest handler to prevent 404 errors
    addServerHandler({
      route: '/site.webmanifest',
      handler: '@enfyra/nuxt-seo/src/server/routes/webmanifest.ts',
    })

    // Add OG image generation handler if enabled
    if (options.ogImage?.enabled) {
      addServerHandler({
        route: '/api/og',
        handler: '@enfyra/nuxt-seo/src/server/routes/og.ts',
      })
    }
  },
})

