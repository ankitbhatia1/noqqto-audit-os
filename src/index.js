import { PageFetcher } from './connectors/PageFetcher.js';
import { HTMLParser } from './connectors/HTMLParser.js';
import { InternalCrawler } from './connectors/InternalCrawler.js';
import { SitemapFetcher } from './connectors/SitemapFetcher.js';
import { RobotsFetcher } from './connectors/RobotsFetcher.js';
import { SSLInspector } from './connectors/SSLInspector.js';
import { DNSInspector } from './connectors/DNSInspector.js';
import { HeaderInspector } from './connectors/HeaderInspector.js';
import { StructuredDataParser } from './connectors/StructuredDataParser.js';
import { LighthouseRunner } from './connectors/LighthouseRunner.js';
import { MetricNormalizer } from './modules/MetricNormalizer.js';
import { AuditExecutionPipeline } from './modules/AuditExecutionPipeline.js';
import { TechnicalSEOService } from './services/TechnicalSEOService.js';
import { ContentQualityService } from './services/ContentQualityService.js';
import { PerformanceService } from './services/PerformanceService.js';
import { AIVisibilityService } from './services/AIVisibilityService.js';
import { KeywordService } from './services/KeywordService.js';
import { AuthorityService } from './services/AuthorityService.js';
import { BacklinkProfileService } from './services/BacklinkProfileService.js';
import { OverallScoreService } from './services/OverallScoreService.js';
import { RecommendationEngine } from './services/RecommendationEngine.js';
import { RoadmapEngine } from './services/RoadmapEngine.js';
import { ExecutiveSummaryBuilder } from './modules/executive-summary/ExecutiveSummaryBuilder.js';
import { DashboardViewModel } from './modules/executive-summary/DashboardViewModel.js';
import { AuditReportBuilder } from './modules/reporting/AuditReportBuilder.js';
import { recommendationCatalog } from './config/index.js';

/**
 * Wires a ready-to-run audit pipeline with sensible defaults.
 * Lighthouse is opt-in because it requires a local Chrome install.
 */
export function createAuditPipeline({ lighthouse = false, timeoutMs = 15000 } = {}) {
  const pageFetcher = new PageFetcher({ timeoutMs });
  const htmlParser = new HTMLParser();
  const overallScoreService = new OverallScoreService();
  const recommendationEngine = new RecommendationEngine(recommendationCatalog);

  return new AuditExecutionPipeline({
    crawler: new InternalCrawler({ pageFetcher, htmlParser }),
    sitemapFetcher: new SitemapFetcher(),
    robotsFetcher: new RobotsFetcher(),
    sslInspector: new SSLInspector(),
    dnsInspector: new DNSInspector(),
    headerInspector: new HeaderInspector(),
    structuredDataParser: new StructuredDataParser(),
    lighthouseRunner: lighthouse ? new LighthouseRunner() : null,
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
      executiveSummaryBuilder: new ExecutiveSummaryBuilder({ overallScoreService, recommendationEngine }),
      dashboardViewModel: new DashboardViewModel(),
      roadmapEngine: new RoadmapEngine(),
      recommendationEngine
    })
  });
}

export { PageFetcher, HTMLParser, InternalCrawler, SitemapFetcher, RobotsFetcher, SSLInspector, DNSInspector, HeaderInspector, StructuredDataParser, LighthouseRunner };
export { MetricNormalizer, AuditExecutionPipeline };
export { TechnicalSEOService, ContentQualityService, PerformanceService, AIVisibilityService, KeywordService, AuthorityService, BacklinkProfileService, OverallScoreService, RecommendationEngine, RoadmapEngine };
export { ExecutiveSummaryBuilder, DashboardViewModel, AuditReportBuilder };
export { ScoreCard, ScoreRating } from './models/ScoreCard.js';
