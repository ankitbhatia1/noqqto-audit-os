# Unified Metric Schema

The `MetricNormalizer` is the only component allowed to translate raw connector output into metrics. Scoring services consume this schema and nothing else. Every value is either measured or `null`. **`null` always means "not measured", never "failing".** Services exclude unmeasured checks from the score and lower the card's confidence instead.

## site

| Key | Type | Source |
| --- | --- | --- |
| pagesCrawled | number | InternalCrawler |
| pagesAnalyzed | number | pages with a 2xx/3xx status and parsed HTML |
| pagesFailed | number | InternalCrawler |
| crawledAt | ISO string | InternalCrawler |

## technical (TechnicalSEOService)

| Key | Type | Source |
| --- | --- | --- |
| https | bool or null | every analyzed page resolves to https |
| sslAuthorized | bool or null | SSLInspector |
| sslDaysUntilExpiry | number or null | SSLInspector |
| dnsResolved | bool or null | DNSInspector |
| robotsTxt | bool or null | RobotsFetcher |
| sitemap | bool or null | SitemapFetcher or robots.txt Sitemap directives |
| indexableRatio | 0 to 1 or null | share of pages without meta noindex |
| canonicalCoverage | 0 to 1 or null | share of pages with a canonical tag |
| structuredDataCoverage | 0 to 1 or null | share of pages with at least one schema (StructuredDataParser) |
| hsts | bool or null | HeaderInspector |

## content (ContentQualityService)

| Key | Type | Source |
| --- | --- | --- |
| titleCoverage | 0 to 1 or null | HTMLParser |
| metaDescriptionCoverage | 0 to 1 or null | HTMLParser |
| h1Coverage | 0 to 1 or null | pages with at least one h1 |
| avgWordCount | number or null | HTMLParser |
| avgInternalLinks | number or null | HTMLParser |
| imageAltCoverage | 0 to 1 or null | 1 minus missing alt share; null when no images |
| languageDeclared | bool or null | html lang attribute |

## performance (PerformanceService)

| Key | Type | Source |
| --- | --- | --- |
| lighthousePerformance / lighthouseAccessibility / lighthouseSeo | 0 to 100 or null | LighthouseRunner |
| lcpMs, cls, tbtMs | number or null | Lighthouse audits |
| cacheControl | bool or null | HeaderInspector |
| compression | bool or null | Content-Encoding header |

## aiVisibility (AIVisibilityService)

Derived: `hasOrganizationSchema`, `hasWebSiteSchema`, `hasFAQSchema`, `structuredDataCoverage` (StructuredDataParser across pages).

Judgment metrics that require external input: `aiOverviewReady`, `answerEngineOptimized`, `citationReady`, `conversationalCoverage`, `entityCoverage`.

## keywords, authority, backlinks

Entirely external. No HTML connector can honestly measure keyword targeting, domain authority, or link profiles. Supply them at execution time and the corresponding cards switch from "not measured" to scored:

```js
await pipeline.execute(['https://example.com'], {
  external: {
    keywords: { primaryKeyword: true, titleOptimization: true, searchIntent: false },
    authority: { authority: 42, referringDomains: 180, spamScore: 4 },
    backlinks: { referringDomains: 180, domainDiversity: true, toxicLinks: false }
  }
});
```

Planned sources: Semrush or Moz exports for authority and backlinks, and an LLM analysis step for the keyword and AI visibility judgment metrics.
