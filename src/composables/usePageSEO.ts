import { useRuntimeConfig, useRoute, computed } from '#imports'
import { useSEO } from './useSEO'
import type { SEOConfig } from '../types'

export const usePageSEO = (pageConfig: Partial<SEOConfig> | (() => Partial<SEOConfig>) = {}) => {
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = (runtimeConfig.public || {}) as any
  const seoConfig = publicConfig.seo || {}
  const route = useRoute()
  
  const mergedConfig = computed(() => {
    const currentPath = String(route.path || '')
    const pages = seoConfig.pages || {}
    const pageConfigFromNuxt = (pages[currentPath] || {}) as Partial<SEOConfig>
    const defaultUrl = seoConfig.siteUrl ? `${String(seoConfig.siteUrl)}${currentPath}` : currentPath
    
    const getPageConfig = typeof pageConfig === 'function' ? pageConfig() : pageConfig
    const finalUrl = getPageConfig.url || pageConfigFromNuxt.url || defaultUrl
    
    const pageConfigFromNuxtSafe = pageConfigFromNuxt ? JSON.parse(JSON.stringify(pageConfigFromNuxt)) : {}
    const pageConfigSafe = getPageConfig ? JSON.parse(JSON.stringify(getPageConfig)) : {}
    
    return {
      siteName: String(seoConfig.siteName || ''),
      locale: String(seoConfig.defaultLocale || 'en'),
      type: (seoConfig.defaultType || 'website') as 'website' | 'article' | 'product' | 'profile',
      image: String(seoConfig.defaultImage || ''),
      url: String(finalUrl),
      ...pageConfigFromNuxtSafe,
      ...pageConfigSafe,
    } as SEOConfig
  })
  
  const result = useSEO(() => mergedConfig.value)
  
  return {
    meta: result.meta,
    structuredData: result.structuredData,
  }
}

