/**
 * Turns raw connector outputs into the unified metric schema documented in
 * docs/METRIC_SCHEMA.md. Every metric is either a measured value or null.
 * Null always means "not measured", never "bad".
 */
export class MetricNormalizer {
  normalize({ crawl = null, sitemap = null, robots = null, ssl = null, dns = null, headers = null, lighthouse = null, external = {} } = {}) {
    const pages = (crawl?.pages || []).filter((p) => p.analysis && p.status >= 200 && p.status < 400);
    const n = pages.length;

    const frac = (pred) => (n === 0 ? null : pages.filter(pred).length / n);
    const avg = (fn) => (n === 0 ? null : pages.reduce((t, p) => t + fn(p), 0) / n);

    const totalImages = pages.reduce((t, p) => t + (p.analysis.images || 0), 0);
    const missingAlt = pages.reduce((t, p) => t + (p.analysis.imagesMissingAlt || 0), 0);

    // Structured data is only "measured" if the pipeline actually parsed it.
    const sdMeasured = pages.some((p) => p.structuredData != null);
    const sdCoverage = sdMeasured ? frac((p) => (p.structuredData?.totalSchemas || 0) > 0) : null;
    const sdAny = (key) => (sdMeasured ? pages.some((p) => Boolean(p.structuredData?.[key])) : null);

    const lhAudit = (id) => lighthouse?.metrics?.[id]?.numericValue ?? null;

    const derived = {
      site: {
        pagesCrawled: crawl?.totalPages ?? 0,
        pagesAnalyzed: n,
        pagesFailed: crawl?.failedPages ?? 0,
        crawledAt: crawl?.crawledAt ?? null
      },
      technical: {
        https: n === 0 ? null : pages.every((p) => (p.finalUrl || p.url || '').startsWith('https://')),
        sslAuthorized: ssl ? Boolean(ssl.authorized) : null,
        sslDaysUntilExpiry: ssl?.daysUntilExpiry ?? null,
        dnsResolved: dns ? (dns.ipv4?.length || 0) + (dns.ipv6?.length || 0) > 0 : null,
        robotsTxt: robots ? Boolean(robots.exists) : null,
        sitemap: sitemap || robots ? Boolean(sitemap?.exists || robots?.declaredSitemaps?.length > 0) : null,
        indexableRatio: frac((p) => !/noindex/i.test(p.analysis.robots || '')),
        canonicalCoverage: frac((p) => Boolean(p.analysis.canonical)),
        structuredDataCoverage: sdCoverage,
        hsts: headers ? Boolean(headers.hsts) : null
      },
      content: {
        titleCoverage: frac((p) => Boolean(p.analysis.title)),
        metaDescriptionCoverage: frac((p) => Boolean(p.analysis.metaDescription)),
        h1Coverage: frac((p) => (p.analysis.h1?.length || 0) >= 1),
        avgWordCount: avg((p) => p.analysis.wordCount || 0),
        avgInternalLinks: avg((p) => p.analysis.internalLinks || 0),
        imageAltCoverage: n === 0 || totalImages === 0 ? null : (totalImages - missingAlt) / totalImages,
        languageDeclared: n === 0 ? null : pages.some((p) => Boolean(p.analysis.language))
      },
      performance: {
        lighthousePerformance: lighthouse?.performance ?? null,
        lighthouseAccessibility: lighthouse?.accessibility ?? null,
        lighthouseSeo: lighthouse?.seo ?? null,
        lcpMs: lhAudit('largest-contentful-paint'),
        cls: lhAudit('cumulative-layout-shift'),
        tbtMs: lhAudit('total-blocking-time'),
        cacheControl: headers ? Boolean(headers.cacheControl) : null,
        compression: headers ? Boolean(headers.contentEncoding) : null
      },
      aiVisibility: {
        hasOrganizationSchema: sdAny('hasOrganization'),
        hasWebSiteSchema: sdAny('hasWebSite'),
        hasFAQSchema: sdAny('hasFAQPage'),
        structuredDataCoverage: sdCoverage
      },
      keywords: {},
      authority: {},
      backlinks: {}
    };

    // External data (Semrush exports, analyst judgment, LLM analysis)
    // overlays the derived metrics per category.
    const merged = {};
    for (const category of Object.keys(derived)) {
      merged[category] = { ...derived[category], ...(external[category] || {}) };
    }
    return merged;
  }
}
