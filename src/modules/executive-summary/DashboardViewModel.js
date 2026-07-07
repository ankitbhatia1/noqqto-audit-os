export class DashboardViewModel {
  build(summary) {
    return {
      healthScore: summary.score,
      healthRating: summary.rating,
      confidence: summary.confidence,
      strongestCategory: summary.strongest?.name ?? null,
      weakestCategory: summary.weakest?.name ?? null,
      notMeasured: summary.notMeasured || [],
      recommendationCount: summary.recommendations?.length ?? 0,
      recommendations: summary.recommendations || [],
      categories: summary.categories,
      generatedAt: summary.generatedAt
    };
  }
}
