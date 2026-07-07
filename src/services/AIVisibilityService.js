import { makeCard, bool } from '../models/scoring-utils.js';

export class AIVisibilityService {
  calculate(metrics = {}) {
    const a = metrics.aiVisibility || {};
    return makeCard({
      id: 'ai-visibility',
      name: 'AI Visibility',
      recPrefix: 'ai.',
      checks: {
        organizationSchema: bool(a.hasOrganizationSchema),
        webSiteSchema: bool(a.hasWebSiteSchema),
        faqSchema: bool(a.hasFAQSchema),
        structuredContent: a.structuredDataCoverage == null ? null : a.structuredDataCoverage >= 0.5,
        aiOverviewReady: bool(a.aiOverviewReady),
        answerEngineOptimized: bool(a.answerEngineOptimized),
        citationReady: bool(a.citationReady),
        conversationalCoverage: bool(a.conversationalCoverage),
        entityCoverage: bool(a.entityCoverage)
      }
    });
  }
}
