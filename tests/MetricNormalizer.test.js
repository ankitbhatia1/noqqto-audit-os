import { describe, it, expect } from 'vitest';
import { MetricNormalizer } from '../src/modules/MetricNormalizer.js';

const page = (overrides = {}, analysisOverrides = {}) => ({
  url: 'https://example.com/',
  finalUrl: 'https://example.com/',
  status: 200,
  structuredData: { totalSchemas: 1, hasOrganization: true, hasWebSite: false, hasFAQPage: false },
  analysis: {
    title: 'Title',
    metaDescription: 'Desc',
    canonical: 'https://example.com/',
    h1: ['One'],
    headings: 10,
    images: 4,
    imagesMissingAlt: 1,
    internalLinks: 8,
    wordCount: 1000,
    robots: 'index, follow',
    language: 'en',
    ...analysisOverrides
  },
  ...overrides
});

describe('MetricNormalizer', () => {
  const normalizer = new MetricNormalizer();

  it('aggregates across all analyzed pages, not just the first', () => {
    const crawl = {
      totalPages: 2,
      failedPages: 0,
      pages: [page(), page({}, { metaDescription: '', wordCount: 400 })]
    };
    const m = normalizer.normalize({ crawl });
    expect(m.content.metaDescriptionCoverage).toBe(0.5);
    expect(m.content.avgWordCount).toBe(700);
    expect(m.content.imageAltCoverage).toBe(0.75);
    expect(m.technical.https).toBe(true);
  });

  it('excludes failed pages from aggregation', () => {
    const crawl = { totalPages: 2, failedPages: 1, pages: [page(), { url: 'https://example.com/x', status: 0, error: 'timeout', analysis: null }] };
    const m = normalizer.normalize({ crawl });
    expect(m.site.pagesAnalyzed).toBe(1);
    expect(m.content.titleCoverage).toBe(1);
  });

  it('reports null, never false, for connectors that did not run', () => {
    const m = normalizer.normalize({ crawl: { totalPages: 1, failedPages: 0, pages: [page({ structuredData: null })] } });
    expect(m.technical.sslAuthorized).toBeNull();
    expect(m.technical.dnsResolved).toBeNull();
    expect(m.technical.robotsTxt).toBeNull();
    expect(m.technical.sitemap).toBeNull();
    expect(m.technical.structuredDataCoverage).toBeNull();
    expect(m.performance.lighthousePerformance).toBeNull();
    expect(m.performance.cacheControl).toBeNull();
    expect(m.aiVisibility.hasOrganizationSchema).toBeNull();
  });

  it('merges external metrics over derived ones', () => {
    const m = normalizer.normalize({
      crawl: { totalPages: 1, failedPages: 0, pages: [page()] },
      external: { keywords: { primaryKeyword: true }, authority: { authority: 55 } }
    });
    expect(m.keywords.primaryKeyword).toBe(true);
    expect(m.authority.authority).toBe(55);
  });
});
