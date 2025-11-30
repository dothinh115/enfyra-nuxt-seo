import { useRuntimeConfig, useHead, computed } from '#imports'
import type { SEOConfig } from '../types'

export const useSEO = (config: SEOConfig | (() => SEOConfig)) => {
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = (runtimeConfig.public || {}) as any
  const seoConfig = publicConfig.seo || {}
  
  const getConfig = computed(() => {
    return typeof config === 'function' ? config() : config
  })
  
  const siteUrl = computed(() => getConfig.value.url || seoConfig.siteUrl || '')
  const defaultImage = seoConfig.defaultImage || ''
  const defaultSiteName = seoConfig.siteName || ''
  const defaultLocale = seoConfig.defaultLocale || 'en_US'
  
  const seoEnabled = seoConfig.enabled !== false
  
  const fullImageUrl = computed(() => {
    const image = getConfig.value.image
    if (image?.startsWith('http')) return image
    if (image) {
      return `${siteUrl.value}${image.startsWith('/') ? image : `/${image}`}`
    }
    if (defaultImage) {
      return `${siteUrl.value}${defaultImage.startsWith('/') ? defaultImage : `/${defaultImage}`}`
    }
    return ''
  })

  const shouldIndex = computed(() => seoEnabled && !getConfig.value.noindex)
  const shouldFollow = computed(() => seoEnabled && !getConfig.value.nofollow)

  useHead(() => {
    const currentConfig = getConfig.value
    const currentSiteUrl = siteUrl.value
    const currentFullImageUrl = fullImageUrl.value
    const currentShouldIndex = shouldIndex.value
    const currentShouldFollow = shouldFollow.value

    const metaArray: Array<{ name?: string; property?: string; content: string }> = [
      {
        name: 'description',
        content: currentConfig.description || '',
      },
    ]

    if (currentConfig.keywords && currentConfig.keywords.length > 0) {
      metaArray.push({
        name: 'keywords',
        content: currentConfig.keywords.join(', '),
      })
    }

    if (currentConfig.author) {
      metaArray.push({
        name: 'author',
        content: currentConfig.author,
      })
    }

    metaArray.push({
      name: 'robots',
      content: `${currentShouldIndex ? 'index' : 'noindex'}, ${currentShouldFollow ? 'follow' : 'nofollow'}`,
    })

    const ogType = currentConfig.type || seoConfig?.defaultType || 'website'
    const ogUrl = currentConfig.canonical || currentConfig.url || currentSiteUrl
    const ogSiteName = currentConfig.siteName || defaultSiteName
    const ogLocale = currentConfig.locale || defaultLocale

    metaArray.push(
      { property: 'og:title', content: currentConfig.title || '' },
      { property: 'og:description', content: currentConfig.description || '' },
      { property: 'og:type', content: ogType },
      { property: 'og:url', content: ogUrl },
      { property: 'og:site_name', content: ogSiteName },
      { property: 'og:locale', content: ogLocale }
    )

    if (currentFullImageUrl) {
      metaArray.push(
        { property: 'og:image', content: currentFullImageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: currentConfig.title || defaultSiteName }
      )
    }

    const twitterCard = 'summary_large_image'
    metaArray.push(
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: currentConfig.title || '' },
      { name: 'twitter:description', content: currentConfig.description || '' }
    )

    if (currentFullImageUrl) {
      metaArray.push(
        { name: 'twitter:image', content: currentFullImageUrl },
        { name: 'twitter:image:alt', content: currentConfig.title || defaultSiteName }
      )
    }

    const socialConfig = seoConfig.social || {}
    const twitterConfig = socialConfig.twitter || {}
    if (twitterConfig.site) {
      metaArray.push({ name: 'twitter:site', content: twitterConfig.site })
    }
    if (twitterConfig.creator) {
      metaArray.push({ name: 'twitter:creator', content: twitterConfig.creator })
    }

    if (ogType === 'article') {
      if (currentConfig.author) {
        metaArray.push({ property: 'article:author', content: currentConfig.author })
      }
      if (currentConfig.publishedTime) {
        metaArray.push({ property: 'article:published_time', content: currentConfig.publishedTime })
      }
      if (currentConfig.modifiedTime) {
        metaArray.push({ property: 'article:modified_time', content: currentConfig.modifiedTime })
      }
    }

    if (currentConfig.alternateLocales && currentConfig.alternateLocales.length > 0) {
      currentConfig.alternateLocales.forEach((locale: string) => {
        metaArray.push({ property: 'og:locale:alternate', content: locale })
      })
    }

    const linkArray = []
    if (currentConfig.canonical || currentConfig.url) {
      linkArray.push({
        rel: 'canonical',
        href: currentConfig.canonical || currentConfig.url || currentSiteUrl,
      })
    }

    const scriptArray = []
    if (currentConfig.structuredData) {
      scriptArray.push({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(currentConfig.structuredData),
      })
    }

    const allMeta: Record<string, any> = {
      title: currentConfig.title,
      description: currentConfig.description,
      keywords: currentConfig.keywords?.join(', '),
      author: currentConfig.author,
      robots: {
        index: currentShouldIndex,
        follow: currentShouldFollow,
      },
      'og:title': currentConfig.title || '',
      'og:description': currentConfig.description || '',
      'og:type': ogType,
      'og:url': ogUrl,
      'og:site_name': ogSiteName,
      'og:locale': ogLocale,
      'twitter:card': twitterCard,
      'twitter:title': currentConfig.title || '',
      'twitter:description': currentConfig.description || '',
    }

    if (currentFullImageUrl) {
      allMeta['og:image'] = currentFullImageUrl
      allMeta['og:image:width'] = '1200'
      allMeta['og:image:height'] = '630'
      allMeta['og:image:alt'] = currentConfig.title || defaultSiteName
      allMeta['twitter:image'] = currentFullImageUrl
      allMeta['twitter:image:alt'] = currentConfig.title || defaultSiteName
    }

    return {
      title: currentConfig.title || '',
      meta: metaArray,
      link: linkArray.length > 0 ? linkArray : undefined,
      script: scriptArray.length > 0 ? scriptArray : undefined,
    }
  })

  const safeMeta = computed(() => {
    const currentConfig = getConfig.value
    return {
      title: currentConfig.title,
      description: currentConfig.description,
      keywords: currentConfig.keywords?.join(', '),
    }
  })

  const safeStructuredData = computed(() => {
    const currentConfig = getConfig.value
    return currentConfig.structuredData 
      ? JSON.parse(JSON.stringify(currentConfig.structuredData))
      : undefined
  })

  return {
    meta: safeMeta.value as Record<string, any>,
    structuredData: safeStructuredData.value as Record<string, any> | undefined,
  }
}
