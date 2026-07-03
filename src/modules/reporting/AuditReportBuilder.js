export class AuditReportBuilder {
  constructor({ executiveSummaryBuilder, dashboardViewModel, roadmapEngine, recommendationEngine }) {
    this.executiveSummaryBuilder = executiveSummaryBuilder;
    this.dashboardViewModel = dashboardViewModel;
    this.roadmapEngine = roadmapEngine;
    this.recommendationEngine = recommendationEngine;
  }

  build(scoreCards = [], metadata = {}) {
    const summary = this.executiveSummaryBuilder.build(scoreCards);
    return {
      metadata,
      summary,
      dashboard: this.dashboardViewModel.build(summary),
      roadmap: this.roadmapEngine.build(scoreCards, this.recommendationEngine),
      generatedAt: new Date().toISOString(),
      version: '0.1.0'
    };
  }
}
