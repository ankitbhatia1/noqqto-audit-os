import { describe, it, expect } from 'vitest';
import { TechnicalSEOService } from '../src/services/TechnicalSEOService.js';
import { ContentQualityService } from '../src/services/ContentQualityService.js';
import { PerformanceService } from '../src/services/PerformanceService.js';
import { AIVisibilityService } from '../src/services/AIVisibilityService.js';
import { KeywordService } from '../src/services/KeywordService.js';
import { AuthorityService } from '../src/services/AuthorityService.js';
import { BacklinkProfileService } from '../src/services/BacklinkProfileService.js';
import { OverallScoreService } from '../src/services/OverallScoreService.js';
import { recommendationCatalog } from '../src/config/index.js';

const services = [
  new TechnicalSEOService(),
  new ContentQualityService(),
  new PerformanceService(),
  new AIVisibilityService(),
  new KeywordService(),
  new AuthorityService(),
  new BacklinkProfileService()
];

const allFailingMetrics = {
  technical: { https: false, sslAuthorized: false, dnsResolved: false, robotsTxt: false, sitemap: false, indexableRatio: 0, canonicalCoverage: 0, structuredDataCoverage: 0, hsts: false },
  content: { titleCoverage: 0, metaDescriptionCoverage: 0, h1Coverage: 0, avgWordCount: 100, avgInternalLinks: 1, imageAltCoverage: 0, languageDeclared: false },
  performance: { lighthousePerformance: 10, lcpMs: 9000, cls: 0.6, tbtMs: 2000, cacheControl: false, compression: false },
  aiVisibility: { hasOrganizationSchema: false, hasWebSiteSchema: false, hasFAQSchema: false, structuredDataCoverage: 0, aiOverviewReady: false, answerEngineOptimized: false, citationReady: false, conversationalCoverage: false, entityCoverage: false },
  keywords: { primaryKeyword: false, titleOptimization: false, headingOptimization: false, searchIntent: false, semanticCoverage: false, entityCoverage: false, keywordCannibalization: true },
  authority: { authority: 10, referringDomains: 5, spamScore: 80 },
  backlinks: { referringDomains: 5, domainDiversity: false, toxicLinks: true, anchorDistribution: false, linkVelocity: false, followRatio: false }
};

describe('scoring services', () => {
  it('report not-measured with null score when given no data', () => {
    for (const service of services) {
      const card = service.calculate({});
      expect(card.score).toBeNull();
      expect(card.rating).toBe('not-measured');
      expect(card.recommendations).toHaveLength(0);
    }
  });

  it('score only the measured subset and reduce confidence for the rest', () => {
    const card = new TechnicalSEOService().calculate({ technical: { https: true, sitemap: false } });
    expect(card.score).toBe(50);
    expect(card.measuredChecks).toBe(2);
    expect(card.totalChecks).toBe(9);
    expect(card.confidence).toBeLessThan(30);
  });

  it('every emittable recommendation key exists in the catalog', () => {
    for (const service of services) {
      const card = service.calculate(allFailingMetrics);
      expect(card.recommendations.length).toBeGreaterThan(0);
      for (const key of card.recommendations) {
        expect(recommendationCatalog[key], `missing catalog entry for ${key}`).toBeDefined();
      }
    }
  });
});

describe('OverallScoreService', () => {
  it('excludes unmeasured cards instead of counting them as zero', () => {
    const cards = [
      { name: 'A', score: 90, weight: 20, confidence: 90 },
      { name: 'B', score: 70, weight: 20, confidence: 90 },
      { name: 'C', score: null, weight: 60, confidence: 0 }
    ];
    const summary = new OverallScoreService().calculate(cards);
    expect(summary.score).toBe(80);
    expect(summary.notMeasured).toEqual(['C']);
    expect(summary.strongest.name).toBe('A');
    expect(summary.weakest.name).toBe('B');
  });
});
