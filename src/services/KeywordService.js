import { makeCard, bool } from '../models/scoring-utils.js';

/**
 * Keyword checks are judgment calls that no HTML connector can produce.
 * They stay "not measured" until keyword data is supplied through the
 * pipeline's `external.keywords` input (Semrush export, analyst review,
 * or a future LLM analysis step).
 */
export class KeywordService {
  calculate(metrics = {}) {
    const k = metrics.keywords || {};
    return makeCard({
      id: 'keywords',
      name: 'Keyword Optimization',
      recPrefix: 'keywords.',
      checks: {
        primaryKeyword: bool(k.primaryKeyword),
        titleOptimization: bool(k.titleOptimization),
        headingOptimization: bool(k.headingOptimization),
        searchIntent: bool(k.searchIntent),
        semanticCoverage: bool(k.semanticCoverage),
        entityCoverage: bool(k.entityCoverage),
        noCannibalization: k.keywordCannibalization == null ? null : k.keywordCannibalization !== true
      }
    });
  }
}
