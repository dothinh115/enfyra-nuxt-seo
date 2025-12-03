# enfyra-nuxt-seo

A powerful SEO optimization tool for Nuxt 4 that provides comprehensive SEO features including meta tags, Open Graph, Twitter Cards, structured data, robots.txt, and sitemap generation.

Optimized by [Enfyra Team](https://enfyra.io).

## Features

- ✅ **Meta Tags**: Title, description, keywords, robots
- ✅ **Open Graph**: Full OG tags support for social media sharing
- ✅ **Twitter Cards**: Summary large image cards
- ✅ **Structured Data**: JSON-LD schema.org markup (Organization, Website, WebPage, Article, Product, etc.)
- ✅ **Robots.txt**: Dynamic generation with configurable rules
- ✅ **Sitemap.xml**: Automatic sitemap generation from page configurations
- ✅ **TypeScript**: Full TypeScript support with auto-imports
- ✅ **Per-page Configuration**: Configure SEO per page in `nuxt.config.ts` or runtime
- ✅ **Global Configuration**: Set defaults for all pages
- ✅ **Disable SEO**: Easy toggle for staging/testing environments

## Installation

```bash
npm install enfyra-nuxt-seo
# or
yarn add enfyra-nuxt-seo
# or
pnpm add enfyra-nuxt-seo
```

## Configuration

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['enfyra-nuxt-seo'],
  
  seo: {
    enabled: true, // Set to false to disable SEO (useful for staging)
    siteUrl: 'https://example.com',
    siteName: 'My Website',
    defaultLocale: 'en',
    defaultImage: '/og-image.png',
    defaultType: 'website', // 'website' | 'article' | 'product' | 'profile'
    
    // Per-page SEO configuration
    pages: {
      '/': {
        title: 'Homepage - My Website',
        description: 'Welcome to my website',
        keywords: ['keyword1', 'keyword2'],
        changefreq: 'daily',
        priority: 1.0,
        structuredData: {
          '@type': 'SoftwareApplication',
          name: 'My App',
          // ... more structured data
        }
      },
      '/about': {
        title: 'About Us',
        description: 'Learn more about our company',
        changefreq: 'monthly',
        priority: 0.8
      }
    },
    
    // Robots.txt configuration
    robots: {
      enabled: true,
      disallow: ['/api/', '/admin/'],
      sitemap: true,
      sitemapPath: '/sitemap.xml'
    },
    
    // Social media configuration
    social: {
      twitter: {
        site: '@yourhandle',
        creator: '@yourhandle'
      },
      facebook: {
        appId: 'your-app-id'
      }
    }
  }
})
```

## Usage

### Auto-imported Composables

The module automatically imports `usePageSEO` and `useSEO` composables. No manual imports needed!

### Basic Usage in Pages

```vue
<script setup lang="ts">
// Automatically uses config from nuxt.config.ts for current route
usePageSEO()
</script>

<template>
  <div>Your page content</div>
</template>
```

### Override SEO in Pages

```vue
<script setup lang="ts">
// Override with page-specific config
usePageSEO({
  title: 'Custom Page Title',
  description: 'Custom description for this page',
  keywords: ['custom', 'keywords'],
  image: '/custom-og-image.png'
})
</script>
```

### Advanced Usage with Structured Data

```vue
<script setup lang="ts">
usePageSEO({
  title: 'Article Title',
  description: 'Article description',
  type: 'article',
  publishedTime: '2024-01-01T00:00:00Z',
  modifiedTime: '2024-01-02T00:00:00Z',
  author: 'John Doe',
  structuredData: {
    '@type': 'Article',
    headline: 'Article Title',
    description: 'Article description',
    author: {
      '@type': 'Person',
      name: 'John Doe'
    },
    publisher: {
      '@type': 'Organization',
      name: 'My Website'
    }
  }
})
</script>
```

### Using `useSEO` Directly

```vue
<script setup lang="ts">
// For more control, use useSEO directly
const { meta, structuredData } = useSEO({
  title: 'Page Title',
  description: 'Page description',
  url: 'https://example.com/page',
  image: '/og-image.png',
  type: 'website'
})
</script>
```

### Reactive usage (using `computed` / state)

Both `usePageSEO` and `useSEO` accept either a **plain config object** or a **function that returns a config object**, so you can safely use reactive state/computed values.

```vue
<script setup lang="ts">
const article = computed(() => ({
  title: 'Article Title',
  description: 'Article description',
  image: '/article-og.png',
}))

// Option 1: Use a function to read reactive values each time (recommended)
usePageSEO(() => ({
  title: article.value.title,
  description: article.value.description,
  image: article.value.image,
  type: 'article',
}))

// Option 2: Use directly with useSEO
const { meta, structuredData } = useSEO(() => ({
  title: article.value.title,
  description: article.value.description,
  url: `https://example.com/blog/article`,
  image: article.value.image,
  type: 'article',
}))
</script>
```

## API Reference

### Module Options

```typescript
interface ModuleOptions {
  enabled?: boolean // Enable/disable SEO globally
  siteUrl?: string // Your site URL
  siteName?: string // Your site name
  defaultLocale?: string // Default locale (e.g., 'en', 'en_US')
  defaultImage?: string // Default OG image path
  defaultType?: 'website' | 'article' | 'product' | 'profile' // Default OG type
  pages?: Record<string, PageSEOConfig> // Per-page configuration
  robots?: RobotsConfig // Robots.txt configuration
  social?: SocialConfig // Social media configuration
}
```

### SEOConfig

```typescript
interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  siteName?: string
  locale?: string
  alternateLocales?: string[]
  noindex?: boolean
  nofollow?: boolean
  canonical?: string
  structuredData?: Record<string, any> | Record<string, any>[]
}
```

### PageSEOConfig

Extends `SEOConfig` with:

```typescript
interface PageSEOConfig extends SEOConfig {
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number // 0.0 to 1.0
  lastmod?: string // ISO date string
}
```

### Composables

#### `usePageSEO(pageConfig?: Partial<SEOConfig> | (() => Partial<SEOConfig>))`

Composable to set SEO for the current page. Automatically merges:
1. Global defaults from `nuxt.config.ts`
2. Per-page config from `nuxt.config.ts` (based on current route)
3. Runtime config passed to the composable (highest priority)

**Returns:** Result from `useSEO()`

**Example (static object):**
```typescript
usePageSEO({
  title: 'Custom Title',
  description: 'Custom Description',
})
```

**Example (reactive, using function):**
```typescript
const title = computed(() => `Blog - ${post.value.title}`)

