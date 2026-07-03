export class AuditExecutionPipeline {
  constructor({ crawler, technicalSEOService, contentQualityService, keywordService, aiVisibilityService, performanceService, overallScoreService, reportBuilder }) {
    Object.assign(this, { crawler, technicalSEOService, contentQualityService, keywordService, aiVisibilityService, performanceService, overallScoreService, reportBuilder });
  }

  async execute(seedUrls, metadata = {}) {
    const crawl = await this.crawler.crawl(seedUrls);
    const metrics = crawl.pages[0]?.analysis || {};

    const scoreCards = [
      this.technicalSEOService.calculate(metrics),
      this.contentQualityService.calculate(metrics),
      this.keywordService.calculate(metrics),
      this.aiVisibilityService.calculate(metrics),
      this.performanceService.calculate(metrics)
    ];

    const summary = this.overallScoreService.calculate(scoreCards);
    return this.reportBuilder.build(scoreCards, { ...metadata, crawl, summary });
  }
}
