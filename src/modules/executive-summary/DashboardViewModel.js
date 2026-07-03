export class DashboardViewModel {
  build(summary){
    return {
      healthScore: summary.score,
      healthRating: summary.rating,
      confidence: summary.confidence,
      strongestCategory: summary.strongest?.name,
      weakestCategory: summary.weakest?.name,
      recommendationCount: summary.recommendations.length,
      recommendations: summary.recommendations,
      categories: summary.categories,
      generatedAt: summary.generatedAt
    };
  }
}