usePageSEO(() => ({
  title: title.value,
  description: post.value.excerpt,
  image: post.value.image,
}))
```

#### `useSEO(config: SEOConfig | (() => SEOConfig))`

Core SEO composable that sets meta tags, Open Graph, Twitter Cards, and structured data.

**Returns:**
```typescript
{
  meta: Record<string, any>
  structuredData?: Record<string, any> | Record<string, any>[]
}
```

**Example:**
```typescript
const { meta, structuredData } = useSEO({
  title: 'Page Title',
  description: 'Page Description',
  url: 'https://example.com/page'
})
```

## Components

### SEOHead

Component for rendering structured data (JSON-LD).

```vue
<script setup lang="ts">
import { SEOHead } from 'enfyra-nuxt-seo/src/components/SEOHead'

const seoConfig = {
  title: 'Page Title',
  description: 'Page Description',
  structuredData: {
    '@type': 'WebPage',
    // ... more structured data
  }
}
</script>

<template>
  <SEOHead :config="seoConfig" />
</template>
```

### Breadcrumbs

Component for breadcrumb navigation with structured data.

```vue
<script setup lang="ts">
import { Breadcrumbs } from 'enfyra-nuxt-seo/src/components/Breadcrumbs'

const breadcrumbItems = [
  { name: 'Home', url: '/' },
  { name: 'Category', url: '/category' },
  { name: 'Current Page', url: '/category/page' }
]
</script>

<template>
  <Breadcrumbs :items="breadcrumbItems" />
</template>
```

## Server Routes

The module automatically generates:

### `/robots.txt`

Dynamically generated based on your configuration:

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
```

### `/sitemap.xml`

Automatically generated from your page configurations:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- More URLs -->
</urlset>
```

## TypeScript Support

The module provides full TypeScript support:

- ✅ Auto-imported composables (`usePageSEO`, `useSEO`)
- ✅ Type definitions for all interfaces
- ✅ Type-safe configuration in `nuxt.config.ts`
- ✅ IntelliSense support in your IDE

### Importing Types

```typescript
import type { SEOConfig, ModuleOptions } from 'enfyra-nuxt-seo'
```

## Examples

### Example 1: Basic Setup

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['enfyra-nuxt-seo'],
  seo: {
    enabled: true,
    siteUrl: 'https://example.com',
    siteName: 'My Website',
    defaultLocale: 'en',
    defaultImage: '/og-image.png'
  }
})
```

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
usePageSEO()
</script>
```

### Example 2: Article Page

```vue
<!-- pages/blog/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const article = await fetchArticle(route.params.slug)

usePageSEO({
  title: article.title,
  description: article.excerpt,
  type: 'article',
  publishedTime: article.publishedAt,
  modifiedTime: article.updatedAt,
  author: article.author.name,
  image: article.image,
  structuredData: {
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author.name
    }
  }
})
</script>
```

### Example 3: Product Page

```vue
<!-- pages/products/[id].vue -->
<script setup lang="ts">
const route = useRoute()
const product = await fetchProduct(route.params.id)

usePageSEO({
  title: product.name,
  description: product.description,
  type: 'product',
  image: product.image,
  structuredData: {
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: product.brand,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.inStock ? 'InStock' : 'OutOfStock'
    }
  }
})
</script>
```

### Example 4: Disable SEO for Staging

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['enfyra-nuxt-seo'],
  seo: {
    enabled: process.env.NODE_ENV === 'production', // Disable in staging
    siteUrl: 'https://example.com',
    // ... rest of config
  }
})
```

## Best Practices

1. **Always set `siteUrl`**: Required for canonical URLs and OG tags
2. **Use per-page config**: Configure SEO in `nuxt.config.ts` for static pages
3. **Override at runtime**: Use `usePageSEO()` for dynamic content
4. **Provide structured data**: Enhances search engine understanding
5. **Set appropriate `changefreq` and `priority`**: Helps search engines crawl efficiently
6. **Use unique titles and descriptions**: Avoid duplicate content
7. **Optimize images**: Use high-quality images for OG tags (1200x630px recommended)

## Troubleshooting

### SEO not working?

1. Check `seo.enabled` is `true` in `nuxt.config.ts`
2. Verify `siteUrl` is set correctly
3. Check browser console for errors
4. Ensure you're calling `usePageSEO()` in your pages

### Types not working?

1. Restart your TypeScript server
2. Run `yarn nuxt prepare` or `npm run prepare`
3. Check that `enfyra-nuxt-seo` is in your `node_modules`

### Robots.txt not generating?

1. Check `robots.enabled` is `true`
2. Verify the route `/robots.txt` is accessible
3. Check server logs for errors

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
