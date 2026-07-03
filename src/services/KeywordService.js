import { ScoreCard, ScoreRating } from '../models/ScoreCard.js';

export class KeywordService {
  calculate(metrics = {}) {
    const checks = {
      primaryKeyword: !!metrics.primaryKeyword,
      titleOptimization: !!metrics.titleOptimization,
      headingOptimization: !!metrics.headingOptimization,
      semanticCoverage: !!metrics.semanticCoverage,
      searchIntent: !!metrics.searchIntent,
      entityCoverage: !!metrics.entityCoverage,
      keywordCannibalization: metrics.keywordCannibalization !== true
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const score = Math.round((passed / Object.keys(checks).length) * 100);

    return new ScoreCard({
      id: 'keywords',
      name: 'Keyword Optimization',
      score,
      weight: 15,
      confidence: 90,
      rating: this.#rating(score),
      evidence: Object.entries(checks).map(([metric, ok]) => ({ metric, status: ok ? 'pass' : 'fail' })),
      recommendations: Object.entries(checks).filter(([, ok]) => !ok).map(([metric]) => `keywords.${metric}`)
    });
  }

  #rating(score) {
    if (score >= 90) return ScoreRating.EXCELLENT;
    if (score >= 75) return ScoreRating.GOOD;
    if (score >= 60) return ScoreRating.AVERAGE;
    if (score >= 40) return ScoreRating.POOR;
    return ScoreRating.CRITICAL;
  }
}
