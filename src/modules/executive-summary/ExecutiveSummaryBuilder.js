export class ExecutiveSummaryBuilder {
  constructor({ overallScoreService, recommendationEngine }) {
    this.overallScoreService = overallScoreService;
    this.recommendationEngine = recommendationEngine;
  }

  build(scoreCards = []) {
    const summary = this.overallScoreService.calculate(scoreCards);
    const recommendationKeys = summary.categories.flatMap(c => c.recommendations || []);

    return {
      ...summary,
      recommendations: this.recommendationEngine.resolve(recommendationKeys),
      generatedAt: new Date().toISOString()
    };
  }
}
