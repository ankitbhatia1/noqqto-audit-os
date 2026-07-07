import { describe, it, expect } from 'vitest';
import { AuditExecutionPipeline } from '../src/modules/AuditExecutionPipeline.js';
import { MetricNormalizer } from '../src/modules/MetricNormalizer.js';
import { HeaderInspector } from '../src/connectors/HeaderInspector.js';
import { StructuredDataParser } from '../src/connectors/StructuredDataParser.js';
import { TechnicalSEOService } from '../src/services/TechnicalSEOService.js';
import { ContentQualityService } from '../src/services/ContentQualityService.js';
import { PerformanceService } from '../src/services/PerformanceService.js';
import { AIVisibilityService } from '../src/services/AIVisibilityService.js';
import { KeywordService } from '../src/services/KeywordService.js';
import { AuthorityService } from '../src/services/AuthorityService.js';
import { BacklinkProfileService } from '../src/services/BacklinkProfileService.js';
import { OverallScoreService } from '../src/services/OverallScoreService.js';
import { RecommendationEngine } from '../src/services/RecommendationEngine.js';
import { RoadmapEngine } from '../src/services/RoadmapEngine.js';
import { ExecutiveSummaryBuilder } from '../src/modules/executive-summary/ExecutiveSummaryBuilder.js';
import { DashboardViewModel } from '../src/modules/executive-summary/DashboardViewModel.js';
import { AuditReportBuilder } from '../src/modules/reporting/AuditReportBuilder.js';
import { recommendationCatalog } from '../src/config/index.js';

const goodJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [{ '@type': 'Organization' }, { '@type': 'WebSite' }, { '@type': 'FAQPage' }]
});

const goodAnalysis = {
  title: 'Great page',
  metaDescription: 'A useful description',
  canonical: 'https://site.com/',
  h1: ['One clear H1'],
  headings: 18,
  images: 10,
  imagesMissingAlt: 0,
  imagesEmptyAlt: 1,
  internalLinks: 14,
  externalLinks: 3,
  wordCount: 1400,
  robots: 'index, follow',
  language: 'en',
  viewport: 'width=device-width',
  jsonLdBlocks: [goodJsonLd]
};

const goodHeaders = {
  'content-type': 'text/html',
  'content-encoding': 'br',
  'cache-control': 'public, max-age=3600',
  'strict-transport-security': 'max-age=63072000'
};

const stubCrawler = {
  async crawl(urls) {
    return {
      pages: urls.map((url) => ({ url, finalUrl: url, status: 200, headers: goodHeaders, analysis: { ...goodAnalysis } })),
      totalPages: urls.length,
      failedPages: 0,
      crawledAt: new Date().toISOString()
    };
  }
};

function buildPipeline(overrides = {}) {
  const recommendationEngine = new RecommendationEngine(recommendationCatalog);
  return new AuditExecutionPipeline({
    crawler: stubCrawler,
    sitemapFetcher: { fetch: async () => ({ exists: true, discoveredUrls: ['https://site.com/about', 'https://site.com/services'], isSitemapIndex: false }) },
    robotsFetcher: { fetch: async () => ({ exists: true, declaredSitemaps: ['https://site.com/sitemap.xml'] }) },
    sslInspector: { inspect: async () => ({ authorized: true, daysUntilExpiry: 180, protocol: 'TLSv1.3' }) },
    dnsInspector: { inspect: async () => ({ ipv4: ['93.184.216.34'], ipv6: [], mx: [], nameservers: [] }) },
    headerInspector: new HeaderInspector(),
    structuredDataParser: new StructuredDataParser(),
    lighthouseRunner: {
      run: async () => ({
        performance: 94,
        accessibility: 98,
        seo: 100,
        metrics: {
          'largest-contentful-paint': { numericValue: 1700 },
          'cumulative-layout-shift': { numericValue: 0.02 },
          'total-blocking-time': { numericValue: 90 }
        }
      })
    },
    metricNormalizer: new MetricNormalizer(),
    services: [
      new TechnicalSEOService(),
      new ContentQualityService(),
      new PerformanceService(),
      new AIVisibilityService(),
      new KeywordService(),
      new AuthorityService(),
      new BacklinkProfileService()
    ],
    reportBuilder: new AuditReportBuilder({
      executiveSummaryBuilder: new ExecutiveSummaryBuilder({ overallScoreService: new OverallScoreService(), recommendationEngine }),
      dashboardViewModel: new DashboardViewModel(),
      roadmapEngine: new RoadmapEngine(),
      recommendationEngine
    }),
    ...overrides
  });
}

describe('AuditExecutionPipeline end to end', () => {
  it('scores a healthy site as healthy', async () => {
    const report = await buildPipeline().execute(['https://site.com/']);
    expect(report.summary.score).toBeGreaterThanOrEqual(85);
    expect(['excellent', 'good']).toContain(report.summary.rating);
  });

  it('expands the crawl with same-host sitemap URLs', async () => {
    const report = await buildPipeline().execute(['https://site.com/'], { maxPages: 3 });
    expect(report.metadata.metrics.site.pagesAnalyzed).toBe(3);
  });

  it('reports judgment categories as not measured instead of failing them', async () => {
    const report = await buildPipeline().execute(['https://site.com/']);
    expect(report.summary.notMeasured).toContain('Keyword Optimization');
    expect(report.summary.notMeasured).toContain('Authority');
    expect(report.summary.notMeasured).toContain('Backlink Profile');
    const keywords = report.summary.categories.find((c) => c.id === 'keywords');
    expect(keywords.score).toBeNull();
    expect(keywords.rating).toBe('not-measured');
  });

  it('scores judgment categories when external data is supplied', async () => {
    const report = await buildPipeline().execute(['https://site.com/'], {
      external: { authority: { authority: 62, referringDomains: 210, spamScore: 3 } }
    });
    const authority = report.summary.categories.find((c) => c.id === 'authority');
    expect(authority.score).toBe(100);
    expect(report.summary.notMeasured).not.toContain('Authority');
  });

  it('degrades gracefully when only the crawler is available', async () => {
    const report = await buildPipeline({
      sitemapFetcher: null,
      robotsFetcher: null,
      sslInspector: null,
      dnsInspector: null,
      headerInspector: null,
      structuredDataParser: null,
      lighthouseRunner: null
    }).execute(['https://site.com/']);
    expect(report.summary.score).not.toBeNull();
    const technical = report.summary.categories.find((c) => c.id === 'technical-seo');
    expect(technical.evidence.find((e) => e.metric === 'sslValid').status).toBe('not-measured');
    expect(technical.confidence).toBeLessThan(50);
  });

  it('produces a populated roadmap for a weak site', async () => {
    const weakCrawler = {
      async crawl(urls) {
        return {
          pages: urls.map((url) => ({
            url,
            finalUrl: url,
            status: 200,
            headers: { 'content-type': 'text/html' },
            analysis: { ...goodAnalysis, metaDescription: '', wordCount: 150, internalLinks: 1, jsonLdBlocks: [] }
          })),
          totalPages: urls.length,
          failedPages: 0,
          crawledAt: new Date().toISOString()
        };
      }
    };
    const report = await buildPipeline({ crawler: weakCrawler }).execute(['https://site.com/']);
    const totalRecs = Object.values(report.roadmap).flat().length;
    expect(totalRecs).toBeGreaterThan(3);
    expect(report.summary.score).toBeLessThan(85);
  });
});
