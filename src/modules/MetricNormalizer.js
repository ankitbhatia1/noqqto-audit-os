export class MetricNormalizer {
  normalize({ crawl = {}, lighthouse = {}, accessibility = {}, dns = {}, ssl = {}, headers = {} } = {}) {
    return {
      pageCount: crawl.totalPages || 0,
      title: crawl.pages?.[0]?.analysis?.title || '',
      metaDescription: crawl.pages?.[0]?.analysis?.metaDescription || '',
      internalLinks: crawl.pages?.[0]?.analysis?.internalLinks || 0,
      headings: crawl.pages?.[0]?.analysis?.headings || 0,
      imagesMissingAlt: crawl.pages?.[0]?.analysis?.imagesMissingAlt || 0,
      performanceScore: lighthouse.performance || null,
      accessibilityScore: lighthouse.accessibility || null,
      seoScore: lighthouse.seo || null,
      sslAuthorized: ssl.authorized ?? null,
      tlsProtocol: ssl.protocol || null,
      dnsResolved: (dns.ipv4?.length || dns.ipv6?.length || 0) > 0,
      cacheControl: headers.cacheControl || null,
      hsts: headers.hsts || null,
      accessibilityViolations: accessibility.violations?.length || 0
    };
  }
}
