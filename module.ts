import { defineNuxtModule, addImportsDir, addServerHandler, createResolver } from '@nuxt/kit'
import type { SEOConfig } from './src/types'

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
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-seo',
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
  },
  setup(options: ModuleOptions, nuxt: any) {
    const metaUrl = (import.meta as any).url
    const { resolve } = createResolver(metaUrl)
    
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
    }

    addImportsDir(resolve('./src/composables'))

    nuxt.hook('components:dirs', (dirs: any[]) => {
      dirs.push({
        path: resolve('./src/components'),
        pathPrefix: false,
        global: false,
      })
    })

    if (options.robots?.enabled !== false) {
      const robotsPath = resolve('./src/server/routes/robots.js')
      addServerHandler({
        route: '/robots.txt',
        handler: robotsPath,
      })
    }

    if (options.robots?.sitemap !== false) {
      const sitemapPath = resolve('./src/server/routes/sitemap.js')
      addServerHandler({
        route: options.robots?.sitemapPath || '/sitemap.xml',
        handler: sitemapPath,
      })
    }
  },
})

