import { defineEventHandler, getHeaders, getRequestURL } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)
  const userAgent = headers['user-agent'] || ''
  
  const isFacebookCrawler = userAgent.includes('facebookexternalhit') || 
                            userAgent.includes('Facebot') ||
                            userAgent.includes('facebookcatalog')
  
  if (!isFacebookCrawler) {
    return
  }

  const config = useRuntimeConfig()
  const seoConfig = config.public?.seo || {}
  const ogImageConfig = seoConfig.ogImage || {}
  
  if (!ogImageConfig.enabled) {
    return
  }

  const url = getRequestURL(event)
  const path = url.pathname
  
  if (path === '/api/og' || path.startsWith('/_nuxt/') || path.startsWith('/api/')) {
    return
  }

  const host = headers.host || headers['x-forwarded-host'] || ''
  const protocol = headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https')
  const ogImageUrl = `${protocol}://${host}/api/og?path=${encodeURIComponent(path)}`
  
  try {
    if (typeof fetch !== 'undefined') {
      fetch(ogImageUrl, { 
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
        }
      }).catch(() => {
      })
    } else {
      const { default: fetch } = await import('node-fetch')
      fetch(ogImageUrl, {
        headers: {
          'User-Agent': userAgent,
        }
      }).catch(() => {
      })
    }
  } catch {
  }
})

