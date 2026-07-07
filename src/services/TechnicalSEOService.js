import { makeCard, bool, atLeast } from '../models/scoring-utils.js';

export class TechnicalSEOService {
  calculate(metrics = {}) {
    const t = metrics.technical || {};
    return makeCard({
      id: 'technical-seo',
      name: 'Technical SEO',
      recPrefix: 'technical.',
      checks: {
        https: bool(t.https),
        sslValid: bool(t.sslAuthorized),
        dnsResolved: bool(t.dnsResolved),
        robotsTxt: bool(t.robotsTxt),
        sitemap: bool(t.sitemap),
        indexable: atLeast(t.indexableRatio, 0.8),
        canonical: atLeast(t.canonicalCoverage, 0.8),
        structuredData: t.structuredDataCoverage == null ? null : t.structuredDataCoverage > 0,
        hsts: bool(t.hsts)
      },
      metadata: { sslDaysUntilExpiry: t.sslDaysUntilExpiry ?? null }
    });
  }
}
